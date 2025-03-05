const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const { startServer } = require("./server"); // Import the startServer function

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve a basic API endpoint
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Setup the server and socket.io
startServer(server);

// Start the Express server with the same port
const args = process.argv.slice(2); // Process command-line arguments

// Function to parse arguments
function getArgValue(flag) {
  const arg = args.find((arg) => arg.startsWith(`--${flag}=`));
  return arg ? arg.split("=")[1] : null;
}

const port = getArgValue("port") || 3000; // Default to 3000 if not provided

// Start the server on the specified port
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
