
const debug = require('debug');
const SSH = require('ssh2').Client;
const CIDRMatcher = require('cidr-matcher');
const validator = require('validator');
const dnsPromises = require('dns').promises;
const util = require('util');
const { webssh2debug, auditLog, logError } = require('./logging');
const axios = require('axios');

let dataBuffer = ""; // Initialize with the starting line
let sendTimer = null; // Reference to the timer

// Assuming dataBuffer and sendTimer are declared somewhere in the scope


/**
 * parse conn errors
 * @param {object} socket Socket object
 * @param {object} err    Error object
 */
function connError(socket, err) {
  let msg = util.inspect(err);
  const { session } = socket.request;
  if (err?.level === 'client-authentication') {
    msg = `Authentication failure user=${session.username} from=${socket.handshake.address}`;
    socket.emit('allowreauth', session.ssh.allowreauth);
    socket.emit('reauth');
  }
  if (err?.code === 'ENOTFOUND') {
    msg = `Host not found: ${err.hostname}`;
  }
  if (err?.level === 'client-timeout') {
    msg = `Connection Timeout: ${session.ssh.host}`;
  }
  logError(socket, 'CONN ERROR', msg);
}

/**
 * check ssh host is in allowed subnet
 * @param {object} socket Socket information
 */
async function checkSubnet(socket) {
  let ipaddress = socket.request.session.ssh.host;
  if (!validator.isIP(`${ipaddress}`)) {
    try {
      const result = await dnsPromises.lookup(socket.request.session.ssh.host);
      ipaddress = result.address;
    } catch (err) {
      logError(
        socket,
        'CHECK SUBNET',
        `${err.code}: ${err.hostname} user=${socket.request.session.username} from=${socket.handshake.address}`
      );
      socket.emit('ssherror', '404 HOST IP NOT FOUND');
      socket.disconnect(true);
      return;
    }
  }

  const matcher = new CIDRMatcher(socket.request.session.ssh.allowedSubnets);
  if (!matcher.contains(ipaddress)) {
    logError(
      socket,
      'CHECK SUBNET',
      `Requested host ${ipaddress} outside configured subnets / REJECTED user=${socket.request.session.username} from=${socket.handshake.address}`
    );
    socket.emit('ssherror', '401 UNAUTHORIZED');
    socket.disconnect(true);
  }
}

