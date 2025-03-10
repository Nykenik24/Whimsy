// Server
const io = require("socket.io-client");
// Terminal
const chalk = require("chalk");
const logger = require("./logger");

async function isRoomPrivate(url) {
  const response = await fetch(`${url}/is-private`);
  const data = await response.json();
  return data.private;
}

async function validatePassword(url, password) {
  const response = await fetch(`${url}/check-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  const data = await response.json();
  return data.valid;
}

async function checkRoomAvailability(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

async function checkAndSetupRoom(url, options) {
  return new Promise(async (resolve, reject) => {
    const regex = /^https:\/\/\w+-\w+-\w+\.loca\.lt$/gm;
    if (!regex.test(url)) {
      logger.error(
        `URL ${url} has an invalid format: ${chalk.redBright(url)} vs ${chalk.green("https://a-simple-example.loca.lt")}`,
      );
      return reject(new Error("Invalid URL format"));
    }

    try {
      const isPrivate = await isRoomPrivate(url);
      if (isPrivate) {
        resolve({ passwordRequired: true, username: options.username, url });
      } else {
        resolve({ passwordRequired: false, username: options.username, url });
      }
    } catch (err) {
      reject(err);
    }
  });
}

async function joinRoom(url, options, rl) {
  let clientSetup = await checkAndSetupRoom(url, options).catch((err) => {
    logger.error(err.message);
    process.exit(1);
  });

  if (clientSetup.passwordRequired) {
    return new Promise((resolve, reject) => {
      rl.question(chalk.red("Password: "), async (password) => {
        try {
          const passwordValid = await validatePassword(url, password);
          if (passwordValid) {
            options.password = password;
            logger.info("Password validated, connecting to the room...");
            resolve(connectToRoom(clientSetup.url, options));
          } else {
            logger.error("Incorrect password.");
            process.exit(1);
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  } else {
    return connectToRoom(clientSetup.url, options);
  }
}

function connectToRoom(url, options) {
  return new Promise((resolve, reject) => {
    const username = options.username || `User-${getRandomID(6)}`;
    const socket = io(url, {
      extraHeaders: {
        username: username,
        password: options.password || null,
      },
    });

    socket.on("connect", () => {
      logger.info(`Connected to the room as ${options.username}`);
      socket.messageCount = 0;
      resolve(socket);
    });

    socket.on("connect_error", (err) => {
      logger.error(`Error in the connection: ${err}`);
      reject(err);
    });

    socket.on("chat_message", (data) => {
      if (data.username !== username) {
        process.stdout.write("\x1b[2K");
        process.stdout.write("\x1b[0G");
        logger.message(
          `${chalk.blue(data.username)} at ${chalk.gray(data.timestamp)}: ${chalk.white(data.contents)}`,
        );
        socket.messageCount = 0;
        process.stdout.write("> ");
      }
    });

    socket.on("new_user", (data) => {
      console.log("");
      logger.connect(`${data.username} (${data.count} users)`);
      process.stdout.write("> ");
    });

    socket.on("disconnect", () => {
      logger.disconnect(`Disconnected from the room`);
      process.exit(0);
    });
  });
}

module.exports = { checkAndSetupRoom, joinRoom };
