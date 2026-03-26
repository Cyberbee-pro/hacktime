const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app); 

// Allow Next.js frontend to talk to this server
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// Connect our API Routes!
app.use('/api/hackathons', require('./routes/routes'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// Basic Ping Route
app.get('/', (req, res) => {
  res.send('HackClock API is running');
});

// Socket.io Real-Time Engine
io.on('connection', (socket) => {
  console.log(` A user connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('timer-update', (data) => {
    socket.to(data.roomId).emit('sync-timer', data);
  });

  socket.on('disconnect', () => {
    console.log(` User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});