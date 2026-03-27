const bcrypt = require('bcrypt');
const User = require('../models/userSchema');

const registerUser = async (name, email, plainTextPassword) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

  const newUser = new User({
    name, // Added name here!
    email,
    password: hashedPassword
  });

  return await newUser.save();
};

const verifyLogin = async (email, plainTextPassword) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials.');
  }

  const isMatch = await bcrypt.compare(plainTextPassword, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  return {
    id: user._id,
    name: user.name, // Added name to the secure response!
    email: user.email,
    role: user.role
  };
};

module.exports = { registerUser, verifyLogin };