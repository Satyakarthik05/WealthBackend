const mongoose = require("mongoose");

const RequestpropertySchema = new mongoose.Schema({
  propertyTitle: { type: String, required: true },
  propertyType: { type: String, required: true },
  location: { type: String, required: true },
  Budget: { type: String, required: true },
  PostedBy: { type: String, required: true }, 
  islocation:{ type: String},
  Approved: {
    type: String,
    enum: ["Pending", "Done"], 
    default: "Pending",
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
});

const requestProperty = mongoose.model(
  "RequestProperty",
  RequestpropertySchema
);

module.exports = requestProperty;
