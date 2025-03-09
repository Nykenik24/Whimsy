// localtunnel
const localtunnel = require("localtunnel");
// Terminal
const logger = require("./logger");
const CLI = require("clui");
const chalk = require("chalk");
// Socket.IO
const ioClient = require("socket.io-client");
const socketIO = require("socket.io");
// Utils
const utils = require("./utils");
const getRandomURL = utils.getRandomURL;
const getRandomID = utils.getRandomID;
// Date
const dayjs = require("dayjs");
// Hashing
const bcrypt = require("bcrypt");
// Custom classes
const User = require("./user");

async function checkURL(url) {
  return new Promise((resolve) => {
    const socket = ioClient(url, {
      reconnectionAttempts: 1,
      timeout: 3000,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      logger.ok(`URL ${url} is avaliable`);
      socket.disconnect();
      resolve(true);
    });

    socket.on("connect_error", (err) => {
      logger.error(`Error when checking URL ${url}: ${err}`);
      resolve(false);
    });
  });
}

async function setupTunnel(port) {
  const TIMEOUT_MS = 10000; // 10 seconds max

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("setupTunnel timed out after 10 seconds"));
    }, TIMEOUT_MS);

    try {
      const tunnel = await localtunnel({
        port: port,
        //subdomain: getRandomURL(),
      });

      tunnel.on("close", () => {
        logger.info(`Tunnel ${tunnel.url} closed.`);
      });

      clearTimeout(timeout); // Stop the timeout if it succeeds
      resolve({ tunnel, port });
    } catch (err) {
      clearTimeout(timeout);
      reject(new Error(`Failed to create tunnel: ${err.message}`));
    }
  });
}

async function setupServer(port, options) {
  const server = {};

  logger.arrow("Setting up tunnel", " ");
  try {
    const tunnel = await setupTunnel(port);
    server.url = tunnel.tunnel.url;
    server.tunnel = tunnel.tunnel;
    logger.arrow(`Tunnel started at ${server.url}`, " ");
  } catch (err) {
    logger.error(`Failed to set up tunnel: ${err.message}`);
    return;
  }

  logger.arrow("Tunnel setup complete. Starting server...", " ");

  // Proceed only after tunnel is set up
  server.users = [];
  server.userCount = 0;
  server.maxPeople = options.maxPeople || 16;

  let mode = options.mode === "private" ? "private" : "public";

  // Hash password if private
  if (mode === "private") {
    if (!options.password) {
      logger.error(`Expected password, got ${options.password}`);
      process.exit(1);
    }
    const passwordHashLoad = new CLI.Spinner("Hashing password...");
    passwordHashLoad.start();
    const salt = bcrypt.genSaltSync();
    server.passwordHash = bcrypt.hashSync(options.password, salt);
    passwordHashLoad.stop();
  }

  const io = new socketIO.Server();
  io.listen(port);
  logger.arrow(`Server listening on port ${port}`, " ");

  io.on("connection", (socket) => {
    if (server.userCount >= server.maxPeople) {
      logger.warn("User limit reached, rejecting connection.");
      return socket.disconnect();
    }

    if (mode === "private") {
      const passedPassword = socket.request.headers.password;
      if (
        !passedPassword ||
        !bcrypt.compareSync(passedPassword, server.passwordHash)
      ) {
        logger.warn("Incorrect password attempt.");
        return socket.disconnect();
      }
    }

    server.userCount++;
    const username =
      socket.request.headers.username || `User-${getRandomID(6)}`;
    logger.connect(`User connected: ${username}`);

    const user = new User(username);
    server.users.push(user);

    socket.on("chat_message", (data) => {
      io.emit("chat_message", {
        contents: data.contents,
        timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
      logger.chatroomLog(data.contents);
    });

    socket.on("disconnect", () => {
      logger.disconnect(`User ${username} disconnected.`);
      server.userCount--;
      io.emit("user_disconnect", username);
    });
  });

  server.io = io;
  return server;
}

async function hostRoom(port, options) {
  logger.doubleArrow("Setting up server");
  const server = await setupServer(port, options);
  if (!server) {
    logger.error("Server setup failed. Exiting...");
    process.exit(1);
  }

  console.log("");
  console.log(chalk.green("--- CHATROOM LOGS ---"));
  logger.info("You are now seeing the chatroom logs, to quit, press CTRL + C");
  process.on("SIGINT", () => {
    logger.info("Quitting...");
    process.exit(0);
  });
}

module.exports = {
  setup: setupServer,
  host: hostRoom,
  setupTunnel,
  checkURL,
};
