const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

// Set view engine to EJS
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Store user locations
const users = {};

io.on("connection", function (socket) {
    console.log("A user connected");

    // Send current users' locations to the newly connected user
    socket.emit("current-users", users);

    socket.on("send-location", function (data) {
        users[socket.id] = data;
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("send-message", function (message) {
        io.emit("receive-message", { id: socket.id, message });
    });

    socket.on("disconnect", function () {
        delete users[socket.id];
        io.emit("user-disconnected", socket.id);
    });
});

// Routes
app.get("/", function (req, res) {
    res.render("index");
});

// Start server
server.listen(3000, function () {
    console.log("Server is listening on port 3000");
});
