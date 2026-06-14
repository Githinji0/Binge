const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  progressSeconds: {
    type: Number,
    required: true,
    default: 0
  }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
      }
    ],
    watchHistory: [watchHistorySchema]
  },
  {
    timestamps: true
  }
);

// Method to verify passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
