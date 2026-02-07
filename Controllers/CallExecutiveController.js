const CallExecutive = require("../Models/CallExecutiveModel");
// const Agent = require("../Models/AgentModel");
const jwt = require("jsonwebtoken");
secret = "Wealth@123";
const mongoose = require("mongoose");

const Agent = require("../Models/AgentModel");
const Customer = require("../Models/Customer");
const Property = require("../Models/Property");
const SkilledLabour = require("../Models/SkillModel");
const Investor = require("../Models/InvestorModel");
const WantedExpertRequest = require("../Models/ReqExp");
const ExpertRequest = require("../Models/RequestExpert");
const RegisterExpert = require("../Models/ExpertModel");
const requestedProperties =require("../Models/RequestProperty")
// const CallExecutive = require('../models/CallExecutive');

const addCallExecutive = async (req, res) => {
  try {
    const { name, phone, location, password, assignedType } = req.body;

    // Validate input
    if (!name || !phone || !location || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const existingExecutive = await CallExecutive.findOne({ phone });
    if (existingExecutive) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    // Create and save the new executive
    const newExecutive = new CallExecutive({
      name,
      phone,
      location,
      password,
      assignedType,
    });
    await newExecutive.save();

    res.status(201).json({ message: "Call executive added successfully" });
  } catch (error) {
    console.error("Error adding call executive:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const CallExecutiveLogin = async (req, res) => {
  const { MobileNumber, Password } = req.body;

  try {
    const Agents = await CallExecutive.findOne({
      phone: MobileNumber,

      password: Password,
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

const getCallExecutives = async (req, res) => {
  try {
    const executives = await CallExecutive.find();
    res.status(200).json(executives);
  } catch (error) {
    console.error("Error fetching call executives:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCallExe = async (req, res) => {
  try {
    const agentDetails = await CallExecutive.findById(req.AgentId);
    if (!agentDetails) {
      return res.status(200).json({ message: "Agent not found" });
    } else {
      res.status(200).json(agentDetails);
    }
  } catch (error) {
    console.log(error);
  }
};

const editExecutive = async (req, res) => {
  const { id } = req.params;
  const { name, phone, location, password, assignedType } = req.body;

  try {
    const updateData = { name, phone, location, assignedType, password };

    const updatedExecutive = await CallExecutive.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedExecutive) {
      return res.status(404).json({ message: "Executive not found" });
    }

    res.status(200).json({ message: "Executive updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating executive", error });
  }
};

// Delete call executive
const deleteCallExecutive = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExecutive = await CallExecutive.findByIdAndDelete(id);

    if (!deletedExecutive) {
      return res.status(404).json({
        success: false,
        message: "Call executive not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Call executive deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting call executive:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const executive = await CallExecutive.findById(id);

    if (!executive) {
      return res.status(404).json({ message: "Call executive not found" });
    }

    executive.status = executive.status === "active" ? "inactive" : "active";
    await executive.save();

    res.status(200).json({
      message: "Status updated successfully",
      status: executive.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get status controller
const getStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const executive = await CallExecutive.findById(id).select("status");

    if (!executive) {
      return res.status(404).json({ message: "Call executive not found" });
    }

    res.status(200).json({
      status: executive.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Updatepushtoken = async (req, res) => {
  try {
    const { id } = req.params;
    const { expoPushToken } = req.body;

    const executive = await CallExecutive.findById(id);

    if (!executive) {
      return res.status(404).json({ message: "Call executive not found" });
    }

    // 1. If no token exists in DB → save new token
    if (!executive.expoPushToken) {
      executive.expoPushToken = expoPushToken;
      await executive.save();

      return res.status(200).json({
        message: "Expo push token saved successfully",
        expoPushToken: executive.expoPushToken,
      });
    }

    // 2. If existing token is same → no need to update
    if (executive.expoPushToken === expoPushToken) {
      return res.status(200).json({
        message: "Token already up to date",
        expoPushToken: executive.expoPushToken,
      });
    }

    // 3. If token exists and is different → update
    executive.expoPushToken = expoPushToken;
    await executive.save();

    res.status(200).json({
      message: "Expo push token updated successfully",
      expoPushToken: executive.expoPushToken,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const myagents = async (req, res) => {
  try {
    // 1. Validate and convert AgentId
    if (!mongoose.Types.ObjectId.isValid(req.AgentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Agent ID format",
        receivedId: req.AgentId,
      });
    }

    const executiveId = new mongoose.Types.ObjectId(req.AgentId);

    // 2. Clean up invalid assignments first
    const cleanupResult = await CallExecutive.updateOne(
      { _id: executiveId },
      { $pull: { assignedUsers: { userId: null } } }
    );
    // console.log(`Cleaned ${cleanupResult.modifiedCount} invalid assignments`);

    // 3. Get executive with valid agents
    const executive = await CallExecutive.aggregate([
      { $match: { _id: executiveId } },
      { $unwind: "$assignedUsers" },
      {
        $match: {
          "assignedUsers.userType": "Agent_Wealth_Associate",
          "assignedUsers.userId": { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "agent_wealth_associates",
          localField: "assignedUsers.userId",
          foreignField: "_id",
          as: "agentDetails",
        },
      },
      { $unwind: "$agentDetails" },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          agents: {
            $push: {
              agent: "$agentDetails",
              assignmentId: "$assignedUsers._id",
              assignedAt: "$assignedUsers.assignedAt",
            },
          },
        },
      },
    ]);

    if (!executive || executive.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid agent assignments found",
      });
    }

    // 4. Format the response
    const result = executive[0];
    const assignedAgents = result.agents.map((item) => ({
      ...item.agent,
      assignmentId: item.assignmentId,
      assignedAt: item.assignedAt,
    }));

    res.json({
      success: true,
      data: assignedAgents,
      executiveInfo: {
        name: result.name,
        phone: result.phone,
      },
    });
  } catch (error) {
    console.error("Error in myagents:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const myCustomers = async (req, res) => {
  try {
    // 1. Validate and convert AgentId
    if (!mongoose.Types.ObjectId.isValid(req.AgentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Agent ID format",
        receivedId: req.AgentId,
      });
    }

    const executiveId = new mongoose.Types.ObjectId(req.AgentId);

    // 2. Get executive with valid customers and populate all necessary fields
    const executive = await CallExecutive.aggregate([
      { $match: { _id: executiveId } },
      { $unwind: "$assignedUsers" },
      {
        $match: {
          "assignedUsers.userType": "Customers",
          "assignedUsers.userId": { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "assignedUsers.userId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $project: {
          _id: 0,
          customer: {
            $mergeObjects: [
              "$customerDetails",
              {
                assignmentId: "$assignedUsers._id",
                assignedAt: "$assignedUsers.assignedAt",
              },
            ],
          },
          executiveInfo: {
            name: "$name",
            phone: "$phone",
          },
        },
      },
      {
        $group: {
          _id: null,
          customers: { $push: "$customer" },
          executiveInfo: { $first: "$executiveInfo" },
        },
      },
    ]);

    if (!executive || executive.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid customer assignments found",
      });
    }

    // 3. Format the response with all customer details
    const result = executive[0];

    res.json({
      success: true,
      data: result.customers,
      executiveInfo: result.executiveInfo,
    });
  } catch (error) {
    console.error("Error in myCustomers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const myProperties = async (req, res) => {
  try {
    console.log("1. Starting myProperties with AgentId:", req.AgentId);

    // 1. Validate and convert AgentId
    if (!mongoose.Types.ObjectId.isValid(req.AgentId)) {
      console.log("2. Invalid AgentId format:", req.AgentId);
      return res.status(400).json({
        success: false,
        message: "Invalid Agent ID format",
        receivedId: req.AgentId,
      });
    }

    const executiveId = new mongoose.Types.ObjectId(req.AgentId);
    console.log("3. Converted executiveId:", executiveId);

    // Debug: Check the raw executive document
    const executiveDoc = await CallExecutive.findById(executiveId).lean();
    console.log(
      "4. Raw executive document:",
      JSON.stringify(executiveDoc, null, 2)
    );

    if (!executiveDoc) {
      console.log("5. No executive document found");
      return res.status(404).json({
        success: false,
        message: "Executive not found",
      });
    }

    console.log(
      "6. Assignments found:",
      executiveDoc.assignedUsers?.length || 0
    );
    console.log("7. Sample assignment:", executiveDoc.assignedUsers?.[0]);

    // 2. Aggregation pipeline
    console.log("8. Starting aggregation pipeline");
    const pipeline = [
      { $match: { _id: executiveId } },
      { $unwind: "$assignedUsers" },
      {
        $match: {
          "assignedUsers.userType": "Property",
          "assignedUsers.userId": { $exists: true, $ne: null },
        },
      },
      {
        $addFields: {
          convertedUserId: {
            $cond: {
              if: { $eq: [{ $type: "$assignedUsers.userId" }, "string"] },
              then: { $toObjectId: "$assignedUsers.userId" },
              else: "$assignedUsers.userId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "properties",
          localField: "convertedUserId",
          foreignField: "_id",
          as: "propertyDetails",
        },
      },
      {
        $unwind: {
          path: "$propertyDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          property: {
            $mergeObjects: [
              "$propertyDetails",
              {
                assignmentId: "$assignedUsers._id",
                assignedAt: "$assignedUsers.assignedAt",
              },
            ],
          },
          executiveInfo: {
            name: "$name",
            phone: "$phone",
          },
        },
      },
      {
        $group: {
          _id: null,
          properties: { $push: "$property" },
          executiveInfo: { $first: "$executiveInfo" },
        },
      },
    ];

    console.log(
      "9. Full aggregation pipeline:",
      JSON.stringify(pipeline, null, 2)
    );

    const result = await CallExecutive.aggregate(pipeline);
    console.log("10. Aggregation result:", JSON.stringify(result, null, 2));

    // 3. Handle results
    if (!result.length || !result[0].properties.length) {
      console.log("11. No valid properties found in result");

      // Additional debug: Check if properties exist for the userIds
      const assignedUserIds =
        executiveDoc.assignedUsers
          ?.filter((a) => a.userType === "Property" && a.userId)
          ?.map((a) => a.userId) || [];

      console.log("12. Assigned userIds:", assignedUserIds);

      if (assignedUserIds.length > 0) {
        const properties = await mongoose.connection.db
          .collection("properties")
          .find({ _id: { $in: assignedUserIds } })
          .toArray();
        console.log("13. Properties found for these IDs:", properties.length);
      }

      return res.status(404).json({
        success: false,
        message: "No valid property assignments found",
        debug: {
          executiveId: req.AgentId,
          assignmentsCount: executiveDoc.assignedUsers?.length || 0,
          propertyAssignments:
            executiveDoc.assignedUsers?.filter(
              (a) => a.userType === "Property"
            ) || [],
        },
      });
    }

    // 4. Successful response
    console.log(
      "14. Successfully found properties:",
      result[0].properties.length
    );
    res.json({
      success: true,
      data: result[0].properties,
      executiveInfo: result[0].executiveInfo,
    });
  } catch (error) {
    console.error("15. Error in myProperties:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const handleAccept = async (req, res) => {
  const io = req.app.get("io");
  const { type, id } = req.params;
  const { executiveId } = req.body;

  try {
    // Validate executive
    const executive = await CallExecutive.findById(executiveId);
    if (!executive) {
      return res.status(404).json({ message: "Executive not found" });
    }

    let model, updatedDoc, collectionName;

    switch (type) {
      case "agents":
        model = Agent;
        collectionName = "agents";
        break;
      case "customers":
        model = Customer;
        collectionName = "customers";
        break;
      case "properties":
        model = Property;
        collectionName = "properties";
        break;
      case "skilled":
        model = SkilledLabour;
        collectionName = "skilledlabours";
        break;
      case "expertRequests":
        model = WantedExpertRequest;
        collectionName = "expertRequests";
        break;
      case "investors":
        model = Investor;
        collectionName = "investors";
        break;
      case "expertCallRequests":
        model = ExpertRequest;
        collectionName = "expertCallRequests";
        break;
      case "expertRegistrations":
        model = RegisterExpert;
        collectionName = "expertRegistrations";
        break;
      case "requestedProperties":
        model = requestedProperties;
        collectionName = "requestedProperties";
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    // Update the document
    updatedDoc = await model
      .findByIdAndUpdate(
        id,
        {
          status: "assigned",
          assignedExecutive: executiveId,
          CallExecutivename: executive.name,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .populate("assignedExecutive");

    if (!updatedDoc) {
      return res.status(404).json({ message: `${type} not found` });
    }

    io.emit(`${type}_assigned`, {
    id,
    type,
    executiveId,
    executiveName: executive.name,
    message: `${type} ${
      updatedDoc.FullName || updatedDoc.PropertyTitle || updatedDoc.name
    } has been assigned to ${executive.name}`,
    timestamp: new Date(),
  });

  // Also emit to all other executives that this item has been assigned
  io.emit('assigned_by_other', { type, id });

    res.status(200).json({
      message: `${type} assigned successfully`,
      data: updatedDoc,
    });
  } catch (error) {
    console.error(`Error assigning ${type}:`, error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



const ExecutiveLogin=async (req, res) => {
  try {
    const executive = await CallExecutive.findByIdAndUpdate(
      req.params.id,
      { status: "active", lastLoginTime: new Date() },
      { new: true }
    );
    res.status(200).json(executive);
  } catch (error) {
    res.status(500).json({ error: "Failed to update login time" });
  }
};


const ExecutiveActive= async (req, res) => {
  try {
    const executive = await CallExecutive.findByIdAndUpdate(
      req.params.id,
      { status: "inactive", lastLogoutTime: new Date() },
      { new: true }
    );
    res.status(200).json(executive);
  } catch (error) {
    res.status(500).json({ error: "Failed to update logout time" });
  }
};



const executiveNotification = async (req, res) => {
  try {
    const executive = await CallExecutive.findByIdAndUpdate(
      req.params.id,
      { notificationSettings: req.body.notificationSettings },
      { new: true }
    );

    // If enabling any notification, check for pending items from past day
    if (Object.values(req.body.notificationSettings).some(setting => setting)) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const pendingItems = await checkPendingItems(executive._id, oneDayAgo);
      
      res.status(200).json({
        ...executive.toObject(),
        pendingItems
      });
    } else {
      res.status(200).json(executive);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};

const checkPendingItems = async (executiveId, sinceDate) => {
  const pendingItems = {};
  
  // Check all collections for pending items assigned to this executive
  const collections = [
    { name: 'agents', model: Agent, field: 'CallExecutiveCall' },
    { name: 'customers', model: Customer, field: 'CallExecutiveCall' },
    { name: 'properties', model: Property, field: 'CallExecutiveCall' },
    { name: 'skilledlabours', model: SkilledLabour, field: 'CallExecutiveCall' },
    { name: 'expertRequests', model: WantedExpertRequest, field: 'CallExecutiveCall' },
    { name: 'investors', model: Investor, field: 'CallExecutiveCall' },
    { name: 'expertCallRequests', model: ExpertRequest, field: 'CallExecutiveCall' },
    { name: 'requestedProperties', model: requestedProperties, field: 'CallExecutiveCall' }
  ];

  for (const collection of collections) {
    const items = await collection.model.find({
      [collection.field]: "Pending",
      assignedExecutive: executiveId,
      createdAt: { $gte: sinceDate }
    }).limit(10).lean();

    if (items.length > 0) {
      pendingItems[collection.name] = items;
    }
  }

  return pendingItems;
};


const pendingcalls= async (req, res) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const pendingItems = await checkPendingItems(req.params.id, oneDayAgo);
    res.status(200).json({ pendingItems });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending items" });
  }
};

module.exports = {
  addCallExecutive,
  getCallExecutives,
  deleteCallExecutive,
  CallExecutiveLogin,
  myagents,
  myCustomers,
  myProperties,
  getCallExe,
  editExecutive,
  toggleStatus,
  getStatus,
  handleAccept,
  ExecutiveLogin,
  ExecutiveActive,
  executiveNotification,
  pendingcalls,
  Updatepushtoken
};
