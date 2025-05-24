const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
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
// Get medical records for a patient
router.get('/:patientId', auth, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    // Only allow patients to view their own records or doctors to view their patients' records
    if (req.user.id !== patientId && req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Not authorized to view these records' });
    }
    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'name profile.specialization')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ error: err.message });
  }
});
// Create a medical record (doctor only)
router.post('/', auth, async (req, res) => {
  try {
    // Only doctors can create medical records
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create medical records' });
    }
    const { patient, diagnosis, notes, prescription, appointment } = req.body;
    const record = new MedicalRecord({
      patient,
      doctor: req.user.id,
      diagnosis,
      notes,
      prescription,
      appointment
    });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(400).json({ error: err.message });
  }
});
// Update a medical record (doctor only)
router.put('/:recordId', auth, async (req, res) => {
  try {
    // Only doctors can update medical records
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can update medical records' });
    }
    const { diagnosis, notes, prescription } = req.body;
    const recordId = req.params.recordId;
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    // Ensure the doctor who created the record is updating it
    if (record.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this record' });
    }
    // Update fields
    if (diagnosis) record.diagnosis = diagnosis;
    if (notes) record.notes = notes;
    if (prescription) record.prescription = prescription;
    await record.save();
    res.json({ message: 'Medical record updated successfully' });
  } catch (err) {
    console.error('Error updating medical record:', err);
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;