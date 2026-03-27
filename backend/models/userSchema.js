const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: '/avatars/preset-1.png'
  },
  role: {
    type: String,
    default: 'organizer' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);