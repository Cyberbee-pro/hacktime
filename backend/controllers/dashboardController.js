const hackathonService = require('../services/hackathonService');

const getDashboardData = async (req, res) => {
  try {
    const hackathon = await hackathonService.getHackathonByRoomId(req.params.roomId);
    
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    // We send the full hackathon data back to the UI
    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardData
};