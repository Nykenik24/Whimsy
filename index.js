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
  output: process.stdout,
  input: process.stdin,
  terminal: true,
});
const CLI = require("clui");

// Misc.
const commands = require("./src/commands");

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
    chalk.yellow("1) Join a room\n2) Host a room\nYour choice: "),
    (joinOrHost) => {
      switch (Math.floor(joinOrHost)) {
        case 1:
          console.log(chalk.green("\n--- JOIN A ROOM ---"));

          rl.question(chalk.blue("URL of the room: "), async (url) => {
            const socket = await client.joinRoom(url, { username }, rl);
            socket.messageCount = 0;
            let spamLock = false;
            process.on(
              "SIGINT",
              () => (
                console.clear(), logger.info("Quitting..."), process.exit(0)
              ),
            );
            const showPrompt = () => process.stdout.write("\r> ");
            rl.setPrompt("> ");
            showPrompt();
            rl.on("line", (message) => {
              if (spamLock) return showPrompt();
              process.stdout.write("\x1b[2K\r");

              if (message.startsWith("/")) {
                const args = message.slice(1).split(" ");
                if (commands[args[0]]) {
                  const command = commands[args[0]];
                  (async () => {
                    await command(url, socket, args);
                  })();
                } else {
                  logger.error(`Unrecognized command: ${args[0]}`);
                }
              } else if (socket.messageCount < 12) {
                socket.emit("chat_message", { contents: message, username });
                socket.messageCount++;
              } else {
                spamLock = true;
                rl.output = ms;
                ms.mute();
                logger.note("Stop spamming! You sent 12 messages in a row.");
                sleep(750)
                  .then(() =>
                    logger.note(
                      "0.75 seconds passed, you can continue writing!",
                    ),
                  )
                  .then(() => {
                    socket.messageCount = 0;
                    spamLock = false;
                    ms.unmute;
                    rl.output = process.stdout;
                    showPrompt();
                  });
              }
              if (!spamLock) showPrompt();
            });
          });

        case 2:
          rl.question(
            chalk.blue("What port do you want to use (from 1025 to 65535)?: "),
            (port) => {
              if (port < 1025) {
                logger.error("Port can't be lower than 1025");
                process.exit(1);
              } else if (port > 65535) {
                logger.error("Port can't be greater than 65535");
                process.exit(1);
              }

              console.log("");
              console.log(chalk.green("--- ROOM CONFIGURATION ---"));
              const options = {
                username: username,
              };
              rl.question(
                chalk.blue("Maximum people (default is 16): "),
                (maxPeople) => {
                  options.maxPeople = maxPeople;
                  rl.question(chalk.blue("Mode (public/private): "), (mode) => {
                    options.mode = mode;
                    if (mode === "private") {
                      process.stdout.write(
                        chalk.red("Room password: ") + chalk.gray(" hidden"),
                      );
                      ms.mute();
                      rl.output = ms;
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
          logger.error("Invalid value");
          process.exit(1);
      }
    },
  );
});
