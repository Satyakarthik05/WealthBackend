const mongoose = require("mongoose");

const expertRequestSchema = new mongoose.Schema({
  expertType: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: "",
  },
  WantedBy: {
    type: String,
    required: true,
  },
  UserType: {
    type: String,
    required: true,
  },
   status: {
      type: String,
    },
    assignedExecutive: {
      type: String,
    },
    CallExecutivename: {
      type: String,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
});

const ExpertRequest = mongoose.model("ExpertRequest", expertRequestSchema);

module.exports = ExpertRequest;
