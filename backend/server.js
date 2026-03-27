require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();

// Increase payload limit to 50mb to allow Base64 Image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

// Connect Master Router
app.use('/api', routes);

// Connect directly to your existing MongoDB Cluster via .env
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("FATAL FAULT: MONGODB_URI is missing from your .env file!");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Secure Cluster Connection Established'))
  .catch(err => console.error('MongoDB Cluster Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Core Backend Engine Online: Port ${PORT}`);
});