const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Make sure we demand the name now
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const newUser = await authService.registerUser(name, email, password);
    res.status(201).json({ message: "Account initialized successfully.", userId: newUser._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const safeUserData = await authService.verifyLogin(email, password);
    res.status(200).json(safeUserData);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { register, login };