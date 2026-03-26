const express = require('express');
const router = express.Router();
const crypto = require('crypto'); // Built into Node.js, used for generating random IDs
const Hackathon = require('../models/dataSchema');

// POST /api/hackathons - Create a new hackathon flow
router.post('/', async (req, res) => {
  try {
    // Generate a random 6-character Room ID (e.g., A8F9C2)
    const roomId = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Generate a long, secure secret token for the organizer
    const organizerSecret = crypto.randomBytes(16).toString('hex');

    const newHackathon = new Hackathon({
      name: req.body.name || "Untitled Hackathon",
      roomId: roomId,
      organizerSecret: organizerSecret,
      phases: req.body.phases || [],
      branding: req.body.branding || {}
    });

    const savedHackathon = await newHackathon.save();

    res.status(201).json({ 
      message: "Hackathon successfully deployed!",
      roomId: savedHackathon.roomId,
      organizerSecret: savedHackathon.organizerSecret,
      hackathon: savedHackathon
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  // GET /api/hackathons/:roomId - Fetch hackathon data for the frontend
router.get('/:roomId', async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({ roomId: req.params.roomId });
    
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

});

module.exports = router;