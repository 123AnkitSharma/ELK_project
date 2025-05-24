const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    default: 'Medical Report'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);