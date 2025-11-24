const Guest = require('../models/Guest');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Create guest
 * @route   POST /api/events/:eventId/guests
 * @access  Private
 */
exports.createGuest = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone, relation, notes } = req.body;

    // Verify event
    const event = await Event.findOne({
      _id: eventId,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Generate unique guest ID
    const guestId = uuidv4().substring(0, 10).toUpperCase();

    const guest = await Guest.create({
      event: eventId,
      name,
      email,
      phone,
      guestId,
      relation,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      data: guest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all guests for event
 * @route   GET /api/events/:eventId/guests
 * @access  Private
 */
exports.getGuests = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { search, relation } = req.query;

    // Verify event
    const event = await Event.findOne({
      _id: eventId,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Build query
    const query = { event: eventId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (relation) query.relation = relation;

    const guests = await Guest.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: guests.length,
      data: guests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single guest
 * @route   GET /api/guests/:id
 * @access  Private/Public
 */
exports.getGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.json({
      success: true,
      data: guest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update guest
 * @route   PUT /api/guests/:id
 * @access  Private
 */
exports.updateGuest = async (req, res, next) => {
  try {
    let guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Verify ownership
    const event = await Event.findOne({
      _id: guest.event,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const allowedFields = ['name', 'email', 'phone', 'relation', 'notes'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    guest = await Guest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Guest updated successfully',
      data: guest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete guest
 * @route   DELETE /api/guests/:id
 * @access  Private
 */
exports.deleteGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Verify ownership
    const event = await Event.findOne({
      _id: guest.event,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Remove guest tags from photos
    await Photo.updateMany(
      { taggedGuests: guest._id },
      { $pull: { taggedGuests: guest._id } }
    );

    await guest.deleteOne();

    res.json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get guest's photos
 * @route   GET /api/guests/:id/photos
 * @access  Public
 */
exports.getGuestPhotos = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('event');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Track guest access
    guest.lastAccessDate = new Date();
    guest.accessCount += 1;
    await guest.save();

    // Get photos tagged with this guest
    const photos = await Photo.find({
      event: guest.event._id,
      taggedGuests: guest._id,
      isVisible: true
    }).sort({ uploadDate: -1 });

    // Update guest photo count
    guest.photoCount = photos.length;
    await guest.save();

    res.json({
      success: true,
      data: {
        guest: {
          name: guest.name,
          photoCount: photos.length,
          event: {
            eventName: guest.event.eventName,
            eventDate: guest.event.eventDate,
            downloadsEnabled: guest.event.downloadsEnabled
          }
        },
        photos
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk create guests
 * @route   POST /api/events/:eventId/guests/bulk
 * @access  Private
 */
exports.bulkCreateGuests = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { guests } = req.body; // Array of guest objects

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of guests'
      });
    }

    // Verify event
    const event = await Event.findOne({
      _id: eventId,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Add event ID and generate guest IDs
    const guestData = guests.map(guest => ({
      ...guest,
      event: eventId,
      guestId: uuidv4().substring(0, 10).toUpperCase()
    }));

    const createdGuests = await Guest.insertMany(guestData);

    res.status(201).json({
      success: true,
      message: `${createdGuests.length} guests created successfully`,
      data: createdGuests
    });
  } catch (error) {
    next(error);
  }
};
