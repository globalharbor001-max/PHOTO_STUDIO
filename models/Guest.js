const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Guest identification
  guestId: {
    type: String,
    unique: true,
    required: true
  },
  // Relation to couple
  relation: {
    type: String,
    enum: ['bride-side', 'groom-side', 'both', 'other'],
    default: 'other'
  },
  // Access tracking
  lastAccessDate: {
    type: Date
  },
  accessCount: {
    type: Number,
    default: 0
  },
  // Photo stats
  photoCount: {
    type: Number,
    default: 0
  },
  viewedPhotos: [{
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo'
    },
    viewedAt: Date
  }],
  downloadedPhotos: [{
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo'
    },
    downloadedAt: Date
  }],
  // Selfie for AI matching (future feature)
  selfieUrl: {
    type: String
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

// Indexes
guestSchema.index({ event: 1 });
guestSchema.index({ guestId: 1 });

module.exports = mongoose.model('Guest', guestSchema);
