require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const connectDB = require('./lib/connectDB');

const app = express();

// Increase payload limit to 50mb to allow Base64 Image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "Active", 
    engine: "HackClock Core",
    message: "Master Backend is operational. Use /api routes for data." 
  });
});


// Connect Master Router
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB Cluster Connection Error:', error);
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

app.use('/api', routes);

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, async () => {
    try {
      await connectDB();
      console.log(`Core Backend Engine Online: Port ${PORT}`);
    } catch (error) {
      console.error('MongoDB Cluster Connection Error:', error);
      process.exit(1);
    }
  });
}

module.exports = app;
