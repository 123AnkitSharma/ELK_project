const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const winston = require('winston');
require('winston-logstash');

const User = require('./models/User');

// Routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const medicalRecordRoutes = require('./routes/medicalRecord');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const availabilityRoutes = require('./routes/availability');

const app = express();

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'telemedicine-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      host: 'logstash',
      port: 5000,
      path: '/',
    })
  ]
});

// Middlewares
app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip
  });
  next();
});

// Error Logging Middleware
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).send('Something broke!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/medical-history', medicalRecordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    logger.info("Connected to MongoDB");
    
    // Check if any admin exists, if not, create a default admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount === 0) {
      logger.info("No admin found. Creating default admin account...");
      try {
        await User.create({
          name: 'Admin',
          email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com',
          password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin@123', 
          role: 'admin',
          status: 'active'
        });
        
        logger.info("Default admin account created successfully");
      } catch (err) {
        logger.error("Failed to create default admin:", err.message);
      }
    }
  })
  .catch(err => logger.error(err));

// Test Route
app.get('/', (req, res) => {
  res.send("Telemedicine API Running");
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));