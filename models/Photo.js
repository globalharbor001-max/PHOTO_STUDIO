const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  subEvent: {
    type: String, // Name of sub-event (Sangeet, Haldi, etc.)
    trim: true
  },
  // File information
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  thumbnailPath: {
    type: String
  },
  fileSize: {
    type: Number // in bytes
  },
  mimeType: {
    type: String
  },
  dimensions: {
    width: Number,
    height: Number
  },
  // Tagging - guests featured in this photo
  taggedGuests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest'
  }],
  // Manual tags (names without guest accounts)
  manualTags: [{
    type: String,
    trim: true
  }],
  // Metadata
  uploadDate: {
    type: Date,
    default: Date.now
  },
  capturedDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  // Watermark status
  isWatermarked: {
    type: Boolean,
    default: false
  },
  watermarkedPath: {
    type: String
  },
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  // Featured/Highlighted
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Status
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
photoSchema.index({ event: 1, uploadDate: -1 });
photoSchema.index({ event: 1, subEvent: 1 });
photoSchema.index({ taggedGuests: 1 });

module.exports = mongoose.model('Photo', photoSchema);
