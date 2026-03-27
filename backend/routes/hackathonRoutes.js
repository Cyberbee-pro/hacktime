const express = require('express');
const router = express.Router();
const flowController = require('../controllers/flowController');

router.post('/', flowController.deployFlow);
router.get('/:roomId', flowController.getRoomData);

// NEW: PUT route to handle the engine controls
router.put('/:roomId/state', flowController.updateRoomState);

module.exports = router;