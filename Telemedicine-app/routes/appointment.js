const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
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

// Book Appointment with availability validation
router.post('/', auth, async (req, res) => {
  const { patient, doctor, date, time } = req.body;
  
  try {
    // 1. Get doctor's availability
    const doctorData = await User.findById(doctor);
    
    if (!doctorData || doctorData.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // 2. Check if the doctor has availability set
    if (!doctorData.availability || doctorData.availability.length === 0) {
      return res.status(400).json({ error: 'This doctor has not set their availability yet' });
    }
    
    // 3. Check if the appointment date is on a day the doctor is available
    const appointmentDate = new Date(date);
    appointmentDate.setHours(12, 0, 0, 0);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];
    
    const dayAvailability = doctorData.availability.find(avail => avail.day === dayOfWeek);
    
    if (!dayAvailability) {
      return res.status(400).json({ error: `Doctor is not available on ${dayOfWeek}` });
    }
    
    // 4. Check if the appointment time falls within the doctor's available hours
    // Parse the time string (e.g., "09:00 AM" to 24h format for comparison)
    const parseTime = (timeStr) => {
      let [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }
      
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };
    
    const appointmentTime24h = parseTime(time);
    
    // Check if time is within any available slot for that day
    const isTimeAvailable = dayAvailability.slots.some(slot => {
      return appointmentTime24h >= slot.startTime && appointmentTime24h < slot.endTime;
    });
    
    if (!isTimeAvailable) {
      return res.status(400).json({ error: 'The selected time is not within doctor\'s available hours' });
    }
    
    // 5. Check if the doctor already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
      doctor,
      date: {
        // Match the same date, ignoring time
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      time,
      status: { $in: ['pending', 'approved'] } // Only consider pending or approved appointments
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: 'Doctor already has an appointment at this time' });
    }
    
    // All validations passed, create appointment
    const appointment = new Appointment({ patient, doctor, date, time });
    await appointment.save();
    
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get Appointments (for Doctor/Patient)
router.get('/:userId', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ patient: req.params.userId }, { doctor: req.params.userId }]
    }).populate('patient doctor');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status
router.put('/:appointmentId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status is one of the allowed values
    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const appointment = await Appointment.findById(req.params.appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check authorization - only the doctor of this appointment can update its status
    if (appointment.doctor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }
    
    appointment.status = status;
    await appointment.save();
    
    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update appointment notes
router.put('/:appointmentId/notes', auth, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const appointment = await Appointment.findById(req.params.appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check authorization - only the doctor of this appointment can update notes
    if (appointment.doctor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }
    
    appointment.notes = notes;
    await appointment.save();
    
    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment notes:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;