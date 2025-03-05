const messageHandler = require("./baseHandlers");
const otherHandlers = require("./otherHandlers");
const infoHandlers = require("./infoHandlers");
const userHandlers = require("./userHandlers");

const handlers = {
  ...messageHandler,
  ...otherHandlers,
  ...infoHandlers,
  ...userHandlers,
};

module.exports = handlers;
