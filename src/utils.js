const chalk = require("chalk");
const crypto = require("crypto");

function sleep(time, unit) {
  const units = {
    ms: 1,
    s: 1000,
  };
  const multiplier = units[unit] || 1;
  return new Promise((resolve) => setTimeout(resolve, time * multiplier));
}

function getRandomID(len = 32) {
  return crypto.randomBytes(len).toString("hex");
}

function error(message) {
  const logger = require("./logger");
  logger.error(message);
  logger.mention(
    `If you find any bugs, contact @Nykenik24 (email ${chalk.bgBlue.black("Nykenik24@proton.me")}, GitHub ${chalk.bgBlue.black("https://github.com/Nykenik24")})`,
  );
  process.exit(1);
}

function applyCamelCase(str) {
  return str
    .split(" ") // Split the string by spaces
    .map((word, index) => {
      if (index === 0) {
        return word; // Keep the first word in lowercase
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Capitalize the first letter of subsequent words
    })
    .join(""); // Join the array back into a string without spaces
}

module.exports = { sleep, getRandomID, error, applyCamelCase };
