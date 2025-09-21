const mongoose = require("mongoose");

const ValueProjectsSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    officeAddress: { type: String, required: true },
    city: { type: String, required: true },
    website: { type: String, required: true },
    photo: { type: String, required: true },
    newImageUrl: { type: String, required: true },
    mobile: { type: String, required: true },
    editedAt: { type: Date }, // Stores the last edit timestamp
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const ValueProjects = mongoose.model("ValueProjects", ValueProjectsSchema);

module.exports = ValueProjects;
