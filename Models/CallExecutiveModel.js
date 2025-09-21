const mongoose = require("mongoose");

const callExecutiveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    assignedType: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    // Track login/logout times
    lastLoginTime: {
      type: Date,
      default: null,
    },
    lastLogoutTime: {
      type: Date,
      default: null,
    },
    // Notification preferences
    notificationSettings: {
      agents: { type: Boolean, default: false },
      customers: { type: Boolean, default: false },
      properties: { type: Boolean, default: false },
      requestedProperties: { type: Boolean, default: false },
      skilled: { type: Boolean, default: false },
      investors: { type: Boolean, default: false },
      expertRequests: { type: Boolean, default: false },
      expertRegistrations: { type: Boolean, default: false },
      expertCallRequests: { type: Boolean, default: false }, // Initially OFF
    },
    // Track assigned users (existing)
    assignedUsers: [
      {
        userType: {
          type: String,
          required: true,
          enum: ["Customers", "Agent_Wealth_Associate", "Property"],
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "assignedUsers.userType",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastAssignedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallExecutive", callExecutiveSchema);