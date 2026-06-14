const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  toggleFavorite,
  updateWatchHistory,
  getDashboard
} = require('../controllers/userController');

// User actions routes (all routes require token verification)
router.post('/favorite/:videoId', protect, toggleFavorite);
router.post('/history', protect, updateWatchHistory);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
