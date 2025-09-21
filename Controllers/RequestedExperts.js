const express = require("express");
const RequestedExpert = require("../Models/RequestExpert");

const registerExpertRequest = async (req, res) => {
  const io = req.app.get("io");
  try {
    const {
      Name,
      MobileNumber,
      ExpertType,
      ExpertName,
      ExpertNo,
      RequestedBy,
    } = req.body;

    if (!Name || !MobileNumber || !ExpertType || !ExpertName || !RequestedBy) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newRequest = new RequestedExpert({
      Name,
      MobileNumber,
      ExpertType,
      ExpertName,
      ExpertNo,
      RequestedBy,
    });

    await newRequest.save();

     io.emit("new_requestedExpert", {
        expert: newRequest,
        message: `New expert ${Name} Requested!`,
        sound: true, 
      });
    res
      .status(200)
      .json({ message: "Expert request registered successfully.", newRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch all requested experts
const getAllRequestedExperts = async (req, res) => {
  try {
    const experts = await RequestedExpert.find();
    res.status(200).json(experts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const resolvedRequest = async (req, res) => {
  try {
    const expert = await RequestedExpert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ message: "Expert request not found" });
    }

    expert.resolved = true;
    expert.resolvedAt = new Date();
    const updatedExpert = await expert.save();

    res.json(updatedExpert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  registerExpertRequest,
  getAllRequestedExperts,
  resolvedRequest,
};
