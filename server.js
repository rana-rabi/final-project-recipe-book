require('dotenv').config();
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']); // Forces Cloudflare and Google DNS

const express = require('express');
const mongoose = require('mongoose');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipeBookDB';

// Required middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.use('/recipes', recipeRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Recipe Book API is running');
});

// Connect to MongoDB then start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });