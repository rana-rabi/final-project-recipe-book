require('dotenv').config();
const dns = require('dns');
const cors = require('cors');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const recipeRoutes = require('./routes/recipeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipeBookDB';


app.use(express.json());
app.use(cors()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/recipes', recipeRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

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