const express = require('express');
const router = express.Router();
const {
  createGuest,
  getGuests,
  getGuest,
  updateGuest,
  deleteGuest,
  getGuestPhotos,
  bulkCreateGuests
} = require('../controllers/guestController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes (guests accessing their photos)
router.get('/:id', optionalAuth, getGuest);
router.get('/:id/photos', getGuestPhotos);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/events/:eventId/guests', createGuest);
router.post('/events/:eventId/guests/bulk', bulkCreateGuests);
router.get('/events/:eventId/guests', getGuests);
router.put('/:id', updateGuest);
router.delete('/:id', deleteGuest);

module.exports = router;
