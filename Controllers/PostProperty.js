const fs = require("fs");
const path = require("path");
const Property = require("../Models/Property");
const AgentSchema = require("../Models/AgentModel");
const CustomerSchema = require("../Models/Customer");
const CoreSchema = require("../Models/CoreModel");
const skillSchema = require("../Models/SkillModel");
const nriSchema = require("../Models/NriModel");
const investorSchema = require("../Models/InvestorModel");
const mongoose = require("mongoose");
const axios = require("axios");
const getNearbyProperty = require("../Models/ApprovedPropertys");
const CallExecutive = require("../Models/CallExecutiveModel");
const ApprovedProperty = require("../Models/ApprovedPropertys");
const cron = require("node-cron");
const AWS = require("aws-sdk");

// The actual function (extracted so it can be called manually or via cron)
const updateReferralAndPostedData = async () => {
  try {
    // Fetch all agents
    const allAgents = await AgentSchema.find({});

    // Process each agent
    for (const agent of allAgents) {
      const { MobileNumber, MyRefferalCode } = agent;

      if (!MobileNumber || !MyRefferalCode) {
        console.warn(
          `Skipping agent with missing mobileNumber or referralCode: ${agent._id}`
        );
        continue;
      }

      try {
        // Fetch data for the current agent
        const [
          agentData,
          customerData,
          investorData,
          skilledData,
          nrisData,
          propertyData,
          approvedData,
        ] = await Promise.all([
          AgentSchema.find({ ReferredBy: MyRefferalCode }).catch(() => []),
          CustomerSchema.find({ ReferredBy: MyRefferalCode }).catch(() => []),
          investorSchema.find({ AddedBy: MobileNumber }).catch(() => []),
          skillSchema.find({ AddedBy: MobileNumber }).catch(() => []),
          nriSchema.find({ AddedBy: MobileNumber }).catch(() => []),
          Property.find({ PostedBy: MobileNumber }).catch(() => []),
          ApprovedProperty.find({ PostedBy: MobileNumber }).catch(() => []),
        ]);

        // Prepare counts object
        const referralStats = {
          referredAgents: agentData?.length || 0,
          referredCustomers: customerData?.length || 0,
          addedInvestors: investorData?.length || 0,
          addedSkilled: skilledData?.length || 0,
          addedNRIs: nrisData?.length || 0,
          postedProperties: propertyData?.length || 0,
          approvedProperties: approvedData?.length || 0,
          lastUpdated: new Date(),
        };

        // Update the agent with counts
        await AgentSchema.findByIdAndUpdate(
          agent._id,
          { $set: { referralStats } },
          { new: true }
        );
      } catch (agentError) {
        console.error(`Error processing agent ${agent._id}:`, agentError);
        continue;
      }
    }

    console.log(
      `Successfully updated referral and posted counts for ${allAgents.length
      } agents at ${new Date()}`
    );
  } catch (error) {
    console.error(
      "Error processing referral and posted data for agents:",
      error
    );
  }
};

cron.schedule("0 8 * * *", () => {
  console.log("Running scheduled referral stats update at 2 AM");
  updateReferralAndPostedData();
});

