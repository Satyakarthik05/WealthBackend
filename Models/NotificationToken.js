const mongoose = require("mongoose");

const NotificationTokenSchema = new mongoose.Schema({
  expoPushToken: { 
    type: String, 
    unique: true,
    required: [true, 'Expo push token is required'],
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: [true, 'Device type is required']
  },
  appVersion: {
    type: String,
    required: [true, 'App version is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to your User model if you have one
    index: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
// NotificationTokenSchema.index({ expoPushToken: 1 });
// NotificationTokenSchema.index({ userId: 1 });

const NotificationToken = mongoose.model("NotificationToken", NotificationTokenSchema);

module.exports = NotificationToken;