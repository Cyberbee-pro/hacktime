const crypto = require('crypto');
const Hackathon = require('../models/dataSchema');

const createHackathon = async (data) => {
  const roomId = crypto.randomBytes(3).toString('hex').toUpperCase();
  const organizerSecret = crypto.randomBytes(16).toString('hex');

  const newHackathon = new Hackathon({
    name: data.name || "Untitled Hackathon",
    roomId: roomId,
    organizerSecret: organizerSecret,
    phases: data.phases || [],
    branding: data.branding || {}
  });

  return await newHackathon.save();
};

const getHackathonByRoomId = async (roomId) => {
  return await Hackathon.findOne({ roomId });
};

module.exports = {
  createHackathon,
  getHackathonByRoomId
};