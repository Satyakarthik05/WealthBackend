const express = require("express");
const bcrypt = require("bcrypt");
const AgentSchema = require("../Models/AgentModel");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const CallExecutive = require("../Models/CallExecutiveModel");
const AWS = require("aws-sdk");

const Customer = require("../Models/Customer");
const Core = require("../Models/CoreModel");
const NRI = require("../Models/NriModel");
const Skill = require("../Models/SkillModel");
const Investor = require("../Models/InvestorModel");
const Property=require("../Models/Property")

secret = "Wealth@123";

const s3 = new AWS.S3({
  accessKeyId: "AKIAWX2IFPZYF2O4O3FG",
  secretAccessKey: "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",
  region: "us-east-1",
});

// Helper function to upload to S3 and return CloudFront URL
const uploadToS3 = async (file, folderName) => {
  const timestamp = Date.now();
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${folderName}/${timestamp}-${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME || "wealthpropertyimages",
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();

  // Convert S3 URL to CloudFront URL
  const cloudFrontDomain = "d2xj2qzllg3mnf.cloudfront.net";
  const s3Url = new URL(result.Location);
  const cloudFrontUrl = `https://${cloudFrontDomain}/${s3Url.pathname
    .split("/")
    .slice(2)
    .join("/")}`;

  return cloudFrontUrl;
};

// Helper function to delete from S3
const deleteFromS3 = async (url) => {
  if (!url) return;

  try {
    // Extract key from CloudFront URL (remove domain and leading slash)
    const key = decodeURIComponent(
      url.replace(`https://d2xj2qzllg3mnf.cloudfront.net/`, "")
    );
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || "wealthpropertyimages",
      Key: key,
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
};

const sendSMS = async (
  MobileNumber,
  FullName,
  Password,
  ReferralCode,
  refferedby
) => {
  try {
    const apiUrl =
      process.env.SMS_API_URL || "http://bulksms.astinsoft.com/api/v2/sms/Send";
    const params = {
      UserName: process.env.SMS_API_USERNAME || "wealthassociates",
      APIKey: process.env.SMS_API_KEY || "88F40D9F-0172-4D25-9CF5-5823211E67E7",
      MobileNo: MobileNumber,
      Message: `Welcome to Wealth Associates\nThank you for registering\n\nLogin Details:\nID: ${MobileNumber}\nPassword: ${Password}\nReferral code: ${ReferralCode}\nFor Any Query - 7796356789`,
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

const AgentSign = async (req, res) => {
  const io = req.app.get("io");
  const {
    FullName,
    MobileNumber,
    Email,
    District,
    Contituency,
    Locations,
    Expertise,
    Experience,
    ReferredBy,
    MyRefferalCode,
    AgentType,
    valuemember,
    CompanyName,
  } = req.body;

  let photoUrl = null;

  // Check if file exists and upload to S3
  if (req.file) {
    try {
      photoUrl = await uploadToS3(req.file, "agent-profiles");
    } catch (uploadError) {
      console.error("Error uploading profile image to S3:", uploadError);
      return res
        .status(500)
        .json({ message: "Failed to upload profile image" });
    }
  }

  try {
    const existingAgent = await AgentSchema.findOne({
      MobileNumber: MobileNumber,
    });
    const referredAgent = await AgentSchema.findOne({
      MyRefferalCode: ReferredBy,
    });

    if (existingAgent) {
      if (photoUrl) {
        try {
          await deleteFromS3(photoUrl);
        } catch (deleteError) {
          console.error(
            "Error cleaning up duplicate agent image:",
            deleteError
          );
        }
      }
      return res.status(400).json({ message: "Mobile number already exists" });
    } else {
      const Password = "wa1234";
      const random = Math.floor(1000000 + Math.random() * 9000000);
      const refferedby = `${MyRefferalCode}${random}`;
      const finalReferredBy = ReferredBy || "WA0000000001";

      const newAgent = new AgentSchema({
        FullName,
        MobileNumber,
        Password,
        Email,
        District,
        Contituency,
        Locations,
        Expertise,
        Experience,
        ReferredBy: finalReferredBy,
        MyRefferalCode: refferedby,
        AgentType,
        valuemember,
        photo: photoUrl,
        CompanyName,
        status: "pending",
      });

      await newAgent.save();

      
      io.emit("new_agent", {
        agent: newAgent,
        message: `New agent ${FullName} registered!`,
        sound: true, 
      });

      // Send SMS (your existing code)
      let smsResponse;
      try {
        smsResponse = await sendSMS(
          MobileNumber,
          FullName,
          Password,
          finalReferredBy,
          refferedby
        );
      } catch (error) {
        console.error("Failed to send SMS:", error.message);
        smsResponse = "SMS sending failed";
      }

      // Call center API (your existing code)
      try {
        const callCenterResponse = await axios.get(
          "https://00ce1e10-d2c6-4f0e-a94f-f590280055c6.neodove.com/integration/custom/786e00dc-fb5a-4bf1-aaa3-7525277c8bf1/leads",
          {
            params: {
              name: FullName,
              mobile: MobileNumber,
              email: Email,
              detail1: `RefereralCode:${refferedby},ReferredBy:${
                referredAgent ? referredAgent.FullName : "WealthAssociate"
              }`,
            },
          }
        );
        console.log("Call center API response:", callCenterResponse.data);
      } catch (error) {
        console.error("Failed to call call center API:", error.message);
      }

      res.status(200).json({
        message: "Registration successful. Waiting for executive assignment.",
        smsResponse,
      });
    }
  } catch (error) {
    if (photoUrl) {
      try {
        await deleteFromS3(photoUrl);
      } catch (deleteError) {
        console.error(
          "Error cleaning up image after registration failed:",
          deleteError
        );
      }
    }
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const callassign = async (req, res) => {
  const io = req.app.get("io");
  try {
    const { agentId } = req.params;
    const { executiveId, action } = req.body;

    const agent = await AgentSchema.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (action === "accept") {
      const executive = await CallExecutive.findById(executiveId);
      if (!executive) {
        return res.status(404).json({ message: "Executive not found" });
      }

      // Update agent
      agent.assignedExecutive = executiveId;
      agent.status = "assigned";
      await agent.save();

      // Update executive
      executive.assignedUsers.push({
        userType: "Agent_Wealth_Associate",
        userId: agent._id,
      });
      executive.lastAssignedAt = new Date();
      await executive.save();

      // Notify all clients about the assignment
      io.emit("agent_assigned", {
        agentId: agent._id,
        executiveId,
        executiveName: executive.name,
      });

      return res.status(200).json({ message: "Agent assigned successfully" });
    } else if (action === "reject") {
      // You can implement rejection logic if needed
      return res.status(200).json({ message: "Agent rejected" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Assignment error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: "Agent ID is required",
      });
    }

    const agent = await AgentSchema.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Delete old image if exists
    if (agent.photo) {
      try {
        await deleteFromS3(agent.photo);
      } catch (deleteError) {
        console.error("Warning: Could not delete old image:", deleteError);
      }
    }

    // Upload new image (returns CloudFront URL)
    const imageUrl = await uploadToS3(req.file, "agent-profiles");

    // Update agent record with CloudFront URL
    agent.photo = imageUrl;
    await agent.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile image",
      error: error.message,
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    // 1. Verify JWT token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    // 2. Decode token to get AgentId
    const decoded = jwt.verify(token, secret);
    const agentId = decoded.AgentId;

    // 3. Find agent in database
    const agent = await AgentSchema.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // 4. Check if profile image exists
    if (!agent.photo) {
      return res.status(400).json({
        success: false,
        message: "No profile image to delete",
      });
    }

    // 5. Delete from storage (S3 or local)
    try {
      await deleteFromS3(agent.photo);
    } catch (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue with database update even if storage deletion fails
    }

    // 6. Update agent record
    agent.photo = null;
    await agent.save();

    // 7. Return success response
    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const fetchReferredAgents = async (req, res) => {
  try {
    // Find the authenticated agent
    const authenticatedAgent = await AgentSchema.findById(req.AgentId);
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

const AgentLogin = async (req, res) => {
  const { MobileNumber, Password } = req.body;

  try {
    const Agents = await AgentSchema.findOne({
      MobileNumber: MobileNumber,
      Password: Password,
    });
    if (!Agents) {
      return res
        .status(400)
        .json({ message: "Invalid MobileNumber or Password" });
    }

    const token = await jwt.sign({ AgentId: Agents._id }, secret, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
  }
};

const getAgent = async (req, res) => {
  try {
    const agentDetails = await AgentSchema.findById(req.AgentId);
    if (!agentDetails) {
      return res.status(200).json({ message: "Agent not found" });
    } else {
      res.status(200).json(agentDetails);
    }
  } catch (error) {
    console.log(error);
  }
};



const getvalueAgent = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const agentDetails = await AgentSchema.find({ valuemember: referralCode });
    if (!agentDetails) {
      return res.status(200).json({ message: "Agent not found" });
    } else {
      res.status(200).json(agentDetails);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateAgentDetails = async (req, res) => {
  const { MobileNumber, FullName, Email, Locations, Expertise, Experience } =
    req.body;

  try {
    const existingAgent = await AgentSchema.findOne({ MobileNumber });
    if (!existingAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update agent details
    existingAgent.FullName = FullName || existingAgent.FullName;
    existingAgent.Email = Email || existingAgent.Email;
    existingAgent.Locations = Locations || existingAgent.Locations;
    existingAgent.Expertise = Expertise || existingAgent.Expertise;
    existingAgent.Experience = Experience || existingAgent.Experience;

    await existingAgent.save();

    res.status(200).json({ message: "Agent details updated successfully" });
  } catch (error) {
    console.error("Error updating agent details:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await AgentSchema.find().lean();

    // List of all possible collections to search for referrer info
    const allSchemas = [AgentSchema, Customer, Core, NRI, Skill, Investor];

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

    // Add referrer details to each agent
    const agentsWithReferrers = await Promise.all(
      agents.map(async (agent) => {
        let referrerDetails = {
          name: "Wealth Associate",
          phone: "7796356789",
          source: "Default",
        };

        if (agent.ReferredBy) {
          referrerDetails = await findReferrer(agent.ReferredBy);
        }

        return {
          ...agent,
          referrerDetails,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: agentsWithReferrers.length,
      data: agentsWithReferrers,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the agent by ID
    const deletedAgent = await AgentSchema.findByIdAndDelete(id);

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

const updateAgentByadmin = async (req, res) => {
  const { id } = req.params;
  const {
    FullName,
    District,
    Contituency,
    MobileNumber,
    MyRefferalCode,
    ReferredBy,
    AadhaarNumber,
    PANNumber,
    BankAccountNumber,
  } = req.body;

  // Build the update object with the fields to update
  const updateFields = {
    FullName,
    District,
    Contituency,
    MobileNumber,
    MyRefferalCode,
    ReferredBy,
    AadhaarNumber,
    PANNumber,
    BankAccountNumber,
  };

  // If a new photo was uploaded, add it to the update object
  if (req.file) {
    updateFields.photo = `/Agents/${req.file.filename}`;
  }

  try {
    const updatedAgent = await AgentSchema.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

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

const callDone = async (req, res) => {
  try {
    const agent = await AgentSchema.findByIdAndUpdate(
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

const getAssignedAgents = async (req, res) => {
  try {
    const executiveId = req.params.id;

    // Fetch 1: Pending agents (regardless of executive assignment)
    const pendingCallAgents = await AgentSchema.find({
      CallExecutiveCall: "Pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch 2: Agents assigned to this executive where Call is not "Done"
    const assignedAgents = await AgentSchema.find({
      assignedExecutive: executiveId,
      CallExecutiveCall: { $ne: "Done" },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Combine both results
    const allAgents = [...pendingCallAgents, ...assignedAgents];

    // Remove duplicates by _id
    const uniqueAgentsMap = new Map();
    allAgents.forEach((agent) => {
      uniqueAgentsMap.set(agent._id.toString(), agent);
    });
    const uniqueAgents = Array.from(uniqueAgentsMap.values());

    // List of all possible collections to search for referrer info
    const allSchemas = [AgentSchema, Customer, Core, NRI, Skill, Investor];

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

    // Add referrer details to each agent
    const agentsWithReferrers = await Promise.all(
      uniqueAgents.map(async (agent) => {
        let referrerDetails = {
          name: "Wealth Associate",
          phone: "7796356789",
          source: "Default",
        };

        if (agent.ReferredBy) {
          referrerDetails = await findReferrer(agent.ReferredBy);
        }

        return {
          ...agent,
          referrerDetails,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      data: agentsWithReferrers,
    });
  } catch (error) {
    console.error("Error fetching assigned agents:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch assigned agents",
    });
  }
};

const getAssignedCustomers = async (req, res) => {
  try {
    const executiveId = req.params.id;

    // Fetch 1: Pending agents (regardless of executive assignment)
    const pendingCallAgents = await Customer.find({
      CallExecutiveCall: "Pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch 2: Agents assigned to this executive where Call is not "Done"
    const assignedAgents = await Customer.find({
      assignedExecutive: executiveId,
      CallExecutiveCall: { $ne: "Done" },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Combine both results
    const allAgents = [...pendingCallAgents, ...assignedAgents];

    // Remove duplicates by _id
    const uniqueAgentsMap = new Map();
    allAgents.forEach((agent) => {
      uniqueAgentsMap.set(agent._id.toString(), agent);
    });
    const uniqueAgents = Array.from(uniqueAgentsMap.values());

    // List of all possible collections to search for referrer info
    const allSchemas = [AgentSchema, Customer, Core, NRI, Skill, Investor];

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

    // Add referrer details to each agent
    const agentsWithReferrers = await Promise.all(
      uniqueAgents.map(async (agent) => {
        let referrerDetails = {
          name: "Wealth Associate",
          phone: "7796356789",
          source: "Default",
        };

        if (agent.ReferredBy) {
          referrerDetails = await findReferrer(agent.ReferredBy);
        }

        return {
          ...agent,
          referrerDetails,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      data: agentsWithReferrers,
    });
  } catch (error) {
    console.error("Error fetching assigned agents:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch assigned agents",
    });
  }
};

const getAssignedskilled = async (req, res) => {
  try {
    const executiveId = req.params.id;

    // Fetch 1: Pending agents (regardless of executive assignment)
    const pendingCallAgents = await Skill.find({
      CallExecutiveCall: "Pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch 2: Agents assigned to this executive where Call is not "Done"
    const assignedAgents = await Skill.find({
      assignedExecutive: executiveId,
      CallExecutiveCall: { $ne: "Done" },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Combine both results
    const allAgents = [...pendingCallAgents, ...assignedAgents];

    // Remove duplicates by _id
    const uniqueAgentsMap = new Map();
    allAgents.forEach((agent) => {
      uniqueAgentsMap.set(agent._id.toString(), agent);
    });
    const uniqueAgents = Array.from(uniqueAgentsMap.values());

    // List of all possible collections to search for referrer info
    const allSchemas = [AgentSchema, Customer, Core, NRI, Skill, Investor];

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

    // Add referrer details to each agent
    const agentsWithReferrers = await Promise.all(
      uniqueAgents.map(async (agent) => {
        let referrerDetails = {
          name: "Wealth Associate",
          phone: "7796356789",
          source: "Default",
        };

        if (agent.ReferredBy) {
          referrerDetails = await findReferrer(agent.ReferredBy);
        }

        return {
          ...agent,
          referrerDetails,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      data: agentsWithReferrers,
    });
  } catch (error) {
    console.error("Error fetching assigned agents:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch assigned agents",
    });
  }
};

const getAssignedinvestor = async (req, res) => {
  try {
    const executiveId = req.params.id;

    // Fetch 1: Pending agents (regardless of executive assignment)
    const pendingCallAgents = await Investor.find({
      CallExecutiveCall: "Pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch 2: Agents assigned to this executive where Call is not "Done"
    const assignedAgents = await Investor.find({
      assignedExecutive: executiveId,
      CallExecutiveCall: { $ne: "Done" },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Combine both results
    const allAgents = [...pendingCallAgents, ...assignedAgents];

    // Remove duplicates by _id
    const uniqueAgentsMap = new Map();
    allAgents.forEach((agent) => {
      uniqueAgentsMap.set(agent._id.toString(), agent);
    });
    const uniqueAgents = Array.from(uniqueAgentsMap.values());

    // List of all possible collections to search for referrer info
    const allSchemas = [AgentSchema, Customer, Core, NRI, Skill, Investor];

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

    // Add referrer details to each agent
    const agentsWithReferrers = await Promise.all(
      uniqueAgents.map(async (agent) => {
        let referrerDetails = {
          name: "Wealth Associate",
          phone: "7796356789",
          source: "Default",
        };

        if (agent.ReferredBy) {
          referrerDetails = await findReferrer(agent.ReferredBy);
        }

        return {
          ...agent,
          referrerDetails,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      data: agentsWithReferrers,
    });
  } catch (error) {
    console.error("Error fetching assigned agents:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch assigned agents",
    });
  }
};


const getPropertiesWithExecutiveFirst = async (req, res) => {
  try {
    const executiveId = req.params.id;

    // Fetch properties assigned to the executive
    const assignedProperties = await Property.find({
      assignedExecutive: executiveId,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch other properties not assigned to this executive
    const otherProperties = await Property.find({
      $or: [
        { assignedExecutive: { $exists: false } },
        { assignedExecutive: { $ne: executiveId } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Combine assigned first, then others
    const allProperties = [...assignedProperties, ...otherProperties];

    return res.status(200).json({
      status: "success",
      data: allProperties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch properties",
    });
  }
};

module.exports = {
  AgentSign,
  AgentLogin,
  getAgent,
  fetchReferredAgents,
  updateAgentDetails,
  getAllAgents,
  deleteAgent,
  updateAgentByadmin,
  callDone,
  getvalueAgent,
  updateProfileImage,
  deleteProfileImage,
  callassign,
  getAssignedAgents,
  getAssignedCustomers,
  getAssignedskilled,
  getAssignedinvestor,
  getPropertiesWithExecutiveFirst
};
