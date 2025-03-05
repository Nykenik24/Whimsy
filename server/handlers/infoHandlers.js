const infoHandlers = {
  // Handler for 'client-count' event
  clientCount: function (io) {
    return () => {
      io.emit("client-count", { count: io.engine.clientsCount });
    };
  },

  // Handler for 'get-users' event
  getUsers: function (io, users) {
    return () => {
      io.emit("get-users", {
        users: users,
        count: Object.keys(users).length,
        connected: io.engine.clientsCount,
      });
    };
  },
};

module.exports = infoHandlers;
