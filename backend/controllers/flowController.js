const hackathonService = require('../services/hackathonService');

const createFlow = async (req, res) => {
  try {
    const savedHackathon = await hackathonService.createHackathon(req.body);
    
    res.status(201).json({ 
      message: "Hackathon successfully deployed!",
      roomId: savedHackathon.roomId,
      organizerSecret: savedHackathon.organizerSecret,
      hackathon: savedHackathon
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFlow
};