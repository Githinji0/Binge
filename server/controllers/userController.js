const User = require('../models/User');
const Video = require('../models/Video');

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

module.exports = {
  toggleFavorite,
  updateWatchHistory,
  getDashboard
};
