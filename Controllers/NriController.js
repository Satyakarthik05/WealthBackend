const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const NRIMember = require("../Models/NriModel");

const secret = "Wealth@123";
const axios = require("axios");

const sendSMS = async (MobileIN, Password, AddedBy) => {
  try {
    const apiUrl =
      process.env.SMS_API_URL || "http://bulksms.astinsoft.com/api/v2/sms/Send";
    const params = {
      UserName: process.env.SMS_API_USERNAME || "wealthassociates",
      APIKey: process.env.SMS_API_KEY || "88F40D9F-0172-4D25-9CF5-5823211E67E7",
      MobileNo: MobileIN,
      Message: `Welcome to Wealth Associates\nThank you for registering\n\nLogin Details:\nID: ${MobileIN}\nPassword: ${Password}\nReferral code: ${AddedBy}\nFor Any Query - 7796356789`,
      SenderName: process.env.SMS_SENDER_NAME || "WTHASC",
      TemplateId: process.env.SMS_TEMPLATE_ID || "1707173279362715516",
      MType: 1,
    };

    const response = await axios.get(apiUrl, { params });

    if (
      response.data &&
      response.data.toLowerCase().includes("sms sent successfully")
    ) {
      console.log("SMS Sent Successfully:", response.data);
      return response.data;
    } else {
      console.error("SMS API Error:", response.data || response);
      throw new Error(response.data || "Failed to send SMS");
    }
  } catch (error) {
    console.error("Error in sendSMS function:", error.message);
    throw new Error("SMS sending failed");
  }
};

const NRIMemberSign = async (req, res) => {
  const {
    Name,
    Country,
    Locality,
    IndianLocation,
    Occupation,
    MobileIN,
    MobileCountryNo,
    AddedBy,
    RegisteredBy,
  } = req.body;

  try {
    const existingMember = await NRIMember.findOne({ MobileIN });
    if (existingMember) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }
    const Password= "wa1234"
    const newMember = new NRIMember({
      Name,
      Password: "wa1234",
      Country,
      Locality,
      IndianLocation,
      Occupation,
      MobileIN,
      MobileCountryNo,
      AddedBy,
      RegisteredBy,
    });

    let smsResponse;
    try {
      smsResponse = await sendSMS(MobileIN, Password, AddedBy);
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
      smsResponse = "SMS sending failed";
    }

    await newMember.save();

    res.status(200).json({
      message: "NRI Member Registration successful",
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const NRILogin = async (req, res) => {
  const { MobileNumber, Password } = req.body;

  try {
    const Nri = await NRIMember.findOne({
      MobileIN: MobileNumber,
      Password: Password,
    });
    if (!Nri) {
      return res
        .status(400)
        .json({ message: "Invalid MobileNumber or Password" });
    }

    const token = await jwt.sign({ NriId: Nri._id }, secret, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
  }
};

const getNRI = async (req, res) => {
  try {
    const agentDetails = await NRIMember.findById(req.NriId);
    if (!agentDetails) {
      return res.status(200).json({ message: "Agent not found" });
    } else {
      res.status(200).json(agentDetails);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateNRIDetails = async (req, res) => {
  const { MobileIN, Name, Country, Locality, Password, Occupation } = req.body;

  try {
    const existingAgent = await NRIMember.findOne({ MobileIN });
    if (!existingAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update agent details
    existingAgent.Name = Name || existingAgent.Name;
    existingAgent.Password = Password || existingAgent.Password;
    existingAgent.Country = Country || existingAgent.Country;
    existingAgent.Locality = Locality || existingAgent.Locality;
    existingAgent.Occupation = Occupation || existingAgent.Occupation;

    await existingAgent.save();

    res.status(200).json({ message: "Nri details updated successfully" });
  } catch (error) {
    console.error("Error updating agent details:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchReferredNRIMembers = async (req, res) => {
  try {
    const referredMembers = await NRIMember.find();
    res.status(200).json({ message: "Your NRI Members", referredMembers });
  } catch (error) {
    console.error("Error fetching referred members:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const geymyNris = async (req, res) => {
  const mobileNumber = req.mobileNumber;
  try {
    const referredMembers = await NRIMember.find({
      AddedBy: mobileNumber,
    });
    res.status(200).json({ message: "Your NRI Members", referredMembers });
  } catch (error) {
    console.error("Error fetching referred members:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /nri/referred-members/:id
const deleteReferredMember = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMember = await NRIMember.findByIdAndDelete(id);
    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting member", error });
  }
};

const editReferredMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMember = await NRIMember.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: "Error updating member", error });
  }
};

module.exports = {
  NRIMemberSign,
  fetchReferredNRIMembers,
  getNRI,
  updateNRIDetails,
  NRILogin,
  geymyNris,
  deleteReferredMember,
  editReferredMember,
};
