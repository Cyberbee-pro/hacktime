const bcrypt = require('bcryptjs');
const User = require('../models/userSchema');

const registerUser = async (name, email, plainTextPassword, profilePic) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('An account with this email already exists.');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    profilePic: profilePic || '/avatars/preset-1.jpeg',
    activeRoomId: null // Explicitly set to null on creation
  });

  return await newUser.save();
};

const verifyLogin = async (email, plainTextPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials.');

  const isMatch = await bcrypt.compare(plainTextPassword, user.password);
  if (!isMatch) throw new Error('Invalid credentials.');

  // Return the full safe object including the activeRoomId
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
    role: user.role,
    activeRoomId: user.activeRoomId 
  };
};

const updateUserProfile = async (email, newName, newProfilePic) => {
  const updatedUser = await User.findOneAndUpdate(
    { email }, 
    { name: newName, profilePic: newProfilePic }, 
    { new: true } 
  );
  
  if (!updatedUser) throw new Error('User not found.');
  return updatedUser;
};

module.exports = { registerUser, verifyLogin, updateUserProfile };
