const Video = require('../models/Video');

/**
 * @desc    Get all videos (public catalog)
 * @route   GET /api/videos
 * @access  Public
 */
const getVideos = async (req, res, next) => {
  try {
    // Select specific fields for catalog representation
    const videos = await Video.find({}).select('_id title thumbnail streamUrl duration category');
    res.status(200).json(videos);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVideos
};
