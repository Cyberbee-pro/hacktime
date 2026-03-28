const authService = require('../services/authService');
const User = require('../models/userSchema');

const register = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required." });

    const newUser = await authService.registerUser(name, email, password, profilePic);
    res.status(201).json({ message: "Account initialized successfully.", userId: newUser._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const safeUserData = await authService.verifyLogin(email, password);
    res.status(200).json(safeUserData);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, name, profilePic } = req.body;
    if (!email || !name) return res.status(400).json({ error: "Email and Name are required." });

    const updatedUser = await authService.updateUserProfile(email, name, profilePic);
    res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateActiveRoom = async (req, res) => {
  try {
    const { email, roomId } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { email }, 
      { activeRoomId: roomId || null }, 
      { new: true }
    );
    res.status(200).json({ activeRoomId: updatedUser.activeRoomId });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

module.exports = { register, login, updateProfile, updateActiveRoom };
