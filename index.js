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
const MuteStream = require("mute-stream");
const ms = new MuteStream();
ms.pipe(process.stdout);
const rl = readline.createInterface({
  output: ms,
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

rl.question(chalk.yellow("What is your name?: "), (username) => {
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
    chalk.yellow("Do you want to join a chatroom or host your own?: "),
    (joinOrHost) => {
      switch (joinOrHost) {
        case "join":
          logger.info("TODO"); // TODO: Join rooms (client)
          process.exit(0);
        case "host":
          rl.question(
            chalk.blue("What port do you want to use (from 1025 to 65535)?: "),
            (port) => {
              if (port < 1025) {
                logger.error("Port can't be lower than 1025");
                return;
              } else if (port > 65535) {
                logger.error("Port can't be greater than 65535");
                return;
              }

              console.log("");
              console.log(chalk.green("--- ROOM CONFIGURATION ---"));
              const options = {};
              rl.question(
                chalk.blue("Maximum people (default is 16): "),
                (maxPeople) => {
                  options.maxPeople = maxPeople;
                  rl.question(chalk.blue("Mode (public/private): "), (mode) => {
                    options.mode = mode;
                    if (mode === "private") {
                      process.stdout.write(chalk.red("Room password: "));
                      ms.mute();
                      rl.question("", (password) => {
                        ms.unmute();
                        console.log("");
                        options.password = password;
                        server.host(port, options);
                      });
                    } else {
                      server.host(port, options);
                    }
                  });
                },
              );
            },
          );
          break;
        default:
          error("Invalid value");
          break;
      }
    },
  );
});
