const mongoose = require("mongoose");

const AddSInvestorSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  SelectSkill: {
    type: String,
    required: true,
  },
  Location: {
    type: String,
    required: true,
  },
  MobileNumber: {
    type: String,
    required: true,
  },
  AddedBy: {
    type: String,
  },
  RegisteredBy: {
    type: String,
  },
  
 CallExecutiveCall: {
    type: String,
    enum: ["Pending", "Done"],  
    default: "Pending",
  },
  status: {
    type: String,
  },
  assignedExecutive:{
    type: String,
  }, CallExecutivename:{
      type:String
    }
}, {
    timestamps: true,
    strict: false, // This allows the model to accept any additional fields
  });

const AddInvestor = mongoose.model("Investos", AddSInvestorSchema);
module.exports = AddInvestor;
