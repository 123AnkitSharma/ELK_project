const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment'); // Added Appointment model import

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

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { recipient, content, appointment } = req.body;

    // Add appointment validation for patients messaging doctors
    const recipientUser = await User.findById(recipient);

    // If a patient is messaging a doctor, validate they have an appointment
    if (req.user.role === 'patient' && recipientUser && recipientUser.role === 'doctor') {
      // Check if there's at least one appointment between them
      const hasAppointment = await Appointment.exists({
        patient: req.user.id,
        doctor: recipient
      });

      if (!hasAppointment) {
        return res.status(403).json({
          error: 'You can only message doctors you have appointments with'
        });
      }
    }

    // Create new message if validation passes
    const message = new Message({
      sender: req.user.id,
      recipient,
      content,
      appointment
    });

    await message.save();

    // Populate sender and recipient info for the response
    await message.populate('sender', 'name role');
    await message.populate('recipient', 'name role');

    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id }
      ]
    }).sort({ createdAt: 1 })
      .populate('sender', 'name role')
      .populate('recipient', 'name role');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    // Find all unique conversations partners
    const sentMessages = await Message.find({ sender: req.user.id })
      .distinct('recipient');
    const receivedMessages = await Message.find({ recipient: req.user.id })
      .distinct('sender');
    // Combine and remove duplicates more explicitly
    const uniquePartnerIds = Array.from(new Set([...sentMessages.map(id => id.toString()), 
                                                ...receivedMessages.map(id => id.toString())]));
    // Get user details and last message for each conversation
    const conversations = await Promise.all(
      uniquePartnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId).select('name role');
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user.id, recipient: partnerId },
            { sender: partnerId, recipient: req.user.id }
          ]
        }).sort({ createdAt: -1 });
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          recipient: req.user.id,
          read: false
        });
        return {
          partner,
          lastMessage,
          unreadCount
        };
      })
    );
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
router.put('/read/:senderId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.senderId, recipient: req.user.id },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;