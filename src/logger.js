const chalk = require("chalk");

function newLogType(prefix, defaults = { color: "white" }) {
  return function (
    str,
    before = "",
    options = { colorize: true, color: defaults.color },
  ) {
    if (options.colorize) {
      const colorize = chalk[options.color] || chalk.white;
      console.log(colorize(`${before}${prefix}${str}`));
    } else {
      console.log(`${before}${prefix}${str}`);
    }
  };
}

const logger = {
  // Information
  info: newLogType("[i] ", { color: "blue" }),
  warn: newLogType("[!] ", { color: "yellow" }),
  // Status
  error: newLogType("[x] ", { color: "red" }),
  fatal: newLogType("[X] ", { color: "magenta" }),
  ok: newLogType("[OK] ", { color: "green" }),
  // Arrows
  arrow: newLogType("-> ", { color: "blueBright" }),
  doubleArrow: newLogType(">> ", { color: "blueBright" }),
  longArrow: newLogType("--> ", { color: "blueBright" }),
  // User info.
  disconnect: newLogType("[-] ", { color: "red" }),
  connect: newLogType("[+] ", { color: "green" }),
  mention: newLogType("[@] ", { color: "blue" }),
  // Misc.
  question: newLogType("[?] ", { color: "cyan" }),
  system: newLogType("[/] ", { color: "redBright" }),
  chatroomLog: newLogType("[>] ", { color: "greenBright" }),
  note: newLogType("[()] ", { color: "gray" }),
  message: newLogType("", { color: "yellowBright" }),
};

module.exports = logger;
