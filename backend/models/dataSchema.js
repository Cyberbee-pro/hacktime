const mongoose = require('mongoose');

const PhaseSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  durationMinutes: { type: Number, required: true },
  autoTransition: { type: Boolean, default: false }
});

const HackathonSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  roomId: { type: String, required: true, unique: true }, 
  organizerSecret: { type: String, required: true }, 
  
  // Global Parameters
  eventStartTime: { type: String, default: "" },
  eventEndTime: { type: String, default: "" },
  timezone: { type: String, default: "UTC" },

  // Real-time State
  status: { type: String, enum: ['DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED'], default: 'DRAFT' },
  currentPhaseIndex: { type: Number, default: 0 },
  phaseEndTime: { type: Date, default: null }, 
  pausedRemainingMs: { type: Number, default: null }, 
  announcement: { type: String, default: "" }, 
  
  // Settings
  phases: [PhaseSchema],
  branding: {
    accentColor: { type: String, default: "#a2c9ff" },
    logoUrl: { type: String, default: "" } // This will hold our Base64 image string
  }
}, { timestamps: true });

// CRITICAL FIX: This prevents "findOne is not a function" errors
module.exports = mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema);
