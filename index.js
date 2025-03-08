const bigText = `
██╗    ██╗██╗  ██╗██╗███╗   ███╗███████╗██╗   ██╗
██║    ██║██║  ██║██║████╗ ████║██╔════╝╚██╗ ██╔╝
██║ █╗ ██║███████║██║██╔████╔██║███████╗ ╚████╔╝ 
██║███╗██║██╔══██║██║██║╚██╔╝██║╚════██║  ╚██╔╝  
╚███╔███╔╝██║  ██║██║██║ ╚═╝ ██║███████║   ██║   
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   
`;

// Terminal style and output
const chalk = require("chalk");
const readline = require("readline");
const rl = readline.createInterface({
  output: process.stdout,
  input: process.stdin,
});

// Misc.
const CLI = require("clui");

// Utils
const utils = require("./src/utils");
const sleep = utils.sleep;
const stripUsername = utils.stripUsername;

// Logger
const logger = require("./src/logger");

// Server & client
const server = require("./src/server");
const client = require("./src/client");

console.log(chalk.blue(bigText));

rl.question("What is your name?: ", (username) => {
  switch (username) {
    case "":
    case null:
    case undefined:
      error("No username");
    default:
      if (username.includes(" ")) {
        username = stripUsername(username);
        logger.warn("Usernames can't have spaces");
        logger.info(
          `Your username was automatically converted into ${username}`,
        );
      }
      break;
  }

  rl.question(
    "Do you want to join a chatroom or host your own?: ",
    (joinOrHost) => {
      switch (joinOrHost) {
        case "join":
          logger.info("TODO"); // TODO: Join rooms (client)
          break;
        case "host":
          logger.info("TODO"); // TODO: Host rooms (server)
          break;
        default:
          error("Invalid value");
          break;
      }
      process.exit(0); // Temporary!!!
    },
  );
});
