const mongoose = require("mongoose");

const AddNriSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Country: {
    type: String,
    required: true,
  },
  Locality: {
    type: String,
    required: true,
  },
  IndianLocation: {
    type: String,
  },
  Occupation: {
    type: String,
    required: true,
  },
  MobileIN: {
    type: String,
    required: true,
  },
  MobileCountryNo: {
    type: String,
    required: true,
  },
  AddedBy: {
    type: String,
  },
  RegisteredBy: {
    type: String,
  },
});

const AddNri = mongoose.model("Nri", AddNriSchema);
module.exports = AddNri;
