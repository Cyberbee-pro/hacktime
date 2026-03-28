const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', authController.updateProfile);
router.put('/active-room', authController.updateActiveRoom); // NEW

module.exports = router;