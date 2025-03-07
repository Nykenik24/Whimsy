const chalk = require("chalk");

function newLogType(
  prefix,
  defaults = { color: "white" },
  modify = (str) => {
    return str;
  },
) {
  return function (
    str,
    before = "",
    options = { colorize: true, color: defaults.color },
  ) {
    if (options.colorize) {
      const colorize = chalk[options.color] || chalk.white;
      console.log(colorize(`${before}${prefix}${modify(str, options)}`));
    } else {
      console.log(`${before}${prefix}${modify(str, options)}`);
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
  message: newLogType("", { color: "yellowBright" }, (str, opts) => {
    const data = opts.data;
    const user = data.user || "unknown";
    const timestamp = data.timestamp || "0000-00-00 00:00:00";
    if (opts.colorize) {
      return `${chalk.blue(user)} at ${chalk.green(timestamp)}: ${chalk.white(str)}`;
    } else {
      return `${user} at ${timestamp}: ${str}`;
    }
  }),
};

module.exports = logger;
