const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '/avatars/preset-1.jpeg' },
  role: { type: String, default: 'organizer' },
  // NEW: Tracks the current active session
  activeRoomId: { type: String, default: null } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);