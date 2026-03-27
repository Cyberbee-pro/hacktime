const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
// Handles creating new organizer accounts
router.post('/register', authController.register);

// POST /api/auth/login
// Handles verifying passwords for existing accounts
router.post('/login', authController.login);

module.exports = router;