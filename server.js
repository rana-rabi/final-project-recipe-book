require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipeBookDB';

app.use(express.json());

// Serve uploaded images statically, e.g. http://localhost:3000/uploads/recipe-123.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/recipes', recipeRoutes);

app.get('/', (req, res) => {
  res.send('Recipe Book API is running');
});

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