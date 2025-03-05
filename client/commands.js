const { SocketClient } = require("./client");
const chalk = require("chalk");

/**
 * Get user information
 * @param {SocketClient} client - The socket client instance
 */
function getUserInfo(client) {
  console.log(
    JSON.stringify(
      {
        username: client.username,
        id: client.id,
        joined_on: client.joined_on,
      },
      null,
      2,
    ),
  );
}

/**
 * Get server information
 * @param {SocketClient} client - The socket client instance
 */
function getServerInfo(client) {
  client.sio.emit("client-count");
  client.sio.emit("get-users");
  console.log(
    JSON.stringify(
      {
        connected_clients: client.clientCount,
        users: client.users,
      },
      null,
      2,
    ),
  );
}

/**
 * Quit the session
 * @param {SocketClient} client - The socket client instance
 */
function quit(client) {
  client.disconnect();
  process.exit(0);
}

module.exports = { getUserInfo, getServerInfo, quit };
