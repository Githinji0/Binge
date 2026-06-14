const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Playlist creator is required']
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Playlist', playlistSchema);
