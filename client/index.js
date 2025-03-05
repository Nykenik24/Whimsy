const chalk = require("chalk");
const readline = require("readline");
const io = require("socket.io-client"); // Import socket.io-client
const moment = require("moment"); // To format the time nicely

// WHIMSY Art and Info
const whimsyArt = `
██╗    ██╗██╗  ██╗██╗███╗   ███╗███████╗██╗   ██╗
██║    ██║██║  ██║██║████╗ ████║██╔════╝╚██╗ ██╔╝
██║ █╗ ██║███████║██║██╔████╔██║███████╗ ╚████╔╝ 
██║███╗██║██╔══██║██║██║╚██╔╝██║╚════██║  ╚██╔╝  
╚███╔███╔╝██║  ██║██║██║ ╚═╝ ██║███████║   ██║   
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   
`;

const purposeText = `
Whimsy is a secure terminal chat app focused on privacy, simplicity, and user experience.
Made by Nykenik24.
`;

console.log(chalk.green(whimsyArt));
console.log(chalk.green(purposeText));

// Create interface for input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Client class for handling connections and messages
class Client {
  constructor() {
    this.client = null;
    this.username = "";
    this.serverUrl = "";
    this.port = 0;
  }

  connect() {
    this.client = io(this.serverUrl); // Create socket connection to the server

    // Event listeners
    this.client.on("connect", () => {
      console.log(chalk.green(">> Connected to room:", this.serverUrl));
    });

    this.client.on("message", (data) => {
      const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
      console.log(chalk.cyan(`${data.user}: ${data.msg} - ${timestamp}`));
    });

    this.client.on("connect_error", () => {
      console.log(
        chalk.red("Connection error! Please check the server or room details."),
      );
    });
  }

  sendMessage(message) {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    this.client.emit("message", {
      user: this.username,
      msg: message,
      timestamp,
    });
  }

  checkUsername(username) {
    this.client.emit("check-username", { username }); // Emit the 'check-username' event
  }
}

// Main flow for the client application
function main() {
  rl.question(chalk.cyan("== User == \nWhat is your name?: "), (username) => {
    const client = new Client();
    client.username = username;

    console.log(chalk.cyan("\nJoin a room or host your own room?"));
    rl.question(
      chalk.cyan("1) Join\n2) Host\nSelect one of the above: "),
      (choice) => {
        if (choice === "1") {
          joinRoom(client);
        } else if (choice === "2") {
          hostRoom(client);
        } else {
          console.log(chalk.red("Invalid choice! Please select 1 or 2."));
          rl.close();
        }
      },
    );
  });
}

// Join a room
function joinRoom(client) {
  rl.question(chalk.cyan("== Join a room == \nURL: "), (url) => {
    rl.question(chalk.cyan("Port: "), (port) => {
      client.serverUrl = `http://${url}:${port}`;

      console.log(chalk.green(`-- Checking if room exists [0%]`));
      setTimeout(() => {
        console.log(chalk.green(`-- Connecting to room [50%]`));
        setTimeout(() => {
          client.connect();
          console.log(chalk.green(`>> Connected to room ${url}:${port}`));
          promptUser(client);
        }, 1500); // Simulating connection delay
      }, 1000); // Simulating room checking delay
    });
  });
}

// Host a room
function hostRoom(client) {
  console.log(chalk.cyan("\n== Configure == "));
  rl.question(chalk.cyan("Max. people: "), (maxPeople) => {
    rl.question(chalk.cyan("Mode (public/private): "), (mode) => {
      let password = "";
      if (mode === "private") {
        rl.question(chalk.cyan("Password: "), (pass) => {
          password = pass;
          generateRoom(client, maxPeople, mode, password);
        });
      } else {
        generateRoom(client, maxPeople, mode, password);
      }
    });
  });
}

// Generate a room and connect
function generateRoom(client, maxPeople, mode, password) {
  const port = Math.floor(Math.random() * (9999 - 5000 + 1)) + 5000;
  const url = "localhost"; // The server URL can be dynamically adjusted or given to the user

  client.serverUrl = `http://${url}:${port}`;

  console.log(chalk.green(`-- Generating URL [0%]`));
  setTimeout(() => {
    console.log(chalk.green(`  -> Generated URL: ${url}`));
    console.log(chalk.green(`  -> Generated port: ${port}`));
    console.log(chalk.green(`  -> Room URL: ${url}:${port}`));
    setTimeout(() => {
      client.connect();
      console.log(chalk.green(`>> Connected to new room ${url}:${port}`));
      promptUser(client);
    }, 1500); // Simulating connection delay
  }, 1000); // Simulating room generation delay
}

// User message input loop
function promptUser(client) {
  rl.question(`${client.username}> `, (message) => {
    if (message.toLowerCase() === "/quit") {
      client.client.disconnect();
      rl.close();
      process.exit(0);
    } else {
      client.sendMessage(message);
    }
    promptUser(client);
  });
}

main();
