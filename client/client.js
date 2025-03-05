const io = require("socket.io-client");
const chalk = require("chalk");

// Client Class to manage socket operations
class Client {
  constructor(serverUrl, username) {
    this.serverUrl = serverUrl || "http://localhost:3000";
    this.username = username || `User-${Math.floor(Math.random() * 10000)}`;
    this.client = io(this.serverUrl, {
      transports: ["websocket"],
    });
    this.clientCount = 0;
    this.users = [];
    this.client.on("connect", this.onConnect.bind(this));
    this.client.on("disconnect", this.onDisconnect.bind(this));
    this.client.on("message", this.onMessage.bind(this));
    this.client.on("client-count", this.updateClientCount.bind(this));
    this.client.on("get-users", this.updateUsers.bind(this));
    this.client.on("username-taken", this.handleUsernameTaken.bind(this));
  }

  onConnect() {
    console.log(chalk.green(`Connected to server at ${this.serverUrl}`));
    this.client.emit("client-connect", { user: this.username });
  }

  onDisconnect() {
    console.log(chalk.red(`Disconnected from server at ${this.serverUrl}`));
  }

  onMessage(data) {
    const { user, msg, date, time } = data;
    if (user !== this.username) {
      console.log(chalk.yellow(`${date} ${time} ${user}: ${msg}`));
    }
  }

  sendMessage(msg) {
    this.client.emit("message", {
      user: this.username,
      msg: msg,
      broadcast: true,
    });
  }

  updateClientCount(data) {
    this.clientCount = data.count;
  }

  updateUsers(data) {
    this.users = data.users;
  }

  getClientInfo() {
    return {
      username: this.username,
      clientCount: this.clientCount,
      users: this.users,
    };
  }

  disconnect() {
    this.client.disconnect();
  }

  // New method to handle duplicate username check
  handleUsernameTaken() {
    console.log(
      chalk.red("Username is already taken, please choose a different one."),
    );
  }

  // Method to check if the username is unique on the server
  checkUsername(username) {
    this.client.emit("check-username", { username });
  }
}

module.exports = Client;
