const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required']
    },
    streamUrl: {
      type: String,
      required: [true, 'Stream URL is required']
    },
    duration: {
      type: Number,
      required: [true, 'Video duration (seconds) is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Video', videoSchema);
