const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');

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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure local temporary storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload report
router.post('/upload', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create buffer data URI for cloudinary upload
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: 'medical-reports',
      resource_type: 'auto' // Auto-detect file type
    });

    // Create report record in database
    const report = new Report({
      patient: req.user.role === 'patient' ? req.user.id : req.body.patientId,
      uploadedBy: req.user.id,
      fileUrl: uploadResponse.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      description: req.body.description || 'Medical Report'
    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.error('Error uploading report:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get reports for a patient
router.get('/:patientId', auth, async (req, res) => {
  try {
    // Only allow patients to view their own reports or doctors who have appointments with them
    if (req.user.role === 'patient' && req.user.id !== req.params.patientId) {
      return res.status(403).json({ error: 'Not authorized to view these reports' });
    }

    const reports = await Report.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;