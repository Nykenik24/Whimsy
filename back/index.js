const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const setupWebSocket = require("./socket/wsServer.js");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve a basic API endpoint
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Setup the server
setupWebSocket(server);

// Start the server
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
