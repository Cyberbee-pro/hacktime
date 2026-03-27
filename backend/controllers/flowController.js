const Hackathon = require('../models/dataSchema');
const User = require('../models/userSchema');

const deployFlow = async (req, res) => {
  try {
    const { name, organizerSecret, eventStartTime, eventEndTime, timezone, branding, phases } = req.body;
    
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const firstPhaseDuration = phases[0]?.durationMinutes || 60;
    const phaseEndTime = new Date(Date.now() + firstPhaseDuration * 60000);

    const newHackathon = new Hackathon({
      roomId, name, organizerSecret, eventStartTime, eventEndTime, timezone, branding, phases,
      status: 'RUNNING', currentPhaseIndex: 0, phaseEndTime
    });

    await newHackathon.save();

    if (organizerSecret) {
      await User.findOneAndUpdate({ email: organizerSecret }, { activeRoomId: roomId });
    }

    res.status(201).json({ roomId, message: "Flow deployed successfully." });
  } catch (err) {
    console.error("Deploy Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getRoomData = async (req, res) => {
  try {
    const { roomId } = req.params;
    const hackathon = await Hackathon.findOne({ roomId: roomId.toUpperCase() });
    
    if (!hackathon) return res.status(404).json({ error: "Room not found." });
    
    res.status(200).json(hackathon);
  } catch (err) {
    console.error("Fetch Room Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// NEW: Master Control Endpoint with Security Verification
const updateRoomState = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { action, organizerSecret } = req.body;
    
    const room = await Hackathon.findOne({ roomId: roomId.toUpperCase() });
    if (!room) return res.status(404).json({ error: "Room not found." });

    // SECURITY CHECK: Only the creator can control the timeline
    if (room.organizerSecret !== organizerSecret) {
      return res.status(403).json({ error: "SECURITY FAULT: You do not have authorization to control this room." });
    }

    if (action === 'PAUSE' && room.status === 'RUNNING') {
      // Freeze the timer by saving the exact remaining milliseconds
      room.pausedRemainingMs = room.phaseEndTime.getTime() - Date.now();
      room.phaseEndTime = null;
      room.status = 'PAUSED';
    } 
    else if (action === 'RESUME' && room.status === 'PAUSED') {
      // Resume the timer by projecting the remaining milliseconds into the future
      room.phaseEndTime = new Date(Date.now() + room.pausedRemainingMs);
      room.pausedRemainingMs = null;
      room.status = 'RUNNING';
    } 
    else if (action === 'NEXT_PHASE') {
      // Advance to the next phase in the array
      room.currentPhaseIndex += 1;
      
      if (room.currentPhaseIndex >= room.phases.length) {
        room.status = 'COMPLETED';
        room.phaseEndTime = null;
      } else {
        const nextDuration = room.phases[room.currentPhaseIndex].durationMinutes;
        room.phaseEndTime = new Date(Date.now() + nextDuration * 60000);
        room.status = 'RUNNING';
        room.pausedRemainingMs = null;
      }
    }

    await room.save();
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { deployFlow, getRoomData, updateRoomState };