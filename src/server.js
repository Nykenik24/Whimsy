// localtunnel
const localtunnel = require("localtunnel");
// Terminal
const logger = require("./logger");
const CLI = require("clui");
const chalk = require("chalk");
// Socket.IO
const socketIO = require("socket.io");
// Express for HTTP requests
const express = require("express");
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

async function setupTunnel(port) {
  const TIMEOUT_MS = 10000;

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("setupTunnel timed out after 10 seconds"));
    }, TIMEOUT_MS);

    try {
      const tunnel = await localtunnel({
        port: port,
      });

      tunnel.on("close", () => {
        logger.info(`Tunnel ${tunnel.url} closed.`);
      });

      clearTimeout(timeout);
      resolve({ tunnel, port });
    } catch (err) {
      clearTimeout(timeout);
      reject(new Error(`Failed to create tunnel: ${err.message}`));
    }
  });
}

async function setupServer(port, options) {
  let mode = options.mode === "private" ? "private" : "public";
  const server = {
    hostName: options.username,
    users: [],
    userCount: 0,
    maxPeople: options.maxPeople || 16,
    mode: mode,
  };

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

  const app = express();
  const httpServer = app.listen(port);

  const io = socketIO(httpServer);

  app.get("/is-private", (req, res) => {
    if (mode === "private") {
      res.json({ private: true });
    } else {
      res.json({ private: false });
    }
  });

  app.post("/check-password", express.json(), (req, res) => {
    const { password } = req.body;
    if (mode === "private") {
      if (bcrypt.compareSync(password, server.passwordHash)) {
        res.json({ valid: true });
      } else {
        res.json({ valid: false });
      }
    } else {
      res.json({ valid: true });
    }
  });

  app.get("/server-info", (req, res) => {
    res.json({
      users: {
        history: server.users,
        count: server.userCount,
      },
      options: {
        maxUsers: server.maxPeople,
        passwordHash: server.passwordHash,
        mode: server.mode,
      },
      hostName: server.hostName,
    });
  });

  io.on("connection", (socket) => {
    const username = socket.request.headers.username;

    if (!socket.request.headers.temporary) {
      if (server.userCount >= server.maxPeople) {
        logger.warn("User limit reached, rejecting connection.");
        socket.disconnect();
      }

      if (
        server.users
          .map((user) => {
            if (user.status === "connected") {
              return user;
            }
          })
          .some((user) => user && user.username === username)
      ) {
        logger.warn(`Username ${username} is taken, rejecting connection.`);
        socket.disconnect();
        return;
      }

      if (mode === "private") {
        const passedPassword = socket.request.headers.password;
        if (
          !passedPassword ||
          !bcrypt.compareSync(passedPassword, server.passwordHash)
        ) {
          socket.emit("password_required");
          return;
        } else {
          completeConnection(socket, username);
        }
      } else {
        completeConnection(socket, username);
      }
    } else {
      setTimeout(() => {
        logger.info("Temporary connection disconnected!");
        socket.disconnect();
      }, 3000);
    }

    function completeConnection(socket, username) {
      const user = new User(username);
      server.users.push(user);

      server.userCount++;
      logger.connect(
        `User connected: ${username} (${server.userCount} user(s)).`,
      );
      logger.note(`ID: ${user.id}`);

      socket.on("chat_message", (data) => {
        io.emit("chat_message", {
          contents: data.contents,
          timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          username: data.username,
        });
        logger.chatroomLog(data.contents);
      });

      socket.on("new_user", (data) => {
        io.emit("new_user", {
          username: data.username,
          count: server.userCount,
        });
      });

      socket.on("disconnect", () => {
        server.userCount--;
        logger.disconnect(
          `User ${username} disconnected (${server.userCount} user(s))`,
        );
        io.emit("user_disconnect", username);
        server.users.forEach((user) => {
          if (user.username === username) {
            user.status = "disconnected";
          }
        });
      });
    }

    socket.on("password_attempt", (data) => {
      if (data.count > 4) {
        logger.error(`Too many password attempts by ${username}`);
        socket.disconnect();
      } else {
        const passedPassword = data.password;
        if (
          !passedPassword ||
          !bcrypt.compareSync(passedPassword, server.passwordHash)
        ) {
          logger.warn(`Incorrect password attempt by ${username}.`);
          socket.emit("password_required", { count: data.count + 1 });
        } else {
          socket.emit("password_success", "Access granted!");
          completeConnection(socket, username);
        }
      }
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
  console.log(chalk.green(`--- ${server.hostName}'s CHATROOM LOGS ---`));
  logger.info(
    "You are now seeing the chatroom logs of your room, to quit, press CTRL + C",
  );
  logger.info(
    "To chat with people that join to the room, run Whimsy in another terminal and select join.",
  );
  logger.info(
    chalk.bold.blue(
      `Share this URL to other people if they want to join: ${server.url}`,
    ),
  );
  process.on("SIGINT", () => {
    console.clear();
    logger.info("Quitting...");
    process.exit(0);
  });
}

module.exports = {
  setup: setupServer,
  host: hostRoom,
  setupTunnel,
};
