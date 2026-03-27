const express = require('express');
const router = express.Router();

// Import the controller we just built above
const flowController = require('../controllers/flowController');

// POST /api/hackathons -> Creates a new room
router.post('/', flowController.deployFlow);

// GET /api/hackathons/:roomId -> Fetches room data
router.get('/:roomId', flowController.getRoomData);

module.exports = router;