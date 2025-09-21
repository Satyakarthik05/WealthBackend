const mongoose = require("mongoose");

const SoldedpropertySchema = new mongoose.Schema(
  {
    propertyType: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    photo: { type: String, required: true },
    Constituency: { type: String },
    propertyDetails: { type: String, required: true },
    PostedBy: { type: Number, required: true },
    PostedUserType: { type: String },
    editedAt: { type: Date },
    dynamicData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false, // This allows the model to accept any additional fields
  }
);

const SoldedProperty = mongoose.model(
  "SoldedProperty",
  SoldedpropertySchema
);

module.exports = SoldedProperty;
