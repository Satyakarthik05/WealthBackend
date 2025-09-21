const mongoose = require("mongoose");

const BuySchema = new mongoose.Schema(
  {
    propertyType: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    PostedBy: { type: Number, required: true },
    WantedBy: { type: String, required: true },
    WantedUserType: { type: String },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

const BuyProperty = mongoose.model("BuyProperty", BuySchema);

module.exports = BuyProperty;
