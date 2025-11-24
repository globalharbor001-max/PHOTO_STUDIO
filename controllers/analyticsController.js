const Analytics = require('../models/Analytics');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const Guest = require('../models/Guest');

/**
 * @desc    Get event analytics
 * @route   GET /api/events/:eventId/analytics
 * @access  Private
 */
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { startDate, endDate } = req.query;

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

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { event: eventId };
    if (Object.keys(dateFilter).length > 0) {
      query.timestamp = dateFilter;
    }

    // Get analytics data
    const [
      totalViews,
      totalDownloads,
      uniqueGuests,
      photoStats,
      dailyActivity
    ] = await Promise.all([
      // Total views
      Analytics.countDocuments({ ...query, actionType: 'view' }),

      // Total downloads
      Analytics.countDocuments({ ...query, actionType: 'download' }),

      // Unique guests who accessed
      Guest.countDocuments({ event: eventId, lastAccessDate: { $exists: true } }),

      // Photo statistics
      Photo.aggregate([
        { $match: { event: event._id } },
        {
          $group: {
            _id: null,
            totalPhotos: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalDownloads: { $sum: '$downloads' },
            avgViews: { $avg: '$views' },
            avgDownloads: { $avg: '$downloads' }
          }
        }
      ]),

      // Daily activity (last 30 days)
      Analytics.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              actionType: '$actionType'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': -1 } },
        { $limit: 60 } // 30 days * 2 action types
      ])
    ]);

    // Get top viewed photos
    const topPhotos = await Photo.find({ event: eventId })
      .sort({ views: -1 })
      .limit(10)
      .select('filename originalName views downloads thumbnailPath');

    // Get guest engagement
    const guestEngagement = await Guest.find({ event: eventId })
      .sort({ accessCount: -1 })
      .limit(10)
      .select('name accessCount photoCount lastAccessDate');

    // Format daily activity
    const activityByDate = {};
    dailyActivity.forEach(item => {
      const date = item._id.date;
      if (!activityByDate[date]) {
        activityByDate[date] = { date, views: 0, downloads: 0 };
      }
      activityByDate[date][item._id.actionType + 's'] = item.count;
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalPhotos: photoStats[0]?.totalPhotos || 0,
          totalViews: photoStats[0]?.totalViews || 0,
          totalDownloads: photoStats[0]?.totalDownloads || 0,
          uniqueGuests,
          avgViewsPerPhoto: Math.round(photoStats[0]?.avgViews || 0),
          avgDownloadsPerPhoto: Math.round(photoStats[0]?.avgDownloads || 0)
        },
        topPhotos,
        guestEngagement,
        dailyActivity: Object.values(activityByDate).sort((a, b) =>
          new Date(b.date) - new Date(a.date)
        )
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get photo analytics
 * @route   GET /api/photos/:id/analytics
 * @access  Private
 */
exports.getPhotoAnalytics = async (req, res, next) => {
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

    // Get analytics for this photo
    const analytics = await Analytics.aggregate([
      { $match: { photo: photo._id } },
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get activity timeline
    const timeline = await Analytics.find({ photo: photo._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('guest', 'name');

    res.json({
      success: true,
      data: {
        photo: {
          id: photo._id,
          filename: photo.originalName,
          views: photo.views,
          downloads: photo.downloads
        },
        analytics: analytics.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        timeline
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const photographerId = req.user.id;

    // Get all events for photographer
    const events = await Event.find({ photographer: photographerId });
    const eventIds = events.map(e => e._id);

    // Aggregate statistics
    const [
      totalEvents,
      activeEvents,
      totalPhotos,
      totalGuests,
      recentActivity
    ] = await Promise.all([
      // Total events
      Event.countDocuments({ photographer: photographerId }),

      // Active events
      Event.countDocuments({ photographer: photographerId, status: 'active' }),

      // Total photos
      Photo.countDocuments({ event: { $in: eventIds } }),

      // Total guests
      Guest.countDocuments({ event: { $in: eventIds } }),

      // Recent activity (last 7 days)
      Analytics.aggregate([
        {
          $match: {
            event: { $in: eventIds },
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$actionType',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Get recent events
    const recentEvents = await Event.find({ photographer: photographerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('eventName clientName eventDate totalPhotos totalViews totalDownloads status');

    // Format recent activity
    const activityStats = recentActivity.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        overview: {
          totalEvents,
          activeEvents,
          totalPhotos,
          totalGuests
        },
        recentActivity: {
          views: activityStats.view || 0,
          downloads: activityStats.download || 0,
          access: activityStats.access || 0
        },
        recentEvents
      }
    });
  } catch (error) {
    next(error);
  }
};
