const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const parkingRoutes = require('./routes/parkingRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', parkingRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});