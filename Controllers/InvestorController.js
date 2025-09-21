const express = require("express");
const Investors = require("../Models/InvestorModel");
const AgentSchema = require("../Models/AgentModel");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const sendSMS = async (MobileNumber, Password, AddedBy) => {
  try {
    const apiUrl =
      process.env.SMS_API_URL || "http://bulksms.astinsoft.com/api/v2/sms/Send";
    const params = {
      UserName: process.env.SMS_API_USERNAME || "wealthassociates",
      APIKey: process.env.SMS_API_KEY || "88F40D9F-0172-4D25-9CF5-5823211E67E7",
      MobileNo: MobileNumber,
      Message: `Welcome to Wealth Associates\nThank you for registering\n\nLogin Details:\nID: ${MobileNumber}\nPassword: ${Password}\nReferral code: ${AddedBy}\nFor Any Query - 7796356789`,
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

const registerInvestors = async (req, res) => {
  const io = req.app.get('io');
  const {
    FullName,
    SelectSkill,
    Location,
    MobileNumber,
    AddedBy,
    RegisteredBy,
  } = req.body;

  try {
    const existingInvestor = await Investors.findOne({ MobileNumber });
    if (existingInvestor) {
      return res
        .status(400)
        .json({ message: "Mobile number already registered" });
    }
    const Password= "wa1234"

    const newInvestor = new Investors({
      FullName,
      Password: "wa1234",
      SelectSkill,
      Location,
      MobileNumber,
      AddedBy,
      RegisteredBy,
      status: "pending",
    });

    let smsResponse;
    try {
      smsResponse = await sendSMS(MobileNumber, Password, AddedBy);
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
      smsResponse = "SMS sending failed";
    }
       io.emit('new_investor', {
      investor: newInvestor,
      message: `New investor ${FullName} registered!`,
      sound: true
    });

    await newInvestor.save();

    res.status(200).json({
      message: "Investor Registration successful",
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const InvestorLogin = async (req, res) => {
  const { MobileNumber, Password } = req.body;

  try {
    const Investor = await Investors.findOne({
      MobileNumber: MobileNumber,
      Password: Password,
    });
    if (!Investor) {
      return res
        .status(400)
        .json({ message: "Invalid MobileNumber or Password" });
    }

    const token = await jwt.sign({ InvestorId: Investor._id }, secret, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
  }
};

const getInvestor = async (req, res) => {
  try {
    const agentDetails = await Investors.findById(req.InvestorId);
    if (!agentDetails) {
      return res.status(200).json({ message: "Agent not found" });
    } else {
      res.status(200).json(agentDetails);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateInvestorDetails = async (req, res) => {
  const { MobileNumber, FullName, SelectSkill, Location, Password } = req.body;

  try {
    const existingAgent = await Investors.findOne({ MobileNumber });
    if (!existingAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update agent details
    existingAgent.FullName = FullName || existingAgent.FullName;
    existingAgent.Password = Password || existingAgent.Password;
    existingAgent.Location = Location || existingAgent.Location;
    existingAgent.SelectSkill = SelectSkill || existingAgent.SelectSkill;

    await existingAgent.save();

    res.status(200).json({ message: "Investor details updated successfully" });
  } catch (error) {
    console.error("Error updating agent details:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchInvestors = async (req, res) => {
  try {
    const skilledLabours = await Investors.find();
    res.status(200).json({ message: "Your Skilled Labours", skilledLabours });
  } catch (error) {
    console.error("Error fetching skilled labours:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const fetchAgentInvestors = async (req, res) => {
  try {
    const mobileNumber = req.mobileNumber; 
    const userType = req.userType;

    // Fetch skilled labours added by the agent
    const referredAgents = await Investors.find({
      AddedBy: mobileNumber,
    }).lean();

    // Return response
    return res.status(200).json({
      message: "Your Referred Skilled Labour",
      count: referredAgents.length,
      data: referredAgents,
    });
  } catch (error) {
    console.error("Error fetching referred agents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const fetchAdminInvestors = async (req, res) => {
  try {
    const mobileNumber = req.mobileNumber; // Get mobile number from middleware
    const userType = req.userType;

    // Fetch skilled labours added by the agent
    const referredAgents = await Investors.find({
      AddedBy: "Admin",
    }).lean();

    return res.status(200).json({
      message: "Your Referred Skilled Labour",
      count: referredAgents.length,
      data: referredAgents,
    });
  } catch (error) {
    console.error("Error fetching referred agents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteInvestor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLabour = await Investors.findByIdAndDelete(id);
    if (!deletedLabour) {
      return res.status(404).json({ message: "Labour not found" });
    }
    res.status(200).json({ message: "Labour deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting labour", error });
  }
};

const UpdateInvestorAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { FullName, SelectSkill, MobileNumber, Location } = req.body;

    const updatedInvestor = await Investors.findByIdAndUpdate(
      id,
      { FullName, SelectSkill, MobileNumber, Location },
      { new: true }
    );

    if (!updatedInvestor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    res.status(200).json(updatedInvestor);
  } catch (error) {
    console.error("Error updating investor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const callDone = async (req, res) => {
  try {
    const agent = await Investors.findByIdAndUpdate(
      req.params.id,
      { CallExecutiveCall: "Done" },
      { new: true }
    );
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json({ message: "Agent marked as done", data: agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerInvestors,
  fetchAdminInvestors,
  fetchInvestors,
  deleteInvestor,
  fetchAgentInvestors,
  InvestorLogin,
  getInvestor,
  updateInvestorDetails,
  UpdateInvestorAdmin,
  callDone
};
