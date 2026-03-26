// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
// We need an HTTP server to attach Socket.io to it
const server = http.createServer(app); 

// Configure Socket.io with CORS so your Next.js frontend can connect
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your Next.js local development URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// Basic API Route
app.get('/', (req, res) => {
  res.send('HackClock API is running');
});

// Socket.io Real-Time Connection Logic
io.on('connection', (socket) => {
  console.log(` A user connected: ${socket.id}`);

  // When a user joins a specific hackathon room (e.g., /room/AB12CD)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // When the organizer pauses/starts the timer, broadcast it to everyone in the room
  socket.on('timer-update', (data) => {
    // data would contain: { roomId: 'AB12CD', status: 'PAUSED', timeRemaining: ... }
    socket.to(data.roomId).emit('sync-timer', data);
  });

  socket.on('disconnect', () => {
    console.log(` User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});