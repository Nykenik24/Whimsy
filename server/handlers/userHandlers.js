const userHandlers = {
  // Handler for checking if the username is taken
  checkUsername: function (io, users) {
    return (data) => {
      const { username, socketId } = data;

      // Check if the username is already taken
      const usernameTaken = users.some((user) => user.username === username);

      if (usernameTaken) {
        // Emit 'username-taken' event if the username is taken
        io.to(socketId).emit("username-taken");
      } else {
        // If username is available, add the user to the list and emit 'username-available'
        users.push({ username, socketId });
        io.to(socketId).emit("username-available");
      }
    };
  },

  // Handler for when a user disconnects
  userDisconnect: function (io, users) {
    return (data) => {
      const username = data.user;
      console.log(`${username} has disconnected`);

      // Remove the user from the users list on disconnect
      users = users.filter((user) => user.username !== username);
      io.emit("message", {
        msg: `${username} has disconnected.`,
        user: "SYSTEM",
        status: "ok",
      });

      io.emit("client-count", { count: users.length });
    };
  },

  // This handler checks if the username is taken (to be used when new users connect)
  usernameTaken: function (io, users) {
    return (data) => {
      const { username } = data;
      const usernameExists = users.some((user) => user.username === username);

      if (usernameExists) {
        io.emit("username-taken");
      } else {
        io.emit("username-available");
      }
    };
  },

  // When a user sends a message, broadcast it to all clients
  onMessage: function (io) {
    return (data) => {
      console.log("Message received:", data);
      if (data.broadcast == true) {
        // Broadcast to all clients
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
        const time = `${currentDate.getHours().toString()}:${currentDate.getMinutes().toString()}:${currentDate.getSeconds().toString()}`;
        io.emit("message", {
          msg: data.msg,
          user: data.user,
          status: "ok",
          date: formattedDate,
          time: time,
          id: data.id || null,
        });
      }
    };
  },
};

module.exports = userHandlers;