const getReferralAndPostedDatas = async (req, res) => {
  try {
    // Fetch all agents
    const allAgents = await AgentSchema.find({});

    // Process each agent
    for (const agent of allAgents) {
      const { MobileNumber, MyRefferalCode } = agent;

      if (!MobileNumber || !MyRefferalCode) {
        console.warn(
          `Skipping agent with missing mobileNumber or referralCode: ${agent._id}`
        );
        continue;
      }

      try {
        // Fetch data for the current agent
        const [
          agentData,
          customerData,
          investorData,
          skilledData,
          nrisData,
          propertyData,
          approvedData,
        ] = await Promise.all([
          AgentSchema.find({ ReferredBy: MyRefferalCode }).catch(() => []),
          CustomerSchema.find({ ReferredBy: MyRefferalCode }).catch(() => []),
          investorSchema.find({ AddedBy: MobileNumber }).catch(() => []),
          skillSchema.find({ AddedBy: MobileNumber }).catch(() => []),
          nriSchema.find({ AddedBy: MobileNumber }).catch(() => []),
          Property.find({ PostedBy: MobileNumber }).catch(() => []),
          ApprovedProperty.find({ PostedBy: MobileNumber }).catch(() => []),
        ]);

        // Prepare counts object
        const referralStats = {
          referredAgents: agentData?.length || 0,
          referredCustomers: customerData?.length || 0,
          addedInvestors: investorData?.length || 0,
          addedSkilled: skilledData?.length || 0,
          addedNRIs: nrisData?.length || 0,
          postedProperties: propertyData?.length || 0,
          approvedProperties: approvedData?.length || 0,
          lastUpdated: new Date(),
        };

        // Update the agent with counts
        await AgentSchema.findByIdAndUpdate(
          agent._id,
          { $set: { referralStats } },
          { new: true }
        );
      } catch (agentError) {
        console.error(`Error processing agent ${agent._id}:`, agentError);
        continue;
      }
    }

    return res.status(200).json({
      message: "Successfully updated referral and posted counts for all agents",
      totalAgentsProcessed: allAgents.length,
    });
  } catch (error) {
    console.error(
      "Error processing referral and posted data for agents:",
      error
    );
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getReferralAndPostedData = async (req, res) => {
  try {
    const { mobileNumber, myReferralCode } = req.body;

    if (!mobileNumber || !myReferralCode) {
      return res
        .status(400)
        .json({ message: "Mobile number and referral code are required." });
    }

    // Fetch data
    const agentData = await AgentSchema.find({ ReferredBy: myReferralCode });
    const customerData = await CustomerSchema.find({
      ReferredBy: myReferralCode,
    });
    const investorData = await investorSchema.find({ AddedBy: mobileNumber });
    const skilledData = await skillSchema.find({ AddedBy: mobileNumber });
    const nrisData = await nriSchema.find({ AddedBy: mobileNumber });
    const propertyData = await Property.find({ PostedBy: mobileNumber });
    const approvedData = await ApprovedProperty.find({
      PostedBy: mobileNumber,
    });

    // Calculate counts
    const counts = {
      agentCount: agentData.length,
      customerCount: customerData.length,
      investorCount: investorData.length,
      skilledCount: skilledData.length,
      nrisCount: nrisData.length,
      propertyCount: propertyData.length,
      approvedCount: approvedData.length,
    };

    // Respond with data and counts
    return res.status(200).json({
      data: {
        agentData,
        customerData,
        investorData,
        skilledData,
        nrisData,
        propertyData,
        approvedData,
      },
      counts,
    });
  } catch (error) {
    console.error("Error fetching referral and posted data:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getReferrerDetails = async (req, res) => {
  const { PostedBy } = req.params;

  try {
    const collectionsPrimary = [AgentSchema, CustomerSchema, CoreSchema];
    let foundUser = null;
    let foundIn = "";

    for (let model of collectionsPrimary) {
      const user = await model.findOne({ MobileNumber: PostedBy });
      if (user) {
        foundUser = user;
        foundIn = model.modelName;
        console.log(`PostedBy found in: ${foundIn}`, user);
        break;
      }
    }

    if (foundUser && foundUser.ReferredBy) {
      const referredCode = foundUser.ReferredBy;
      console.log("ReferredBy code:", referredCode);

      for (let model of collectionsPrimary) {
        const ref = await model.findOne({ MyRefferalCode: referredCode });
        console.log(
          `Searching in ${model.modelName} with code: ${referredCode}`,
          ref
        );
        if (ref) {
          return res.json({
            postedByName: foundUser.FullName,
            name: ref.FullName,
            phone: ref.MobileNumber,
            source: model.modelName,
          });
        }
      }
    }

    const collectionsSecondary = [nriSchema, skillSchema, investorSchema];
    for (let model of collectionsSecondary) {
      const key = model.modelName === "NRI" ? "MobileIN" : "MobileNumber";
      const user = await model.findOne({ [key]: PostedBy });
      if (user && user.AddedBy) {
        const addedBy = user.AddedBy;
        const postedByName =
          model.modelName === "NRI" ? user.Name : user.FullName;

        const allCollections = [
          AgentSchema,
          CustomerSchema,
          CoreSchema,
          nriSchema,
          skillSchema,
          investorSchema,
        ];

        for (let searchModel of allCollections) {
          const field =
            searchModel.modelName === "NRI" ? "MobileIN" : "MobileNumber";
          const ref = await searchModel.findOne({ [field]: addedBy });
          if (ref) {
            const refName =
              searchModel.modelName === "NRI" ? ref.Name : ref.FullName;
            const refPhone =
              field === "MobileIN" ? ref.MobileIN : ref.MobileNumber;

            return res.json({
              postedByName,
              name: refName,
              phone: refPhone,
              source: searchModel.modelName,
            });
          }
        }
      }
    }

    return res.status(404).json({ message: "Referrer not found." });
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const createProperty = async (req, res) => {
  const io = req.app.get("io");
  const s3 = new AWS.S3({
    accessKeyId: "AKIAWX2IFPZYF2O4O3FG",
    secretAccessKey: "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",
    region: "us-east-1",
  });

  const uploadToS3 = async (file) => {
    const s3 = new AWS.S3({
      accessKeyId: "AKIAWX2IFPZYF2O4O3FG",
      secretAccessKey: "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",
      region: "us-east-1",
    });

    const fileName = `Approved_Properties/${Date.now()}-${file.originalname}`;

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
    const cloudFrontUrl = `https://${cloudFrontDomain}/Approved_Properties/${s3Url.pathname
      .split("/")
      .slice(2)
      .join("/")}`;

    console.log(`File uploaded successfully: ${cloudFrontUrl}`);
    return cloudFrontUrl;
  };

  try {
    console.log("createProperty endpoint hit");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Request Files:", req.files ? req.files.length : "No files");

    let {
      propertyType,
      location,
      price,
      PostedBy,
      fullName,
      mobile,
      Constituency,
      propertyDetails,
    } = req.body;

    if (!PostedBy) {
      console.error("Missing PostedBy field");
      return res
        .status(400)
        .json({ message: "PostedBy (MobileNumber) is required." });
    }

    if (!req.files || req.files.length === 0) {
      console.error("No files provided");
      return res
        .status(400)
        .json({ message: "At least one photo is required." });
    }

    if (req.files.length > 6) {
      console.error("Too many files");
      return res.status(400).json({ message: "Maximum 6 photos allowed." });
    }

    // Upload all files to S3 and get CloudFront URLs
    console.log("Starting S3 upload...");
    const uploadPromises = req.files.map((file) => uploadToS3(file));
    const cloudFrontUrls = await Promise.all(uploadPromises);
    console.log("S3 upload complete. URLs:", cloudFrontUrls);

    // Format the URLs exactly like your migration script
    const newImageUrls =
      cloudFrontUrls.length === 1 ? cloudFrontUrls[0] : cloudFrontUrls;

    // For backward compatibility, we'll also store in photo field
    const photo = newImageUrls;

    console.log("Saving property to database...");
    const newProperty = new Property({
      propertyType,
      location,
      price,
      photo, // maintaining backward compatibility
      newImageUrls, // storing in the new field with CloudFront URLs
      PostedBy,
      fullName,
      mobile,
      propertyDetails,
      Constituency,
      status: "pending",
    });
    io.emit("new_property", {
      property: newProperty,
      message: `New property posted by ${fullName}!`,
      sound: true,
    });
    await newProperty.save();
    console.log("Property saved successfully:", newProperty._id);

    // Executive assignment logic remains the same
    const callExecutives = await CallExecutive.find({
      assignedType: "Property",
    })
      .sort({ lastAssignedAt: 1 })
      .limit(1);

    if (callExecutives.length > 0) {
      const assignedExecutive = callExecutives[0];
      assignedExecutive.assignedUsers.push({
        userType: "Property",
        userId: newProperty._id,
      });
      assignedExecutive.lastAssignedAt = new Date();
      await assignedExecutive.save();
    }

    return res.status(200).json({
      message: "Property added and assigned successfully",
      newProperty,
      assignedTo:
        callExecutives.length > 0
          ? callExecutives[0].name
          : "No executive available",
    });
  } catch (error) {
    console.error("Error in createProperty:", error);
    return res.status(500).json({
      message: "Error adding property",
      error: error.message,
    });
  }
};

const GetAllPropertys = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const GetMyPropertys = async (req, res) => {
  try {
    const mobileNumber = req.mobileNumber;

    // First check the Property collection
    const properties = await Property.find({ PostedBy: mobileNumber });

    if (!properties || properties.length === 0) {
      // If not found in Property collection, check ApprovedProperty collection
      const approvedProperties = await ApprovedProperty.find({
        PostedBy: mobileNumber,
      });

      if (!approvedProperties || approvedProperties.length === 0) {
        return res.status(200).json({
          message: "No properties found for this user",
          MyPosts: [],
        });
      }

      return res.status(200).json(approvedProperties);
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

// Get properties posted by admin
const AdminProperties = async (req, res) => {
  try {
    const properties = await Property.find({ PostedUserType: "admin" });

    if (!properties || properties.length === 0) {
      return res
        .status(200)
        .json({ message: "No properties found for this user", MyPosts: [] });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

// Delete a property
const deletProperty = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received delete request for ID:", id);

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// **Edit Property Controller**
const editProperty = async (req, res) => {
  try {
    const { id } = req.params; // Property ID
    const { propertyType, location, price } = req.body;

    let updatedFields = { propertyType, location, price };

    // Handle photo update
    if (req.file) {
      updatedFields.photo = `/uploads/${req.file.filename}`;
    }

    // Update the property in the database
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res
      .status(200)
      .json({ message: "Property updated successfully", updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Error updating property", error });
  }
};

const updatePropertyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProperty = await Property.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNearbyProperties = async (req, res) => {
  try {
    const { constituency } = req.params;

    if (!constituency) {
      return res
        .status(400)
        .json({ message: "Constituency is required in params" });
    }

    // Fetch properties from database that match the constituency
    console.log(constituency);
    const properties = await getNearbyProperty.find({
      Constituency: constituency,
    });

    if (properties.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found in this constituency" });
    }

    res.status(200).json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getReferredByDetails = async (req, res) => {
  const { referredBy } = req.body;

  if (!referredBy) {
    return res.status(400).json({ error: "referredBy is required" });
  }
  console.log(referredBy);
  try {
    let referredUser =
      (await AgentSchema.findOne({ MyRefferalCode: referredBy })) ||
      (await CustomerSchema.findOne({ MyRefferalCode: referredBy })) ||
      (await CoreSchema.findOne({ MyRefferalCode: referredBy }));

    if (!referredUser) {
      referredUser =
        (await AgentSchema.findOne({ MobileNumber: referredBy })) ||
        (await CustomerSchema.findOne({ MobileNumber: referredBy })) ||
        (await CoreSchema.findOne({ MobileNumber: referredBy }));
    }

    if (!referredUser) {
      referredUser =
        (await skillSchema.findOne({ MobileNumber: referredBy })) ||
        (await investorSchema.findOne({ MobileNumber: referredBy })) ||
        (await nriSchema.findOne({ MobileIN: referredBy }));
    }

    if (referredUser) {
      return res.status(200).json({
        status: "success",
        referredByDetails: {
          name: referredUser.FullName || "N/A",
          Number: referredUser.MobileNumber || "N/A",
          name: referredUser.FullName || "N/A",
          Number: referredUser.MobileNumber || "N/A",
        },
      });
    } else {
      return res.status(200).json({
        status: "success",
        referredByDetails: {
          name: "Wealth Associate",
          Number: 7796356789,
        },
      });
    }
  } catch (error) {
    console.error("Error finding referredBy:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// const Property = require('../models/propertyModel');

// Update dynamic data
const updateDynamicData = async (req, res) => {
  try {
    // 1. Validate property ID
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid property ID",
      });
    }

    // 2. Prepare update data
    const updateData = {
      $set: {
        dynamicData: req.body,
        editedAt: Date.now(),
      },
    };

    // 3. Find and update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // 4. Check if property exists
    if (!updatedProperty) {
      return res.status(404).json({
        status: "fail",
        message: "No property found with that ID",
      });
    }

    // 5. Send success response
    res.status(200).json({
      status: "success",
      data: {
        property: updatedProperty,
      },
    });
  } catch (err) {
    // Handle different types of errors
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid ID format",
      });
    }

    // Generic error handler
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: err.message,
    });
  }
};
module.exports = {
  createProperty,
  GetAllPropertys,
  GetMyPropertys,
  AdminProperties,
  deletProperty,
  editProperty,
  updatePropertyAdmin,
  getNearbyProperties,
  getReferredByDetails,
  updateDynamicData,
  getReferrerDetails,
  getReferralAndPostedData,
};
