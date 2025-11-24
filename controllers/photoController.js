const Photo = require('../models/Photo');
const Event = require('../models/Event');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { addTextWatermark, addLogoWatermark, generateThumbnail } = require('../utils/watermark');

/**
 * @desc    Upload photos to event
 * @route   POST /api/events/:eventId/photos
 * @access  Private
 */
exports.uploadPhotos = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { subEvent } = req.body;

    // Verify event belongs to photographer
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one photo'
      });
    }

    // Process each uploaded file
    const photoPromises = req.files.map(async (file) => {
      try {
        // Get image dimensions
        const metadata = await sharp(file.path).metadata();

        // Generate thumbnail
        const thumbnailDir = path.join(path.dirname(file.path), 'thumbnails');
        if (!fs.existsSync(thumbnailDir)) {
          fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        const thumbnailPath = path.join(thumbnailDir, file.filename);
        await generateThumbnail(file.path, thumbnailPath);

        // Create photo document
        return {
          event: eventId,
          subEvent: subEvent || null,
          filename: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          thumbnailPath,
          fileSize: file.size,
          mimeType: file.mimetype,
          dimensions: {
            width: metadata.width,
            height: metadata.height
          },
          capturedDate: metadata.exif?.DateTimeOriginal || new Date()
        };
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        return null;
      }
    });

    const photoData = (await Promise.all(photoPromises)).filter(p => p !== null);

    // Bulk insert photos
    const photos = await Photo.insertMany(photoData);

    // Update event photo count
    event.totalPhotos += photos.length;

    // Update sub-event photo count if applicable
    if (subEvent) {
      const subEventIndex = event.subEvents.findIndex(se => se.name === subEvent);
      if (subEventIndex !== -1) {
        event.subEvents[subEventIndex].photoCount += photos.length;
      }
    }

    await event.save();

    res.status(201).json({
      success: true,
      message: `${photos.length} photos uploaded successfully`,
      data: photos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get photos for an event
 * @route   GET /api/events/:eventId/photos
 * @access  Private/Public
 */
exports.getPhotos = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { subEvent, page = 1, limit = 50, guestId } = req.query;

    // Build query
    const query = { event: eventId, isVisible: true };
    if (subEvent) query.subEvent = subEvent;

    // If guestId provided (guest view), filter by tagged photos
    if (guestId) {
      query.taggedGuests = guestId;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const photos = await Photo.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-filePath'); // Don't expose full file paths to clients

    const total = await Photo.countDocuments(query);

    res.json({
      success: true,
      data: photos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single photo
 * @route   GET /api/photos/:id
 * @access  Public
 */
exports.getPhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Increment view count
    photo.views += 1;
    await photo.save();

    // Log analytics
    await Analytics.create({
      event: photo.event,
      photo: photo._id,
      actionType: 'view'
    });

    res.json({
      success: true,
      data: photo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download photo
 * @route   GET /api/photos/:id/download
 * @access  Public
 */
exports.downloadPhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('event');

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Check if downloads are enabled for this event
    if (!photo.event.downloadsEnabled) {
      return res.status(403).json({
        success: false,
        message: photo.event.downloadMessage || 'Downloads are currently disabled for this event'
      });
    }

    // Increment download count
    photo.downloads += 1;
    await photo.save();

    // Update event total downloads
    photo.event.totalDownloads += 1;
    await photo.event.save();

    // Log analytics
    await Analytics.create({
      event: photo.event._id,
      photo: photo._id,
      actionType: 'download'
    });

    // Send file
    const filePath = photo.isWatermarked && photo.watermarkedPath
      ? photo.watermarkedPath
      : photo.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Photo file not found'
      });
    }

    res.download(filePath, photo.originalName);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add watermark to photo
 * @route   POST /api/photos/:id/watermark
 * @access  Private
 */
exports.addWatermark = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('event');

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Verify ownership
    const event = await Event.findOne({
      _id: photo.event._id,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get watermark settings
    const watermarkSettings = event.useCustomWatermark
      ? event.watermarkSettings
      : req.user.watermarkSettings;

    if (!watermarkSettings.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Watermark is not enabled'
      });
    }

    // Generate watermarked image path
    const watermarkDir = path.join(path.dirname(photo.filePath), 'watermarked');
    if (!fs.existsSync(watermarkDir)) {
      fs.mkdirSync(watermarkDir, { recursive: true });
    }
    const watermarkedPath = path.join(watermarkDir, photo.filename);

    // Apply watermark
    const user = await User.findById(req.user.id);

    if (user.logo && fs.existsSync(user.logo)) {
      // Use logo watermark
      await addLogoWatermark(
        photo.filePath,
        user.logo,
        watermarkedPath,
        {
          opacity: watermarkSettings.opacity,
          position: watermarkSettings.position
        }
      );
    } else {
      // Use text watermark
      const watermarkText = watermarkSettings.text || user.studioName;
      await addTextWatermark(
        photo.filePath,
        watermarkedPath,
        {
          text: watermarkText,
          opacity: watermarkSettings.opacity,
          position: watermarkSettings.position
        }
      );
    }

    // Update photo
    photo.isWatermarked = true;
    photo.watermarkedPath = watermarkedPath;
    await photo.save();

    res.json({
      success: true,
      message: 'Watermark added successfully',
      data: photo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add watermark to all photos in event
 * @route   POST /api/events/:eventId/photos/watermark-all
 * @access  Private
 */
exports.addWatermarkToAll = async (req, res, next) => {
  try {
    const { eventId } = req.params;

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

    // Get all photos without watermark
    const photos = await Photo.find({
      event: eventId,
      isWatermarked: false
    });

    if (photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos to watermark'
      });
    }

    // Get watermark settings
    const watermarkSettings = event.useCustomWatermark
      ? event.watermarkSettings
      : req.user.watermarkSettings;

    const user = await User.findById(req.user.id);

    // Process photos in batches
    let successCount = 0;
    let errorCount = 0;

    for (const photo of photos) {
      try {
        const watermarkDir = path.join(path.dirname(photo.filePath), 'watermarked');
        if (!fs.existsSync(watermarkDir)) {
          fs.mkdirSync(watermarkDir, { recursive: true });
        }
        const watermarkedPath = path.join(watermarkDir, photo.filename);

        if (user.logo && fs.existsSync(user.logo)) {
          await addLogoWatermark(photo.filePath, user.logo, watermarkedPath, {
            opacity: watermarkSettings.opacity,
            position: watermarkSettings.position
          });
        } else {
          const watermarkText = watermarkSettings.text || user.studioName;
          await addTextWatermark(photo.filePath, watermarkedPath, {
            text: watermarkText,
            opacity: watermarkSettings.opacity,
            position: watermarkSettings.position
          });
        }

        photo.isWatermarked = true;
        photo.watermarkedPath = watermarkedPath;
        await photo.save();
        successCount++;
      } catch (error) {
        console.error(`Error watermarking photo ${photo._id}:`, error);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Watermark process completed`,
      data: {
        successCount,
        errorCount,
        totalProcessed: successCount + errorCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete photo
 * @route   DELETE /api/photos/:id
 * @access  Private
 */
exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Verify ownership
    const event = await Event.findOne({
      _id: photo.event,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete files
    if (fs.existsSync(photo.filePath)) {
      fs.unlinkSync(photo.filePath);
    }
    if (photo.thumbnailPath && fs.existsSync(photo.thumbnailPath)) {
      fs.unlinkSync(photo.thumbnailPath);
    }
    if (photo.watermarkedPath && fs.existsSync(photo.watermarkedPath)) {
      fs.unlinkSync(photo.watermarkedPath);
    }

    // Delete photo document
    await photo.deleteOne();

    // Update event photo count
    event.totalPhotos = Math.max(0, event.totalPhotos - 1);
    await event.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update photo tags
 * @route   PUT /api/photos/:id/tags
 * @access  Private
 */
exports.updateTags = async (req, res, next) => {
  try {
    const { taggedGuests, manualTags } = req.body;

    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Verify ownership
    const event = await Event.findOne({
      _id: photo.event,
      photographer: req.user.id
    });

    if (!event) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (taggedGuests) photo.taggedGuests = taggedGuests;
    if (manualTags) photo.manualTags = manualTags;

    await photo.save();

    res.json({
      success: true,
      message: 'Tags updated successfully',
      data: photo
    });
  } catch (error) {
    next(error);
  }
};
