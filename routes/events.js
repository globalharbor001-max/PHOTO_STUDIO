const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventByAccessCode,
  toggleDownloads,
  regenerateQRCode
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/access/:code', getEventByAccessCode);

// Protected routes
router.use(protect); // All routes below require authentication

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

router.put('/:id/downloads', toggleDownloads);
router.post('/:id/qr-code', regenerateQRCode);

module.exports = router;
