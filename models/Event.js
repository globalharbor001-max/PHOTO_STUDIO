const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  photographer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    enum: ['wedding', 'pre-wedding', 'engagement', 'reception', 'other'],
    default: 'wedding'
  },
  // Sub-events (Sangeet, Haldi, etc.)
  subEvents: [{
    name: {
      type: String,
      required: true
    },
    date: Date,
    photoCount: {
      type: Number,
      default: 0
    }
  }],
  // Access control
  accessCode: {
    type: String,
    unique: true,
    required: true
  },
  qrCode: {
    type: String // Base64 encoded QR code image
  },
  // Gallery type
  galleryType: {
    type: String,
    enum: ['private', 'public'], // private: guests see all, public: guests see only their tagged photos
    default: 'public'
  },
  // Download control
  downloadsEnabled: {
    type: Boolean,
    default: false
  },
  downloadMessage: {
    type: String,
    default: 'Downloads will be enabled after payment clearance'
  },
  // Watermark override (if different from photographer default)
  useCustomWatermark: {
    type: Boolean,
    default: false
  },
  watermarkSettings: {
    enabled: Boolean,
    text: String,
    opacity: Number,
    position: String
  },
  // Stats
  totalPhotos: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  totalDownloads: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'draft'],
    default: 'active'
  },
  // Location
  location: {
    venue: String,
    city: String,
    state: String
  },
  // Notes
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
eventSchema.index({ photographer: 1, eventDate: -1 });
eventSchema.index({ accessCode: 1 });

module.exports = mongoose.model('Event', eventSchema);
