const core = require("../Models/CoreModel");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const AgentSchema = require("../Models/AgentModel");
const Customer = require("../Models/Customer");

const sendSMS = async (MobileNumber, Password, refferedby) => {
  try {
    const apiUrl =
      process.env.SMS_API_URL || "http://bulksms.astinsoft.com/api/v2/sms/Send";
    const params = {
      UserName: process.env.SMS_API_USERNAME || "wealthassociates",
      APIKey: process.env.SMS_API_KEY || "88F40D9F-0172-4D25-9CF5-5823211E67E7",
      MobileNo: MobileNumber,
      Message: `Welcome to Wealth Associates\nThank you for registering\n\nLogin Details:\nID: ${MobileNumber}\nPassword: ${Password}\nReferral code: ${refferedby}\nFor Any Query - 7796356789`,
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

const CoreSign = async (req, res) => {
  const {
    FullName,
    MobileNumber,
    District,
    Contituency,
    Locations,
    Occupation,
    ReferredBy,
    MyRefferalCode,
  } = req.body;

  try {
    const existingCore = await core.findOne({ MobileNumber });
    if (existingCore) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    const Password = "wa1234";
    const random = Math.floor(1000000 + Math.random() * 9000000);
    const refferedby = `${MyRefferalCode}${random}`;

    const finalReferredBy = ReferredBy || "WA0000000001";

    const newCustomer = new core({
      FullName,
      MobileNumber,
      Password,
      District,
      Contituency,
      Locations,
      Occupation,
      ReferredBy: finalReferredBy,
      MyRefferalCode: refferedby,
    });

    let smsResponse;
    try {
      smsResponse = await sendSMS(
        MobileNumber,
        // FullName,
        Password,
        // finalReferredBy,
        refferedby
      );
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
      smsResponse = "SMS sending failed";
    }

    await newCustomer.save();

    res.status(200).json({
      message: "Core Registration successful",
      smsResponse,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const coreLogin = async (req, res) => {
  const { MobileNumber, Password } = req.body;

  try {
    const Core = await core.findOne({
      MobileNumber: MobileNumber,
      Password: Password,
    });
    if (!Core) {
      return res
        .status(400)
        .json({ message: "Invalid MobileNumber or Password" });
    }

    const token = await jwt.sign({ coreId: Core._id }, secret, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
  }
};

const getCore = async (req, res) => {
  try {
    const coreDetails = await core.findById(req.coreId);
    if (!coreDetails) {
      return res.status(200).json({ message: "Agent not found" });
    } else {
      res.status(200).json(coreDetails);
    }
  } catch (error) {
    console.log(error);
  }
};
const updateCoreDetails = async (req, res) => {
  const { MobileNumber, FullName, Email, Locations, Occupation, Password } =
    req.body;

  try {
    const existingAgent = await core.findOne({ MobileNumber });
    if (!existingAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update agent details
    existingAgent.FullName = FullName || existingAgent.FullName;
    existingAgent.Email = Email || existingAgent.Email;
    existingAgent.Locations = Locations || existingAgent.Locations;
    existingAgent.Occupation = Occupation || existingAgent.Occupation;
    existingAgent.Password = Password || existingAgent.Password;

    await existingAgent.save();

    res.status(200).json({ message: "Customer details updated successfully" });
  } catch (error) {
    console.error("Error updating agent details:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchReferredAgents = async (req, res) => {
  try {
    // Find the authenticated agent
    const authenticatedAgent = await core.findById(req.coreId);
    if (!authenticatedAgent) {
      return res.status(404).json({ error: "Authenticated agent not found" });
    }

    // Retrieve the MyRefferalCode of the authenticated agent
    const myReferralCode = authenticatedAgent.MyRefferalCode;

    // Fetch all agents whose ReferredBy matches the authenticated agent's MyRefferalCode
    const referredAgents = await AgentSchema.find({
      ReferredBy: myReferralCode,
    });

    // Return the result
    res.status(200).json({ message: "Your Agents", referredAgents });
  } catch (error) {
    console.error("Error fetching referred agents:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const fetchReferredCustomers = async (req, res) => {
  try {
    const authenticatedAgent = await core.findById(req.coreId);
    if (!authenticatedAgent) {
      return res.status(404).json({ error: "Authenticated agent not found" });
    }

    const myReferralCode = authenticatedAgent.MyRefferalCode;

    const referredAgents = await Customer.find({
      ReferredBy: myReferralCode,
    });

    res.status(200).json({ message: "Your Agents", referredAgents });
  } catch (error) {
    console.error("Error fetching referred agents:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllCoreMembers = async (req, res) => {
  try {
    const coreMembers = await core.find({});
    res.status(200).json(coreMembers);
  } catch (error) {
    console.error("Error fetching core members:", error);
    throw error; // Rethrow the error if you want to handle it elsewhere
  }
};

const deleteCore = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the agent by ID
    const deletedAgent = await core.findByIdAndDelete(id);

    if (!deletedAgent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateCoreByadmin = async (req, res) => {
  const { id } = req.params;
  const { FullName, District, Contituency, MobileNumber, MyRefferalCode } =
    req.body;

  try {
    const updatedAgent = await core.findByIdAndUpdate(
      id,
      { FullName, District, Contituency, MobileNumber, MyRefferalCode },
      { new: true }
    );

    if (!updatedAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res
      .status(200)
      .json({ message: "Agent updated successfully", data: updatedAgent });
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ message: "Failed to update agent" });
  }
};

module.exports = {
  CoreSign,
  coreLogin,
  getCore,
  fetchReferredAgents,
  fetchReferredCustomers,
  getAllCoreMembers,
  updateCoreDetails,
  deleteCore,
  updateCoreByadmin,
};
