const express = require('express');
const router = express.Router();
const {
  getEventAnalytics,
  getPhotoAnalytics,
  getDashboardStats
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// All analytics routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/events/:eventId', getEventAnalytics);
router.get('/photos/:id', getPhotoAnalytics);

module.exports = router;