// public
module.exports = function appSocket(socket) {
  let login = false;

  socket.once('disconnecting', (reason) => {
    webssh2debug(socket, `SOCKET DISCONNECTING: ${reason}`);
    if (login === true) {
      auditLog(
        socket,
        `LOGOUT user=${socket.request.session.username} from=${socket.handshake.address} host=${socket.request.session.ssh.host}:${socket.request.session.ssh.port}`
      );
      login = false;
    }
  });

  async function setupConnection() {
    // if websocket connection arrives without an express session, kill it
    if (!socket.request.session) {
      socket.emit('401 UNAUTHORIZED');
      webssh2debug(socket, 'SOCKET: No Express Session / REJECTED');
      socket.disconnect(true);
      return;
    }

    // If configured, check that requsted host is in a permitted subnet
    if (socket.request.session?.ssh?.allowedSubnets?.length > 0) {
      checkSubnet(socket);
    }

    const conn = new SSH();

    conn.on('banner', (data) => {
      // need to convert to cr/lf for proper formatting
      socket.emit('data', data.replace(/\r?\n/g, '\r\n').toString('utf-8'));
    });

    conn.on('handshake', (data => {
      socket.emit('setTerminalOpts', socket.request.session.ssh.terminal);
      socket.emit('menu');
      socket.emit('allowreauth', socket.request.session.ssh.allowreauth);
      socket.emit('title', `ssh://${socket.request.session.ssh.host}`);
      if (socket.request.session.ssh.header.background)
        socket.emit('headerBackground', socket.request.session.ssh.header.background);
      if (socket.request.session.ssh.header.name)
        socket.emit('header', socket.request.session.ssh.header.name);
      socket.emit(
        'footer',
        `ssh://${socket.request.session.username}@${socket.request.session.ssh.host}:${socket.request.session.ssh.port}`
      );
    }));

    conn.on('ready', () => {
      webssh2debug(
        socket,
        `CONN READY: LOGIN: user=${socket.request.session.username} from=${socket.handshake.address} host=${socket.request.session.ssh.host} port=${socket.request.session.ssh.port} allowreplay=${socket.request.session.ssh.allowreplay} term=${socket.request.session.ssh.term}`
      );
      auditLog(
        socket,
        `LOGIN user=${socket.request.session.username} from=${socket.handshake.address} host=${socket.request.session.ssh.host}:${socket.request.session.ssh.port}`
      );
      login = true;
      socket.emit('status', 'SSH CONNECTION ESTABLISHED');
      socket.emit('statusBackground', 'green');
      socket.emit('allowreplay', socket.request.session.ssh.allowreplay);
      const { term, cols, rows } = socket.request.session.ssh;
      conn.shell({ term, cols, rows }, (err, stream) => {
        if (err) {
          logError(socket, `EXEC ERROR`, err);
          conn.end();
          socket.disconnect(true);
          return;
        }
        socket.once('disconnect', (reason) => {
          webssh2debug(socket, `CLIENT SOCKET DISCONNECT: ${util.inspect(reason)}`);
          conn.end();
          socket.request.session.destroy();
        });
        socket.on('error', (errMsg) => {
          webssh2debug(socket, `SOCKET ERROR: ${errMsg}`);
          logError(socket, 'SOCKET ERROR', errMsg);
          conn.end();
          socket.disconnect(true);
        });
        socket.on('control', (controlData) => {
          if (controlData === 'replayCredentials' && socket.request.session.ssh.allowreplay) {
            stream.write(`${socket.request.session.userpassword}\n`);
          }
          if (controlData === 'reauth' && socket.request.session.username && login === true) {
            auditLog(
              socket,
              `LOGOUT user=${socket.request.session.username} from=${socket.handshake.address} host=${socket.request.session.ssh.host}:${socket.request.session.ssh.port}`
            );
            login = false;
            conn.end();
            socket.disconnect(true);
          }
          webssh2debug(socket, `SOCKET CONTROL: ${controlData}`);
        });
        socket.on('resize', (data) => {
          stream.setWindow(data.rows, data.cols);
          webssh2debug(socket, `SOCKET RESIZE: ${JSON.stringify([data.rows, data.cols])}`);
        });
        socket.on('data', (data) => {
          stream.write(data);
        });



        stream.on('data', (data) => {
          socket.emit('data', data.toString('utf-8'));
          const outputData = data.toString('utf-8');
          dataBuffer += outputData; // Append data to buffer

          // Initialize timer if not already set
          if (!sendTimer) {
            sendTimer = setTimeout(() => {
              if (dataBuffer.trim()) {
                // Split buffer into lines
                const lines = dataBuffer.split('\n');
                if (lines.length > 2) {
                  lines.splice(-2); // Remove last two lines before appending the ending line
                }

                const modifiedDataBuffer = lines.join('\n');

                sendDataToAnotherServer(modifiedDataBuffer);
                dataBuffer = "";
              }
              sendTimer = null; // Reset timer reference
            }, 3000);
          }
        });


        stream.on('close', (code, signal) => {
          webssh2debug(socket, `STREAM CLOSE: ${util.inspect([code, signal])}`);
          if (socket.request.session?.username && login === true) {
            auditLog(
              socket,
              `LOGOUT user=${socket.request.session.username} from=${socket.handshake.address} host=${socket.request.session.ssh.host}:${socket.request.session.ssh.port}`
            );
            login = false;
          }
          if (code !== 0 && typeof code !== 'undefined')
            logError(socket, 'STREAM CLOSE', util.inspect({ message: [code, signal] }));
          socket.disconnect(true);
          conn.end();
        });
        stream.stderr.on('data', (data) => {
          console.error(`STDERR: ${data}`);
        });
      });
    });

    conn.on('end', (err) => {
      if (err) logError(socket, 'CONN END BY HOST', err);
      webssh2debug(socket, 'CONN END BY HOST');
      socket.disconnect(true);
    });
    conn.on('close', (err) => {
      if (err) logError(socket, 'CONN CLOSE', err);
      webssh2debug(socket, 'CONN CLOSE');
      socket.disconnect(true);
    });
    conn.on('error', (err) => connError(socket, err));

    conn.on('keyboard-interactive', (_name, _instructions, _instructionsLang, _prompts, finish) => {
      webssh2debug(socket, 'CONN keyboard-interactive');
      finish([socket.request.session.userpassword]);
    });
    if (
      socket.request.session.username &&
      (socket.request.session.userpassword || socket.request.session.privatekey) &&
      socket.request.session.ssh
    ) {
      // console.log('hostkeys: ' + hostkeys[0].[0])
      const { ssh } = socket.request.session;
      ssh.username = socket.request.session.username;
      ssh.password = socket.request.session.userpassword;
      ssh.tryKeyboard = true;
      ssh.debug = debug('ssh2');
      conn.connect(ssh);
    } else {
      webssh2debug(
        socket,
        `CONN CONNECT: Attempt to connect without session.username/password or session varialbles defined, potentially previously abandoned client session. disconnecting websocket client.\r\nHandshake information: \r\n  ${util.inspect(
          socket.handshake
        )}`
      );
      socket.emit('ssherror', 'WEBSOCKET ERROR - Refresh the browser and try again');
      socket.request.session.destroy();
      socket.disconnect(true);
    }
  }
  setupConnection();
};
async function checkAndSendData(dataString) {
  if (dataString.endsWith('\n')) {
    // Remove the trailing newline character for the data to be processed or logged without it
    const processedData = dataString.trim();
    await sendDataToAnotherServer(processedData);
  }
}

// Function to send data to another server
async function sendDataToAnotherServer(dataString) {
  // Check if dataString is empty, null, or does not contain any alphanumeric characters
  if (!dataString || dataString.trim() === '' || !/[a-zA-Z0-9]/.test(dataString)) {
    console.log('No meaningful data to send');
    return; // Exit the function early
  }

  try {
    // Proceed with sending the data
    const response = await axios.post('http://localhost:8000/data', {
      data: dataString
    });

    console.log('Data sent successfully', response.data.toString());
  } catch (error) {
    console.error('Error sending data to another server', error.message);
  }
}



// async function sendDataToOpenAI(dataString) {
//   if (!dataString || dataString.trim() === '') {
//     console.log('No data to send to AI');
//     return; // Exit the function early if data is empty or only whitespace
//   }

//   try {
//     const openAiApiUrl = 'https://api.openai.com/v1/completions';
//     const apiKey = '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';

//     const response = await axios.post(openAiApiUrl, {
//       model: "gpt-4-1106-preview", // Replace with the model you intend to use
//       prompt: "what do you understand from the following termina output\n" + dataString, // Your input text
//       temperature: 0.7,
//       max_tokens: 150,
//       top_p: 1.0,
//       frequency_penalty: 0.0,
//       presence_penalty: 0.0,
//     }, {
//       headers: {
//         'Authorization': `Bearer ${apiKey}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('AI response:', response.data.choices[0].text);
//     // Process AI response as needed
//   } catch (error) {
//     console.error('Error sending data to OpenAI', error.message);
//   }
// }
