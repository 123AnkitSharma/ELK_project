const mongoose = require('mongoose');
const medicalRecordSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  diagnosis: { 
    type: String, 
    required: true 
  },
  notes: { 
    type: String 
  },
  prescription: { 
    type: String 
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, { timestamps: true });
module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);