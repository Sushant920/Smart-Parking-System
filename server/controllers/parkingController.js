const { pool } = require('../config/db');
const QRCode = require('qrcode');

const parkingController = {
  getAllSlots: async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM parking_slots ORDER BY slot_number'
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch parking slots' });
    }
  },

  toggleSlot: async (req, res) => {
    const { slotNumber } = req.body;
    
    try {
      // Get current slot status
      const { rows } = await pool.query(
        'SELECT * FROM parking_slots WHERE slot_number = $1',
        [slotNumber]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      
      const slot = rows[0];
      const newStatus = !slot.is_occupied;
      let qrCode = null;
      
      if (newStatus) {
        // Generate QR only when occupying the slot
        const qrData = JSON.stringify({
          slotNumber,
          timestamp: new Date()
        });
        qrCode = await QRCode.toDataURL(qrData);
      }
      
      // Update slot status
      const { rows: updatedRows } = await pool.query(
        `UPDATE parking_slots 
         SET is_occupied = $1, qr_code = $2 
         WHERE slot_number = $3 
         RETURNING *`,
        [newStatus, qrCode, slotNumber]
      );
      
      res.json(updatedRows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update parking slot' });
    }
  },

  initializeSlots: async (req, res) => {
    const { numberOfSlots } = req.body;
    
    try {
      // Clear existing slots
      await pool.query('TRUNCATE TABLE parking_slots RESTART IDENTITY');
      
      // Generate values for bulk insert
      const values = Array.from({ length: numberOfSlots }, (_, i) => (
        `('A${i + 1}', false, null)`
      )).join(',');
      
      // Bulk insert new slots
      await pool.query(`
        INSERT INTO parking_slots (slot_number, is_occupied, qr_code)
        VALUES ${values}
      `);
      
      res.json({ message: `${numberOfSlots} parking slots initialized` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initialize parking slots' });
    }
  }
};

module.exports = parkingController;