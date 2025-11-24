const express = require('express');
const router = express.Router();
const {
  uploadPhotos,
  getPhotos,
  getPhoto,
  downloadPhoto,
  addWatermark,
  addWatermarkToAll,
  deletePhoto,
  updateTags
} = require('../controllers/photoController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPhotos: uploadPhotosMiddleware, handleUploadError } = require('../middleware/upload');

// Public/Optional auth routes
router.get('/events/:eventId/photos', optionalAuth, getPhotos);
router.get('/:id', getPhoto);
router.get('/:id/download', downloadPhoto);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/events/:eventId/photos', uploadPhotosMiddleware, handleUploadError, uploadPhotos);
router.post('/events/:eventId/photos/watermark-all', addWatermarkToAll);
router.post('/:id/watermark', addWatermark);
router.put('/:id/tags', updateTags);
router.delete('/:id', deletePhoto);

module.exports = router;
