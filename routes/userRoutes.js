const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');

router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone,
    photo: req.user.photo,
  });
});

module.exports = router;