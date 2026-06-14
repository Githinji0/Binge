const User = require('../models/User');
const Video = require('../models/Video');
const Playlist = require('../models/Playlist');

/**
 * @desc    Toggle video in user's favorites list
 * @route   POST /api/user/favorite/:videoId
 * @access  Private
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    // Validate video existence
    const video = await Video.findById(videoId);
    if (!video) {
      const error = new Error('Video not found');
      error.status = 444;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 444;
      throw error;
    }

    const isFavorite = user.favorites.includes(videoId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter((favId) => favId.toString() !== videoId);
    } else {
      // Add to favorites
      user.favorites.push(videoId);
    }

    await user.save();

    // Populate favorites to return clean video data
    const updatedUser = await User.findById(userId).populate('favorites');
    res.status(200).json({
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      favorites: updatedUser.favorites
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or update video progress in user's watch history
 * @route   POST /api/user/history
 * @access  Private
 */
const updateWatchHistory = async (req, res, next) => {
  try {
    const { videoId, progressSeconds } = req.body;
    const userId = req.user.id;

    if (!videoId || progressSeconds === undefined) {
      const error = new Error('Please provide videoId and progressSeconds');
      error.status = 400;
      throw error;
    }

    // Validate video existence
    const video = await Video.findById(videoId);
    if (!video) {
      const error = new Error('Video not found');
      error.status = 444;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 444;
      throw error;
    }

    // Check if the video is already in history
    const historyIndex = user.watchHistory.findIndex(
      (entry) => entry.video.toString() === videoId
    );

    if (historyIndex > -1) {
      // Update existing record
      user.watchHistory[historyIndex].progressSeconds = progressSeconds;
      user.watchHistory[historyIndex].timestamp = new Date();
    } else {
      // Push new history entry
      user.watchHistory.push({
        video: videoId,
        progressSeconds,
        timestamp: new Date()
      });
    }

    await user.save();

    // Return updated and populated history
    const updatedUser = await User.findById(userId).populate('watchHistory.video');
    res.status(200).json(updatedUser.watchHistory);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get populated dashboard information for user homepage
 * @route   GET /api/user/dashboard
 * @access  Private
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('favorites')
      .populate({
        path: 'watchHistory.video',
        select: '_id title thumbnail streamUrl duration category'
      });

    if (!user) {
      const error = new Error('User not found');
      error.status = 444;
      throw error;
    }

    // Sort history by timestamp descending (most recent first)
    const sortedHistory = [...user.watchHistory].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Filter "Continue Watching" where progress is less than 95% of total duration
    const continueWatching = sortedHistory.filter((entry) => {
      if (!entry.video) return false;
      return entry.progressSeconds < entry.video.duration * 0.95;
    });

    // Recent activity is the last 10 entries of any status
    const recentActivity = sortedHistory.slice(0, 10);

    res.status(200).json({
      favorites: user.favorites,
      continueWatching,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user.id }).populate('videos');
    res.status(200).json(playlists);
  } catch (error) {
    next(error);
  }
};

const createPlaylist = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      const error = new Error('Playlist name is required');
      error.status = 400;
      throw error;
    }

    const playlist = await Playlist.create({
      name,
      createdBy: req.user.id,
      videos: []
    });

    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

const deletePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, createdBy: req.user.id });
    if (!playlist) {
      const error = new Error('Playlist not found or unauthorized');
      error.status = 444;
      throw error;
    }
    res.status(200).json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addVideoToPlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
      const error = new Error('Video ID is required');
      error.status = 400;
      throw error;
    }

    const playlist = await Playlist.findOne({ _id: playlistId, createdBy: req.user.id });
    if (!playlist) {
      const error = new Error('Playlist not found or unauthorized');
      error.status = 444;
      throw error;
    }

    if (playlist.videos.includes(videoId)) {
      const error = new Error('Video already in playlist');
      error.status = 400;
      throw error;
    }

    playlist.videos.push(videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId).populate('videos');
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

const removeVideoFromPlaylist = async (req, res, next) => {
  try {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findOne({ _id: playlistId, createdBy: req.user.id });
    if (!playlist) {
      const error = new Error('Playlist not found or unauthorized');
      error.status = 444;
      throw error;
    }

    playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId).populate('videos');
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  updateWatchHistory,
  getDashboard,
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist
};
