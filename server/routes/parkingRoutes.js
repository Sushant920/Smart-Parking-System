const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.get('/slots', parkingController.getAllSlots);
router.post('/slots/toggle', parkingController.toggleSlot);
router.post('/slots/initialize', parkingController.initializeSlots);

module.exports = router;

