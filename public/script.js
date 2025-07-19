const socket = io();

const joinForm = document.querySelector("#join-form form");
const chatSection = document.getElementById("chat-section");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("msg");
const messagesList = document.getElementById("messages");
const roomDisplay = document.getElementById("chat-room-name");

let username = "";
let room = "";

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = document.getElementById("username").value.trim();
  room = document.getElementById("room").value.trim();
const country = document.getElementById("country").value;

  if (!username || !room) return;

  socket.emit("join-room", { username, room, country });
  roomDisplay.textContent = room;

  document.getElementById("join-form").style.display = "none";
  chatSection.style.display = "block";
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit("chat-message", { text });
  appendMessage({ username, text }, true);
  messageInput.value = "";
});

function appendMessage(msg, isOwn = false) {
  const li = document.createElement("li");
  li.textContent = `${msg.username}: ${msg.text}`;
  li.classList.add(isOwn ? "sent" : "received");
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
}

socket.on("chat-message", (msg) => {
  appendMessage(msg, msg.username === username);
});

socket.on("user-joined", (notice) => {
  appendSystemMessage(notice);
});

socket.on("user-left", (notice) => {
  appendSystemMessage(notice);
});

function appendSystemMessage(message) {
  const li = document.createElement("li");
  li.textContent = message;
  li.style.textAlign = "center";
  li.style.fontStyle = "italic";
  li.style.color = "gray";
  messagesList.appendChild(li);
}
