const express = require('express');
const router = express.Router();

const flowController = require('../controllers/flowController');
const dashboardController = require('../controllers/dashboardController');

// POST /api/hackathons/ - Create a new event
router.post('/', flowController.createFlow);

// GET /api/hackathons/:roomId - Get event data for the dashboard
router.get('/:roomId', dashboardController.getDashboardData);

module.exports = router;