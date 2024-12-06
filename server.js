const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Sử dụng cors middleware

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Địa chỉ của client
    methods: ["GET", "POST"],
  },
});

// Lưu trữ thông tin về các phòng chat
const chatRooms = {};

// API để lấy danh sách các phòng chat
app.get("/api/chat-rooms", (req, res) => {
  res.json(Object.values(chatRooms));
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Client joined room: ${room}`);

    // Tạo phòng chat nếu chưa tồn tại
    if (!chatRooms[room]) {
      chatRooms[room] = { id: room, name: `Room for ${room}` };
    }
  });

  socket.on("sendMessage", (message) => {
    io.to(message.room).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(4000, () => console.log("Server is running on port 4000"));
