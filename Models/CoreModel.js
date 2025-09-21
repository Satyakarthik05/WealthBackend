const mongoose = require("mongoose");

const CoreSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },
  MobileNumber: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  District: {
    type: String,
    required: true,
  },
  Contituency: {
    type: String,
    required: true,
  },
  Locations: {
    type: String,
    required: true,
  },
  Occupation: {
    type: String,
    required: true,
  },
  ReferredBy: {
    type: String,
  },
  MyRefferalCode: {
    type: String,
  },
  Otp: {
    type: String,
  },
});

const Core = mongoose.model("Core members", CoreSchema);
module.exports = Core;
