
const debug = require('debug');
const util = require('util');

/**
 * generate consistent prefix for log messages
 * with epress session id and socket session id
 * @param {object} socket Socket information
 */
function prefix(socket) {
  return `(${socket.request.sessionID}/${socket.id})`;
}

// public
function webssh2debug(socket, msg) {
  debug('WebSSH2')(`${prefix(socket)} ${msg}`);
}

/**
 * audit log to console
 * @param {object} socket Socket information
 * @param {object} msg    log message
 */
function auditLog(socket, msg) {
  console.info(`featherless_bipeds ${prefix(socket)} AUDIT: ${msg}`);
}

/**
 * logs error to socket client (if connected)
 * and console.
 * @param {object} socket Socket information
 * @param {string} myFunc Function calling this function
 * @param {object} err    error object or error message
 */
function logError(socket, myFunc, err) {
  console.error(`featherless_bipeds ${prefix(socket)} ERROR: ${myFunc}: ${err}`);
  webssh2debug(socket, `logError: ${myFunc}: ${util.inspect(err)}`);
  if (!socket.request.session) return;
  socket.emit('ssherror', `SSH ${myFunc}: ${err}`);
}

module.exports = { logError, auditLog, webssh2debug };
