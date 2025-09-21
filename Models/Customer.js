const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
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
    RegisteredBY: {
      type: String,
    },
    CallExecutiveCall: {
      type: String,
      enum: ["Pending", "Done"], // Add this to enforce specific values
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
  },
  {
    timestamps: true,
    strict: false, 
  }
);

const Customer = mongoose.model("Customers", CustomerSchema);
module.exports = Customer;
