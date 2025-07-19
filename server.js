const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

// Serve static files from /public folder
app.use(express.static(path.join(__dirname, "public")));

// Function to convert country code to flag emoji
function getFlagEmoji(countryCode) {
    if (!countryCode) return "";
    return countryCode
        .toUpperCase()
        .replace(/./g, char =>
            String.fromCodePoint(127397 + char.charCodeAt())
        );
}

// Handle socket connections
io.on("connection", (socket) => {
    console.log("🟢 A user connected");

    // Join room event
    socket.on("join-room", ({ username, room, country }) => {
        socket.username = username;
        socket.room = room;
        socket.country = country;

        socket.join(room);

        const flag = getFlagEmoji(country);
        console.log(`✅ ${username} ${flag} joined room: ${room}`);

        socket.to(room).emit("chat-message", {
            username: "System",
            text: `${username} ${flag} joined the chat room.`,
        });
    });

    // Chat message
    socket.on("chat-message", ({ text }) => {
        if (!socket.username || !socket.room) return;

        io.to(socket.room).emit("chat-message", {
            username: socket.username,
            text: text,
        });
    });

    // User disconnects
    socket.on("disconnect", () => {
        if (!socket.username || !socket.room) return;

        const flag = getFlagEmoji(socket.country);
        console.log(`🔴 ${socket.username} ${flag} left room: ${socket.room}`);

        socket.to(socket.room).emit("chat-message", {
            username: "System",
            text: `${socket.username} ${flag} left the chat room.`,
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
