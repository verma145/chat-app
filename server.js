const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join-room", ({ username, room }) => {
    socket.username = username;
    socket.room = room;
    socket.join(room);
    console.log(`${username} joined room: ${room}`);

    socket.to(room).emit("user-joined", `${username} joined the chat`);
  });

  socket.on("chat-message", ({ text }) => {
    if (!socket.username || !socket.room) return;
    io.to(socket.room).emit("chat-message", {
      username: socket.username,
      text: text
    });
  });

  socket.on("disconnect", () => {
    if (socket.username && socket.room) {
      socket.to(socket.room).emit("user-left", `${socket.username} left the chat`);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
