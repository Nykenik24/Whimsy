const handlers = require("./__init__.js");
const crypto = require("crypto");

function getRandomId(length) {
  return crypto.randomBytes(length).toString("hex");
}

const baseHandlers = {
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
          id: getRandomId(30),
        });
      }
    };
  },
  onDisconnect: function () {
    return (reason) => {
      console.log("Client disconnected because of '" + reason + "'");
    };
  },
};

module.exports = baseHandlers;
