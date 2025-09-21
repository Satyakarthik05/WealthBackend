const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Agent = require("../Models/AgentModel");
const CustomerSchema = require("../Models/Customer");
const CallExecutive = require("../Models/CallExecutiveModel");
const Core = require("../Models/CoreModel");
const NRI = require("../Models/NriModel");
const Skill = require("../Models/SkillModel");
const Investor = require("../Models/InvestorModel");

secret = "Wealth@123";

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

const CustomerSign = async (req, res) => {
  const io = req.app.get('io');
  const {
    FullName,
    MobileNumber,
    District,
    Contituency,
    Locations,
    Occupation,
    ReferredBy,
    MyRefferalCode,
    RegisteredBY,
    
  } = req.body;

  try {
    const existingCustomer = await CustomerSchema.findOne({ MobileNumber });
    if (existingCustomer) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    const Password = "wa1234";
    const random = Math.floor(1000000 + Math.random() * 9000000);
    const refferedby = `${MyRefferalCode}${random}`;
    const finalReferredBy = ReferredBy || "WA0000000001";

    const newCustomer = new CustomerSchema({
      FullName,
      MobileNumber,
      Password,
      District,
      Contituency,
      Locations,
      Occupation,
      ReferredBy: finalReferredBy,
      MyRefferalCode: refferedby,
      RegisteredBY,
      status: "pending",
    });

 
    await newCustomer.save();
     io.emit('new_customer', {
      customer: newCustomer,
      message: `New customer ${FullName} registered!`,
      sound: true
    });

    // 4. Send SMS
    let smsResponse;
    try {
      smsResponse = await sendSMS(
        MobileNumber,
        Password,
        refferedby
      );
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
      smsResponse = "SMS sending failed";
    }

    // 5. Call center API integration
    try {
      const callCenterResponse = await axios.get(
        "https://00ce1e10-d2c6-4f0e-a94f-f590280055c6.neodove.com/integration/custom/9e7ab9c6-ae34-428a-9820-81a8009aa6c9/leads",
        {
          params: {
            name: FullName,
            mobile: MobileNumber,
            email: "wealthassociation.com@gmail.com",
            detail1: `RefereralCode:${refferedby},ReferredBy:${finalReferredBy}`,
          },
        }
      );
      console.log("Call center API response:", callCenterResponse.data);
    } catch (error) {
      console.error("Failed to call call center API:", error.message);
    }

    res.status(200).json({
      message: "Customer Registration and assignment successful",
      smsResponse,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchReferredCustomers = async (req, res) => {
  try {
    const authenticatedAgent = await Agent.findById(req.AgentId);
    if (!authenticatedAgent) {
      return res.status(404).json({ error: "Authenticated agent not found" });
    }

    const myReferralCode = authenticatedAgent.MyRefferalCode;

    const referredAgents = await CustomerSchema.find({
      ReferredBy: myReferralCode,
    });

    res.status(200).json({ message: "Your Agents", referredAgents });
  } catch (error) {
    console.error("Error fetching referred agents:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const fetchReferredcusCustomers = async (req, res) => {
  try {
    const authenticatedAgent = await CustomerSchema.findById(req.CustomerId);
    if (!authenticatedAgent) {
      return res.status(404).json({ error: "Authenticated agent not found" });
    }

    const myReferralCode = authenticatedAgent.MyRefferalCode;

    const referredAgents = await CustomerSchema.find({
      ReferredBy: myReferralCode,
    });

    res.status(200).json({ message: "Your Agents", referredAgents });
  } catch (error) {
    console.error("Error fetching referred agents:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const customerLogin = async (req, res) => {
  const { MobileNumber, Password } = req.body;

  try {
    const customer = await CustomerSchema.findOne({
      MobileNumber: MobileNumber,
      Password: Password,
    });
    if (!customer) {
      return res
        .status(400)
        .json({ message: "Invalid MobileNumber or Password" });
    }

    const token = await jwt.sign({ CustomerId: customer._id }, secret, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
  }
};

const getCustomer = async (req, res) => {
  try {
    const customerDetails = await CustomerSchema.findById(req.CustomerId);
    if (!customerDetails) {
      return res.status(200).json({ message: "Customer not found" });
    } else {
      res.status(200).json(customerDetails);
    }
  } catch (error) {
    console.log(error);
  }
};

const getMyInvestorCustomers = async (req, res) => {
  try {
    const mobileNumber = req.mobileNumber;
    const customerDetails = await CustomerSchema.find({
      ReferredBy: mobileNumber,
    });
    if (!customerDetails) {
      return res.status(200).json({ message: "Customer not found" });
    } else {
      res.status(200).json(customerDetails);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateCustomerDetails = async (req, res) => {
  const { MobileNumber, FullName, Email, Locations, Occupation, Password } =
    req.body;

  try {
    const existingAgent = await CustomerSchema.findOne({ MobileNumber });
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

const getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerSchema.find().lean(); // Fetch all customers

    // List of all possible collections to search for referrer info
    const allSchemas = [Agent, CustomerSchema, Core, NRI, Skill, Investor];

    // Helper to find referrer details
    const findReferrer = async (refCode) => {
      for (let model of allSchemas) {
        const ref = await model.findOne({ MyRefferalCode: refCode }).lean();
        if (ref) {
          return {
            name: ref.FullName || ref.Name || "Unknown",
            phone: ref.MobileNumber || ref.MobileIN || "Unknown",
            source: model.modelName,
          };
        }
      }
      // Default values if no referral found
      return {
        name: "Wealth Associate",
        phone: "7796356789",
        source: "Default",
      };
    };

    // Add referrer details to each customer
    const customersWithReferrers = await Promise.all(
      customers.map(async (customer) => {
        let referrerDetails = {
          name: "Wealth Associate",
          phone: "7796356789",
          source: "Default",
        };

        if (customer.ReferredBy) {
          referrerDetails = await findReferrer(customer.ReferredBy);
        }

        return {
          ...customer,
          referrerDetails,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customersWithReferrers.length,
      data: customersWithReferrers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the agent by ID
    const deletedCustomer = await CustomerSchema.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updatecustomerAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { FullName, MobileNumber, Occupation, MyRefferalCode } = req.body;

    const updatedCustomer = await CustomerSchema.findByIdAndUpdate(
      id,
      { FullName, MobileNumber, Occupation, MyRefferalCode },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating customer", error: error.message });
  }
};
const callDone = async (req, res) => {
  try {
    const agent = await CustomerSchema.findByIdAndUpdate(
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
  CustomerSign,
  fetchReferredCustomers,
  fetchReferredcusCustomers,
  customerLogin,
  getCustomer,
  getAllCustomers,
  deleteCustomer,
  updateCustomerDetails,
  getMyInvestorCustomers,
  updatecustomerAdmin,
  callDone,
};
