const mongoose = require("mongoose");

const AgentScheme = new mongoose.Schema(
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
    Email: {
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
    Expertise: {
      type: String,
      required: true,
    },
    Experience: {
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
    AgentType: {
      type: String,
    },
    valuemember: {
      type: String,
      // required:true,
    },
    photo: { type: String },
    imageUrl: { type: String },
    CompanyName: { type: String },

    AadhaarNumber: { type: String },
    PANNumber: { type: String },
    BankAccountNumber: { type: String },
    CallExecutiveCall: {
      type: String,
      enum: ["Pending", "Done"],
      default: "Pending",
    },
    referralStats: {
      referredAgents: { type: Number, default: 0 },
      referredCustomers: { type: Number, default: 0 },
      addedInvestors: { type: Number, default: 0 },
      addedSkilled: { type: Number, default: 0 },
      addedNRIs: { type: Number, default: 0 },
      postedProperties: { type: Number, default: 0 },
      approvedProperties: { type: Number, default: 0 },
      lastUpdated: { type: Date },
    },
    status: {
      type: String,
    },
    assignedExecutive: {
      type: String,
    },
    CallExecutivename:{
      type:String
    }
  },
  {
    timestamps: true,
    strict: false, // This allows the model to accept any additional fields
  }
);

const Agent = mongoose.model("Agent_Wealth_Associate", AgentScheme);
module.exports = Agent;
