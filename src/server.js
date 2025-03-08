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
  const tunnel = await localtunnel({
    port: port,
    subdomain: getRandomURL(),
  });
  tunnel.on("close", () => {
    logger.info(`Tunnel ${tunnel.url} closed.`);
  });
  return { tunnel: tunnel, port: port };
}

function setupServer(port, options) {
  const server = {};

  const loading = new CLI.Spinner("Setting up the tunnel...");
  loading.start();
  (async () => {
    const tunnel = await setupTunnel(port);
    logger.info(
      `Tunnel started at ${tunnel.tunnel.url}, share the URL to your friends and tell them to join.`,
    );
    server.url = tunnel.tunnel.url;
  })();
  loading.stop();

  // User history and count
  server.users = [];
  server.user_count = 0;

  // User limit
  server.max_users = options.max || 16;

  // Chatroom mode
  let mode;
  switch (options.mode) {
    case "private":
      mode = "private";
      break;
    case "public":
      mode = "public";
    default:
      mode = "public";
      break;
  }

  // Password hashing
  const passwordHashLoad = new CLI.Spinner(
    "Hashing password for security reasons...",
  );
  passwordHashLoad.start();
  if (mode === "private") {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(options.password, salt);
    server.passwordHash = hash;
  }
  passwordHashLoad.stop();

  const io = new socketIO.Server();
  io.listen(port);

  // When a user connects
  io.on("connection", (socket) => {
    // Checks
    // User count exceded
    if (server.user_count > server.max_users) {
      logger.info("A user tried to connect, but the user limit was reached.");
      socket.disconnect();
      server.user_count--; // Restore user count, as it was increased
    }

    // Password check
    if (mode === "private") {
      const passedPassword = socket.request.headers.password;
      // No password
      if (!passedPassword) {
        logger.info("A user tried to connect without passing a password");
        socket.disconnect();
        server.user_count--;
      }
      // Password is not correct
      if (!bcrypt.compareSync(passedPassword, server.passwordHash)) {
        logger.info(
          `A user tried to connect, but the password was incorrect: ${passedPassword}`,
        );
        socket.disconnect();
        server.user_count--;
      }
    }

    server.user_count++;

    // Get the user's username and default to a random username (e.g. User-ad5829)
    const username =
      socket.request.headers.username || `User-${getRandomID(6)}`;
    logger.info(`User connected: ${username}`);

    // Create the new User instance
    const user = new User(username);
    logger.info(`Generated user ID: ${user.id}`);
    server.users.push(user);

    socket.on("chat_message", (data) => {
      io.emit("chat_message", {
        contents: data.contents,
        timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
      logger.chatroom_log(data.contents);
    });

    socket.on("new_user", (name) => {
      io.emit("new_user", {
        log: `Welcome, ${name}!`,
        timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        count: server.users.map((user) => {
          if (user.status === "connected") {
            return user;
          }
        }).length,
      });
      logger.connect(`User ${name}`);
    });

    socket.on("get_users", (data) => {
      const filter = data.filter || "all";
      switch (filter) {
        case "all":
          io.emit("get_users", server.users);
          break;
        case "connected":
          io.emit(
            "get_users",
            server.users.map((user) => {
              if (user.status === "connected") {
                return user;
              }
            }),
          );
        case "disconnected":
          io.emit(
            "get_users",
            server.users.map((user) => {
              if (user.status === "disconnected") {
                return user;
              }
            }),
          );
          break;
        default:
          io.emit("get_users", server.users);
          break;
      }
    });
  });

  server.io = io;
  return server;
}

function hostRoom(port, options) {
  logger.doubleArrow("Setting up server");
  const server = setupServer(port, options);
  logger.arrow(`Created server at port ${port}`, "\t");

  console.log(chalk.green("--- CHATROOM LOGS ---"));
  logger.info("You are now seeing the chatroom logs, to quit, press CTRL + Q");
}

module.exports = {
  setup: setupServer,
  host: hostRoom,
  setupTunnel,
  checkURL,
};
