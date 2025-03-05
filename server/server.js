const socketIo = require("socket.io");
const handlers = require("./handlers/handlers.js"); // Import the aggregated handlers

// Array to keep track of connected users and their usernames
let users = [];

// Function to initialize the server and handle socket connections
function startServer(server) {
  const socketServer = socketIo(server); // Use the passed server for Socket.IO

  console.log("Server is running and listening for socket connections...");

  socketServer.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    // Check for username availability
    socket.on("check-username", handlers.checkUsername(socketServer, users));

    // Handle username-taken event
    socket.on("username-taken", handlers.usernameTaken(socketServer));

    // Handle new client connection
    socket.on("client-connect", (data) => {
      const { user } = data;
      console.log(`${user} has connected`);
    });

    // Handle client disconnect
    socket.on(
      "disconnect",
      handlers.onDisconnect(socketServer, users, [], server),
    );

    // Listen for messages from clients
    socket.on("message", handlers.onMessage(socketServer));

    // Listen for client count
    socket.on("client-count", handlers.clientCount(socketServer));

    // Listen for getting connected users
    socket.on("get-users", handlers.getUsers(socketServer, users));

    // Handle 'user-disconnect' event when a user manually disconnects
    socket.on("user-disconnect", handlers.userDisconnect(socketServer, users));
  });

  return socketServer; // Return the socketServer instance if needed elsewhere
}

// Export the startServer function
module.exports = { startServer };
