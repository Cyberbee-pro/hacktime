const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// NEW: PUT route to update the profile
router.put('/profile', authController.updateProfile);

module.exports = router;