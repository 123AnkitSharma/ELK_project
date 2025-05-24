const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Report = require('../models/Report');

// Auth middleware with admin check
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

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const doctors = await User.countDocuments({ role: 'doctor' });
    const patients = await User.countDocuments({ role: 'patient' });
    
    // Get appointment counts
    const appointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    
    // Get user role distribution for chart
    const usersByRole = [
      { name: 'Patients', value: patients },
      { name: 'Doctors', value: doctors },
      { name: 'Admins', value: await User.countDocuments({ role: 'admin' }) }
    ];
    
    // Get appointment status distribution for chart
    const appointmentsByStatus = [
      { name: 'Pending', value: pendingAppointments },
      { name: 'Approved', value: await Appointment.countDocuments({ status: 'approved' }) },
      { name: 'Completed', value: await Appointment.countDocuments({ status: 'completed' }) },
      { name: 'Rejected', value: await Appointment.countDocuments({ status: 'rejected' }) }
    ];
    
    res.json({
      totalUsers,
      activeUsers,
      doctors,
      patients,
      appointments,
      pendingAppointments,
      recentUsers,
      usersByRole,
      appointmentsByStatus
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate reports
router.get('/reports/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (type === 'appointments') {
      // Get appointments in date range
      const appointments = await Appointment.find({
        date: { $gte: start, $lte: end }
      })
        .populate('patient', 'name email')
        .populate('doctor', 'name profile.specialization')
        .sort({ date: -1 });
      
      // Calculate stats
      const total = appointments.length;
      const completed = appointments.filter(app => app.status === 'completed').length;
      const pending = appointments.filter(app => app.status === 'pending').length;
      
      // Generate chart data - status distribution
      const statusData = [
        { name: 'Completed', value: completed },
        { name: 'Pending', value: pending },
        { name: 'Approved', value: appointments.filter(app => app.status === 'approved').length },
        { name: 'Rejected', value: appointments.filter(app => app.status === 'rejected').length }
      ];
      
      // Generate chart data - appointments by date
      const dateMap = new Map();
      appointments.forEach(app => {
        const dateStr = new Date(app.date).toLocaleDateString();
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
      });
      
      const dateData = Array.from(dateMap.entries()).map(([name, appointments]) => ({
        name,
        appointments
      })).sort((a, b) => new Date(a.name) - new Date(b.name));
      
      res.json({
        appointments,
        stats: {
          total,
          completed,
          pending
        },
        chartData: {
          statusData,
          dateData
        }
      });
    } else if (type === 'users') {
      // Implementation for user reports
      const users = await User.find({
        createdAt: { $gte: start, $lte: end }
      }).select('-password');
      
      res.json(users);
    } else {
      res.status(400).json({ error: 'Invalid report type' });
    }
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;