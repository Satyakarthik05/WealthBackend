const mongoose = require("mongoose");

// Assembly schema with name and 3-digit code
const AssemblySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: {
    type: String,
    required: true,
    match: /^\d{3}$/, // 3-digit code
  },
});

// Main schema for parliament constituency
const ConstituencySchema = new mongoose.Schema({
  parliament: { type: String, required: true },
  parliamentCode: {
    type: String,
    required: true,
    match: /^\d{2}$/, // 2-digit code
    unique: true,
  },
  assemblies: {
    type: [AssemblySchema],
    required: true,
  },
});

module.exports = mongoose.model("DistrictsConstituency", ConstituencySchema);
