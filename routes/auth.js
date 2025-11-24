const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  uploadLogo
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadLogo: uploadLogoMiddleware, handleUploadError } = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/logo', protect, uploadLogoMiddleware, handleUploadError, uploadLogo);

module.exports = router;
