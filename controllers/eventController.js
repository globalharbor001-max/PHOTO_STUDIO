const Event = require('../models/Event');
const Photo = require('../models/Photo');
const Guest = require('../models/Guest');
const { generateQRCode } = require('../utils/qrCode');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Create new event
 * @route   POST /api/events
 * @access  Private
 */
exports.createEvent = async (req, res, next) => {
  try {
    const {
      eventName,
      clientName,
      eventDate,
      eventType,
      subEvents,
      galleryType,
      location,
      notes
    } = req.body;

    // Generate unique access code
    const accessCode = uuidv4().substring(0, 8).toUpperCase();

    // Generate QR code
    const qrCodeUrl = `${process.env.CLIENT_URL}/gallery/${accessCode}`;
    const qrCode = await generateQRCode(qrCodeUrl);

    // Create event
    const event = await Event.create({
      photographer: req.user.id,
      eventName,
      clientName,
      eventDate,
      eventType,
      subEvents: subEvents || [],
      accessCode,
      qrCode,
      galleryType: galleryType || 'public',
      location,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events for photographer
 * @route   GET /api/events
 * @access  Private
 */
exports.getEvents = async (req, res, next) => {
  try {
    const { status, eventType, search } = req.query;

    // Build query
    const query = { photographer: req.user.id };

    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .sort({ eventDate: -1 })
      .select('-qrCode'); // Exclude large QR code data from list

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event
 * @route   GET /api/events/:id
 * @access  Private
 */
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get additional stats
    const photoCount = await Photo.countDocuments({ event: event._id });
    const guestCount = await Guest.countDocuments({ event: event._id });

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        photoCount,
        guestCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private
 */
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findOne({
      _id: req.params.id,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const allowedFields = [
      'eventName', 'clientName', 'eventDate', 'eventType', 'subEvents',
      'galleryType', 'downloadsEnabled', 'downloadMessage', 'useCustomWatermark',
      'watermarkSettings', 'status', 'location', 'notes'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    event = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete all associated photos and guests
    await Photo.deleteMany({ event: event._id });
    await Guest.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get event by access code (for guests)
 * @route   GET /api/events/access/:code
 * @access  Public
 */
exports.getEventByAccessCode = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      accessCode: req.params.code,
      status: 'active'
    }).populate('photographer', 'name studioName logo website socialMedia');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or inactive'
      });
    }

    // Increment view count
    event.totalViews += 1;
    await event.save();

    // Return limited data for guests
    res.json({
      success: true,
      data: {
        _id: event._id,
        eventName: event.eventName,
        eventDate: event.eventDate,
        eventType: event.eventType,
        subEvents: event.subEvents,
        galleryType: event.galleryType,
        downloadsEnabled: event.downloadsEnabled,
        downloadMessage: event.downloadMessage,
        photographer: event.photographer,
        totalPhotos: event.totalPhotos
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle downloads for event
 * @route   PUT /api/events/:id/downloads
 * @access  Private
 */
exports.toggleDownloads = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.downloadsEnabled = !event.downloadsEnabled;
    await event.save();

    res.json({
      success: true,
      message: `Downloads ${event.downloadsEnabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        downloadsEnabled: event.downloadsEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Regenerate QR code
 * @route   POST /api/events/:id/qr-code
 * @access  Private
 */
exports.regenerateQRCode = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Regenerate QR code
    const qrCodeUrl = `${process.env.CLIENT_URL}/gallery/${event.accessCode}`;
    const qrCode = await generateQRCode(qrCodeUrl);

    event.qrCode = qrCode;
    await event.save();

    res.json({
      success: true,
      message: 'QR code regenerated successfully',
      data: {
        qrCode: event.qrCode
      }
    });
  } catch (error) {
    next(error);
  }
};
