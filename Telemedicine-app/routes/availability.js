const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get doctor availability
router.get('/:doctorId', auth, async (req, res) => {
  try {
    const doctor = await User.findById(req.params.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json(doctor.availability || []);
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update doctor availability
router.put('/', auth, async (req, res) => {
  try {
    // Ensure user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const { availability } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.availability = availability;
    await user.save();
    
    res.json({ message: 'Availability updated successfully' });
  } catch (err) {
    console.error('Error updating availability:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;