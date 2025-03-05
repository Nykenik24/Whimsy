const crypto = require("crypto");

function getRandomId(length) {
  return crypto.randomBytes(length).toString("hex");
}

const baseHandlers = {
  onMessage: function (io) {
    return (data) => {
      console.log("Message received:", data);
      if (data.broadcast == true) {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(
          currentDate.getMonth() + 1
        )
          .toString()
          .padStart(
            2,
            "0",
          )}-${currentDate.getDate().toString().padStart(2, "0")}`;
        const time = `${currentDate.getHours().toString()}:${currentDate.getMinutes().toString()}:${currentDate.getSeconds().toString()}`;
        io.emit("message", {
          msg: data.msg,
          user: data.user,
          status: "ok",
          date: formattedDate,
          time: time,
          id: getRandomId(30),
        });
      }
    };
  },

  onDisconnect: function (io, users, clients, server) {
    return function () {
      const username = this.request.headers.user;
      console.log(`Client disconnected: ${username}`);

      // Remove user from users list
      delete users[username];

      // Remove from clients list
      clients = clients.filter((client) => client !== this);

      io.emit("message", {
        msg: `${username} has left the chat.`,
        user: "SYSTEM",
        status: "ok",
      });

      io.emit("client-count", { count: clients.length });

      // If the host left, transfer host to the next client
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
};

module.exports = baseHandlers;
