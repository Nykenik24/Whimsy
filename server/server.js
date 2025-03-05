const socketIO = require("socket.io");
const handlers = require("./handlers/__init__.js");
const crypto = require("crypto");

function getRandomId(length) {
  return crypto.randomBytes(length).toString("hex");
}

var users = {};

function setupWebSocket(server) {
  const io = socketIO(server);

  // WebSocket connection handling
  io.on("connection", (socket) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
    const time = `${currentDate.getHours().toString()}:${currentDate.getMinutes().toString()}:${currentDate.getSeconds().toString()}`;

    const username = socket.request.headers.user;
    if (username != "undefined") {
      users[username] = {
        status: "connected",
        connected_on: `${formattedDate} ${time}`,
      };
    }

    io.emit("client-connect", {
      generated_id: getRandomId(30),
      status: 0,
    });

    io.emit("message", {
      msg: `Welcome, ${username}!`,
      user: "SYSTEM",
      status: "ok",
      date: formattedDate,
      time: time,
      id: getRandomId(30),
    });

    console.log("New client connected");

    // Triggered when disconnected
    socket.on(
      "disconnect",
      handlers.baseHandlers.onDisconnect(users, username),
    );

    // Handle messages
    socket.on("message", handlers.baseHandlers.onMessage(io));

    // Handle user-disconnect
    socket.on("user-disconnect", handlers.otherHandlers.userDisconnect(io));

    // Handle client-count
    socket.on("client-count", handlers.otherHandlers.clientCount(io));

    // Handle get-users
    socket.on("get-users", handlers.otherHandlers.getUsers(io, users));
  });

  console.log("WebSocket server setup");
}

module.exports = setupWebSocket;
