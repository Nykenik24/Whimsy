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

function stripUsername(str) {
  return str
    .split(" ") // Split the string by spaces
    .map((word, index) => {
      if (index === 0) {
        return word; // Keep the first word
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Capitalize the first letter of subsequent words
    })
    .join(""); // Join the array back into a string without spaces
}

function getRandomURL(len = 10) {
  return `whimsy.${crypto.randomBytes(len / 2).toString("hex")}`;
}

module.exports = {
  sleep: sleep,
  getRandomID: getRandomID,
  stripUsername: stripUsername,
  getRandomURL: getRandomURL,
};
