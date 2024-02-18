# SUST_HACKATHON_2024
 ### Not_An_AI built using ssh2, socket.io, xterm.js, express and Vue js

A bare bones example of an HTML5 web-based terminal emulator and SSH client. We use SSH2 as a client on a host to proxy a Websocket / Socket.io connection to a SSH2 server. Then we build a chatbot with vue js and connect it with the openai api so that all the input and output go directly to the chatbot and explain about them if there is any potential error or others.

#### HTML5 Web-Based Terminal Emulator and SSH Client:
Employ xterm.js for a robust terminal experience within the browser.
Utilize socket.io for real-time, bidirectional communication between the client and server.
Use ssh2 as the client-side library to establish secure SSH connections to the server.
#### Vue.js OpenAI Powered Chatbot:
Implement a Vue.js component for the chatbot interface, ensuring seamless integration with the terminal emulator.
Integrate the OpenAI API to power the chatbot's responses and provide informative explanations.
Design the chatbot to handle both user input and terminal output, offering guidance and error interpretation.
####  Express.js Server:
Act as the server-side component, managing socket.io connections and proxying SSH communication.
Integrate with an SSH2 server to facilitate secure connections from the client.
Key Functionalities:

####  Secure SSH Connections:
Employ ssh2 library for client-side authentication and secure data transmission.
Allow users to specify server details (hostname, port, username, password/key) for connection.
Handle different authentication methods (password, key-based) securely.
####  Real-Time Terminal Interaction:
Utilize xterm.js to provide a familiar terminal-like experience within the browser.
Enable users to send commands and interact with the SSH server in real time.
Display terminal output clearly and efficiently, incorporating styling and formatting as needed.
####  AI-Powered Chatbot Assistance:
Offer guidance and explanations as users interact with the terminal.
Use the OpenAI API to generate meaningful responses based on user input and terminal output.
Identify and explain potential errors or issues encountered during the SSH session.
Provide context-aware assistance, adapting to the user's current actions and goals.
####  User-Friendly Interface:
Design an intuitive interface that combines the terminal emulator and chatbot seamlessly.
#### Security 
- Strictly enforce HTTPS for all communication to protect user data.


## Future Plan
- Allow users to switch between terminal interaction and chatbot assistance easily.
- Provide clear visual cues and feedback for actions and responses.
- Offer customization options for terminal appearance and chatbot behavior.
- Implement proper authentication and authorization mechanisms on both the client and server.
- Securely store and manage user credentials (if using password authentication).
- Design the architecture to handle multiple concurrent users and connections effectively.
- Consider using load balancers and distributed systems if necessary.
- Explore ways to provide limited functionality or store commands for execution when online.
- Consider caching recent terminal output for quick reference even when offline.


# Build Details

### Backend
- cd backend and npm install --production. If you want to develop and rebuild javascript and other files utilize npm install instead.

- If desired, edit app/config.json to change the listener to your liking. There are also some default options which may be definied for a few of the variables.

- Run `npm start`

- Fire up a browser, navigate to IP/port of your choice and specify a host (https isn't used here because it's assumed it will be off-loaded to some sort of proxy):http://localhost:2222/ssh/host/127.0.0.1

- You will be prompted for credentials to use on the SSH server via HTTP Basic authentcaiton. This is to permit usage with some SSO systems that can replay credentials over HTTP basic.

### Frontend

#### Vue js

- cd Frontend/vue-project
- `npm install`
- Compile and Hot-Reload for Development `npm run dev`

  #### Backend

- cd Frontend/backedn
- `npm install`
- Compile and Hot-Reload for Development `node start`


## Config File Options
`config.json` contains several options which may be specified to customize to your needs, vs editing the javascript directly. This is JSON format so mind your spacing, brackets, etc...

* **listen.ip** - _string_ - IP address node should listen on for client connections, defaults to `127.0.0.1`

* **listen.port** - _integer_ - Port node should listen on for client connections, defaults to `2222`

* **socketio.serveClient** - _boolean_ - serve the socket.io client. This is built into the custom javascript, so you shouldn't need this. Kept as an option just in case. Default: `false`

* **socketio.path** - _string_ - Path to socket.io client files. Default: `/ssh/socket.io`

