const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment'); // Added Appointment model

// Middleware to verify token
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

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get all doctors - Move this BEFORE the /:id route
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's doctors
router.get('/my-doctors', auth, async (req, res) => {
  try {
    // Get all appointments for this patient
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', '-password');
    
    // Extract unique doctors
    const uniqueDoctors = Array.from(
      new Map(
        appointments.map(app => [app.doctor._id.toString(), app.doctor])
      ).values()
    );
    
    res.json(uniqueDoctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role, profile, status = 'active' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      status,
      profile: role === 'doctor' ? {
        specialization: profile?.specialization,
        license: profile?.license
      } : {}
    });
    
    await user.save();
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update user status (admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.status = status;
    await user.save();
    
    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    console.log('🔍 Profile update requested for user:', user.name);
    console.log('🔍 User role:', user.role);
    console.log('🔍 Request body before filtering:', updates.profile);
    
    if (updates.name) user.name = updates.name;
    if (updates.profile) {
      // Role-specific profile update
      if (user.role === 'doctor') {
        console.log('👨‍⚕️ Updating doctor profile - keeping all fields');
        user.profile = { ...user.profile, ...updates.profile };
      } else {
        // For patients, exclude doctor-specific fields
        console.log('👤 Updating patient profile - filtering doctor fields');
        const { specialization, license, ...patientProfile } = updates.profile;
        console.log('❌ Removed fields:', { specialization, license });
        console.log('✅ Keeping fields:', patientProfile);
        user.profile = { ...user.profile, ...patientProfile };
      }
    }
    
    console.log('📊 Final profile after filtering:', user.profile);
    
    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;