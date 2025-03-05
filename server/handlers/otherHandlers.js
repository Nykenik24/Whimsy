const crypto = require("crypto");

function getRandomId(length) {
  return crypto.randomBytes(length).toString("hex");
}

const otherHandlers = {
  userDisconnect: function (io, clients, server) {
    return (data) => {
      const username = data.user;
      console.log(`${username} disconnected`);

      io.emit("message", {
        msg: `User ${username} disconnected.`,
        user: "SYSTEM",
        status: "ok",
      });

      io.emit("client-count", { count: clients.length });

      // Check if the host left and assign a new one
      if (clients.length > 0 && username === clients[0].request.headers.user) {
        console.log("Host left. Assigning new host...");
        clients[0].emit("new-host", { msg: "You are now the host." });
      }

      // If no clients left, shut down the server
      if (clients.length === 0) {
        console.log("No clients left. Shutting down server...");
        server.close(() => process.exit(0));
      }
    };
  },

  clientCount: function (io) {
    return (data) => {
      io.emit("client-count", { count: io.engine.clientsCount });
    };
  },

  getUsers: function (io, users) {
    return (data) => {
      io.emit("get-users", {
        users: users,
        count: Object.keys(users).length,
        connected: io.engine.clientsCount,
      });
    };
  },
};

module.exports = otherHandlers;
