const express = require('express');
const router = express.Router();

const hackathonRoutes = require('./hackathonRoutes');
const authRoutes = require('./authRoutes'); 

// All hackathon-related routes go through here (/api/hackathons)
router.use('/hackathons', hackathonRoutes);

// All authentication-related routes go through here (/api/auth)
router.use('/auth', authRoutes); 

module.exports = router;