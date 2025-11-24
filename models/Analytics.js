const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest'
  },
  actionType: {
    type: String,
    enum: ['view', 'download', 'share', 'access'],
    required: true
  },
  // Additional data
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes for analytics queries
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ photo: 1, actionType: 1 });
analyticsSchema.index({ guest: 1, actionType: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
