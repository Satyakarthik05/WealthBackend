const Agent = require("../Models/AgentModel");
const RequestProperty = require("../Models/RequestProperty");
const axios = require("axios");
const PushToken = require("../Models/NotificationToken");
const PropertyRequest = async (req, res) => {
  const io = req.app.get("io");
  try {
    const { propertyTitle, propertyType, location, Budget, PostedBy, islocation } = req.body;

    if (!PostedBy) {
      return res
        .status(400)
        .json({ message: "PostedBy (MobileNumber) is required." });
    }

    let agent;
    if (PostedBy === "Admin") {
      agent = {
        FullName: "Admin",
        MobileNumber: "0000000000",
        Email: "admin@wealthassociation.com",
      };
    } else {
      agent = await Agent.findOne({ MobileNumber: PostedBy });
    }

    const newRequestProperty = new RequestProperty({
      propertyTitle,
      propertyType,
      location,
      Budget,
      islocation,
      PostedBy: PostedBy,
    });

    await newRequestProperty.save();
    
    // Emit notification for requested property
    io.emit("new_requested_property", {
      property: newRequestProperty,
      message: `New property requested by ${PostedBy}!`,
      sound: true,
    });

    res.status(200).json({
      message: "Requested property successfully",
      newRequestProperty,
    });
  } catch (error) {
    console.error("Error while requesting property:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


const approveRequestProperty = async (req, res) => {
  try {
    const { id } = req.params;

   
    const property = await RequestProperty.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Step 2: Update its approval status
    property.Approved = "Done";
    const updatedProperty = await property.save();

    // Step 3: Send push notifications using property details
    try {
      const allTokens = await PushToken.find({});

      if (allTokens.length > 0) {
        const title = "Wealth Associates\nNew Property Request";
        const body = `New ${property.propertyType} requested in ${property.location} with budget ₹${property.Budget}`;

        const notifications = allTokens.map((user) => ({
          to: user.expoPushToken,
          sound: "default",
          title,
          body,
        }));

        // Send notifications in chunks of 100
        const chunks = [];
        while (notifications.length) {
          chunks.push(notifications.splice(0, 100));
        }

        for (const chunk of chunks) {
          try {
            await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(chunk),
            });
          } catch (err) {
            console.error("Error sending push notification chunk:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }

    res.status(200).json({
      message: "Property approved successfully",
      property: updatedProperty
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const GetMyRequestedPropertys = async (req, res) => {
  try {
    const mobileNumber = req.mobileNumber;
    const properties = await RequestProperty.find({ PostedBy: mobileNumber });

    if (!properties || properties.length === 0) {
      return res
        .status(200)
        .json({ message: "No properties found", properties: [] });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const GetRequsestedPropertys = async (req, res) => {
  try {
    const properties = await RequestProperty.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

// 🆕 New: Update Requested Property
const UpdateRequestedProperty = async (req, res) => {
  try {
    const { id } = req.params; // Get property ID from the URL
    const { propertyTitle, propertyType, location, Budget } = req.body;
    const mobileNumber = req.mobileNumber; // User's mobile number from authentication

    const existingProperty = await RequestProperty.findById(id);

    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Ensure only the owner can edit the property
    if (existingProperty.PostedBy !== mobileNumber) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this property" });
    }

    existingProperty.propertyTitle =
      propertyTitle || existingProperty.propertyTitle;
    existingProperty.propertyType =
      propertyType || existingProperty.propertyType;
    existingProperty.location = location || existingProperty.location;
    existingProperty.Budget = Budget || existingProperty.Budget;

    const updatedProperty = await existingProperty.save();

    res.status(200).json({
      message: "Property updated successfully",
      updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
const AdminUpdateRequestedProperty = async (req, res) => {
  try {
    const { id } = req.params; // Get property ID from the URL
    const { propertyTitle, propertyType, location, Budget } = req.body;
    // const mobileNumber = req.mobileNumber;

    const existingProperty = await RequestProperty.findById(id);

    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    existingProperty.propertyTitle =
      propertyTitle || existingProperty.propertyTitle;
    existingProperty.propertyType =
      propertyType || existingProperty.propertyType;
    existingProperty.location = location || existingProperty.location;
    existingProperty.Budget = Budget || existingProperty.Budget;

    const updatedProperty = await existingProperty.save();

    res.status(200).json({
      message: "Property updated successfully",
      updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const DeleteRequestedProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProperty = await RequestProperty.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  PropertyRequest,
  GetMyRequestedPropertys,
  GetRequsestedPropertys,
  UpdateRequestedProperty,
  AdminUpdateRequestedProperty,
  DeleteRequestedProperty,
  approveRequestProperty
};
