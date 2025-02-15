const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true,
    unique: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  qrCode: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);