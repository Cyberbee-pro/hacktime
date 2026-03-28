const express = require('express');
const router = express.Router();
const flowController = require('../controllers/flowController');

router.post('/', flowController.deployFlow);
router.get('/:roomId', flowController.getRoomData);
router.put('/:roomId/state', flowController.updateRoomState);
router.post('/:roomId/join', flowController.joinRoom); 

module.exports = router;