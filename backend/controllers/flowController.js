const Hackathon = require('../models/dataSchema');

const deployFlow = async (req, res) => {
  try {
    const { name, organizerSecret, phases } = req.body;
    
    // Generate a secure 6-character alphanumeric Room ID
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Calculate the absolute end time based on the FIRST phase's duration
    const firstPhaseDuration = phases[0]?.durationMinutes || 60;
    const phaseEndTime = new Date(Date.now() + firstPhaseDuration * 60000);

    const newHackathon = new Hackathon({
      roomId,
      name,
      organizerSecret,
      phases,
      status: 'RUNNING', // Automatically start it for the demo
      currentPhaseIndex: 0,
      phaseEndTime
    });

    await newHackathon.save();
    res.status(201).json({ roomId, message: "Flow deployed successfully." });
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
};

// THIS LINE IS CRITICAL - It exposes the functions to the router
module.exports = { deployFlow, getRoomData };