const utils = require("./utils");
const getRandomID = utils.getRandomID;

class User {
  constructor(name, status = "connected") {
    this.username = name;
    this.id = getRandomID();
    this.status = status;
  }
}

module.exports = User;
