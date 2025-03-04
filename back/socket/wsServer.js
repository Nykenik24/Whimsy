const socketIO = require("socket.io");
const handlers = require("../handlers/__init__.js");
const crypto = require("crypto");

function getRandomId(length) {
  return crypto.randomBytes(length).toString("hex");
}

function setupWebSocket(server) {
  const io = socketIO(server);

  // WebSocket connection handling
  io.on("connection", (socket) => {
    io.emit("client-connect", {
      generated_id: getRandomId(30),
      status: 0,
    });

    console.log("New client connected");

    // Triggered when disconnected
    socket.on("disconnect", handlers.baseHandlers.onDisconnect(io));

    // Handle messages
    socket.on("message", handlers.baseHandlers.onMessage(io));

    // Handle user-disconnect
    socket.on("user-disconnect", handlers.otherHandlers.userDisconnect(io));
  });

  console.log("WebSocket server setup");
}

module.exports = setupWebSocket;
