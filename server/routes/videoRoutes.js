const express = require('express');
const router = express.Router();
const { getVideos } = require('../controllers/videoController');

// Public catalog route
router.get('/', getVideos);

module.exports = router;