* **socketio.origins** - _array_ - COORS origins to allow connections from to socket.io server, defaults to `localhost:2222`. Changed in 0.3.1, to enable previous, less secure, default behavior of everything use `*:*`

* **user.name** - _string_ - Specify user name to authenticate with. In normal cases this should be left to the default `null` setting.

* **user.password** - _string_ - Specify password to authenticate with. In normal cases this should be left to the default `null` setting.

* **user.overridebasic** - _boolean_ - When set to `true` ignores `Authorization: Basic` header sent from client and use credentials defined in `user.name` and `user.password` instead. Defaults to `false`.

* **ssh.host** - _string_ - Specify host to connect to. May be either hostname or IP address. Defaults to `null`.

* **ssh.port** - _integer_ - Specify SSH port to connect to, defaults to `22`

* **ssh.term** - _string_ - Specify terminal emulation to use, defaults to `vt100` if null

* **ssh.readyTimeout** - _integer_ - How long (in milliseconds) to wait for the SSH handshake to complete. **Default:** 20000.

* **ssh.keepaliveInterval** - _integer_ - How often (in milliseconds) to send SSH-level keepalive packets to the server (in a similar way as OpenSSH's ServerAliveInterval config option). Set to 0 to disable. **Default:** 120000.

* **ssh.keepaliveCountMax** - _integer_ - How many consecutive, unanswered SSH-level keepalive packets that can be sent to the server before disconnection (similar to OpenSSH's ServerAliveCountMax config option). **Default:** 10.

* **allowedSubnets** - _array_ - A list of subnets that the server is allowed to connect to via SSH. An empty array means all subnets are permitted; no restriction. **Default:** empty array.

* **terminal.cursorBlink** - _boolean_ - Cursor blinks (true), does not (false) **Default:** true.

* **terminal.scrollback** - _integer_ - Lines in the scrollback buffer. **Default:** 10000.

* **terminal.tabStopWidth** - _integer_ - Tab stops at _n_ characters **Default:** 8.

* **terminal.bellStyle** - _string_ - Style of terminal bell: (sound|none). **Default:** "sound".

* **terminal.fontSize** - _number_ - Size of terminal font. **Default:** 14.

* **terminal.fontFamily** - _string_ - Font family

* **terminal.letterSpacing** - _number_ - Letter spacing

* **terminal.lineHeight** - _number_ - Line height

* **header.text** - _string_ - Specify header text, defaults to `My Header` but may also be set to `null`. When set to `null` no header bar will be displayed on the client.

* **header.background** - _string_ - Header background, defaults to `green`.

* **session.name** - _string_ - Name of session ID cookie. it's not a horrible idea to make this something unique.

* **session.secret** - _string_ - Secret key for cookie encryption. You should change this in production.

* **options.challengeButton** - _boolean_ - Challenge button. This option, which is still under development, allows the user to resend the password to the server (in cases of step-up authentication for things like `sudo` or a router `enable` command.

* **options.allowreauth** - _boolean_ - Reauth button. This option creates an option to provide a button to create a new session with new credentials. 

* **algorithms** - _object_ - This option allows you to explicitly override the default transport layer algorithms used for the connection. Each value must be an array of valid algorithms for that category. The order of the algorithms in the arrays are important, with the most favorable being first. 

* **serverlog.client** - _boolean_ - Enables client command logging on server log (console.log). Very simple at this point, buffers data from client until it receives a line-feed then dumps buffer to console.log with session information for tracking. Will capture anything send from client, including passwords, so use for testing only... Default: false. Example:
  * _serverlog.client: GcZDThwA4UahDiKO2gkMYd7YPIfVAEFW/mnf0NUugLMFRHhsWAAAA host: 192.168.99.80 command: ls -lat_

* **serverlog.server** - _boolean_ - not implemented, default: false.

* **accesslog** - _boolean_ - http style access logging to console.log, default: false

* **safeShutdownDuration** - _integer_ - maximum delay, in seconds, given to users before the server stops when doing a safe shutdown

# Client-side logging
Clicking `Start logging` on the status bar will log all data to the client. A `Download log` option will appear after starting the logging. You may download at any time to the client. You may stop logging at any time my pressing the `Logging - STOP LOG`. Note that clicking the `Start logging` option again will cause the current log to be overwritten, so be sure to download first.



