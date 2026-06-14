const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  toggleFavorite,
  updateWatchHistory,
  getDashboard,
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist
} = require('../controllers/userController');

// User actions routes (all routes require token verification)
router.post('/favorite/:videoId', protect, toggleFavorite);
router.post('/history', protect, updateWatchHistory);
router.get('/dashboard', protect, getDashboard);

// Playlist routes
router.get('/playlists', protect, getPlaylists);
router.post('/playlists', protect, createPlaylist);
router.delete('/playlists/:playlistId', protect, deletePlaylist);
router.post('/playlists/:playlistId/videos', protect, addVideoToPlaylist);
router.delete('/playlists/:playlistId/videos/:videoId', protect, removeVideoFromPlaylist);

module.exports = router;
