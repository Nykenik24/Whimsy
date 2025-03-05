const crypto = require("crypto");

function getRandomId(length) {
  return crypto.randomBytes(length).toString("hex");
}

const otherHandlers = {
  userDisconnect: function (io) {
    return (data) => {
      console.log("User '" + data.user + "' disconnected");
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
      const time = `${currentDate.getHours().toString()}:${currentDate.getMinutes().toString()}:${currentDate.getSeconds().toString()}`;
      io.emit("message", {
        msg: `User ${data.user} disconnected.`,
        user: "SYSTEM",
        status: "ok",
        date: formattedDate,
        time: time,
        id: getRandomId(30),
      });
    };
  },
};

module.exports = otherHandlers;
