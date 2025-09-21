const Property = require("../Models/Property");
const ApprovedProperty = require("../Models/ApprovedPropertys");
const PushToken = require("../Models/NotificationToken");
const SoldedProperty = require("../Models/SoldPropertyModel");
const LikedPropertymodel = require("../Models/LikeProperty");

const approveProperty = async (req, res) => {
  const io = req.app.get("io");
  try {
    const { id } = req.params;

    // 1. Find the property by ID
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // 2. Create an approved property entry
    const approvedProperty = new ApprovedProperty({
      propertyType: property.propertyType,
      location: property.location,
      price: property.price,
      photo: property.photo,
      newImageUrls: property.newImageUrls,
      Constituency: property.Constituency,
      PostedBy: property.PostedBy,
      propertyDetails: property.propertyDetails || "no details",
      PostedUserType: property.PostedUserType,
      dynamicData: property.dynamicData || {},
    });

    await approvedProperty.save();
    await Property.findByIdAndDelete(id);
    io.emit('new-property', approvedProperty);

    // 3. Fetch all user push tokens
    const allTokens = await PushToken.find({});

    if (!allTokens.length) {
      return res.status(200).json({
        message: "Property approved, but no push tokens found to notify users.",
        approvedProperty,
      });
    }

    // 4. Construct notification message
    const title = "Wealth Associates\nNew Property Nearby";
    const body = `New ${property.propertyType} posted nearby you for ₹${property.price} in ${property.location}`;

    // Prepare notification messages
    const messages = allTokens.map((user) => ({
      to: user.expoPushToken,
      sound: "default",
      title,
      body,
      data: {
        screen: "PropertyDetails",
        propertyId: approvedProperty._id.toString(),
      },
    }));

    // Send notifications in chunks of 100 (Expo limitation)
    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);

      try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        });

        const data = await response.json();
        console.log(`Expo push response for chunk ${i / chunkSize + 1}:`, data);

        // Check for errors in the response
        if (data.data && data.data.some((item) => item.status === "error")) {
          console.error(
            "Some notifications failed to send:",
            data.data.filter((item) => item.status === "error")
          );
        }
      } catch (err) {
        console.error("Error sending push notification chunk:", err);
      }
    }

    // 5. Send final response
    res.status(200).json({
      message: "Property approved and push notifications sent to users",
      approvedProperty,
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const LikeProperty = async (req, res) => {
  try {
    const { propertyId, like, userName, mobileNumber } = req.body;
    const property = await ApprovedProperty.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // 2. Create an approved property entry
    const approvedProperty = new LikedPropertymodel({
      propertyType: property.propertyType,
      location: property.location,
      price: property.price,
      photo: property.photo,
      Constituency: property.Constituency,
      PostedBy: property.PostedBy,
      like: "yes",
      MobileNumber: mobileNumber,
      FullName: userName,
      propertyDetails: property.propertyDetails || "no details",
      PostedUserType: property.PostedUserType,
      dynamicData: property.dynamicData || {},
    });

    await approvedProperty.save();
    res.status(200).json({
      message: "Liked property successfully",
      approvedProperty,
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// module.exports = approveProperty;
const GetAllApprovdPropertys = async (req, res) => {
  try {
    const properties = await ApprovedProperty.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};


const GetlikedPropertys = async (req, res) => {
  const { MobileNumber } = req.body;
  try {
    const properties = await LikedPropertymodel.find({ MobileNumber });
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};
const GetAlllikedPropertys = async (req, res) => {
  // const {MobileNumber}=req.body;
  try {
    const properties = await LikedPropertymodel.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const deletProperty = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received delete request for ID:", id);

    const property = await ApprovedProperty.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatePropertyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProperty = await ApprovedProperty.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
      }
    );

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

const SoldProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the property by ID
    const property = await ApprovedProperty.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // 2. Create an approved property entry
    const SoldProperty = new SoldedProperty({
      propertyType: property.propertyType,
      location: property.location,
      price: property.price,
      photo: property.photo,
      Constituency: property.Constituency,
      PostedBy: property.PostedBy,
      propertyDetails: property.propertyDetails
        ? property.propertyDetails
        : "no details",
      PostedUserType: property.PostedUserType,
      dynamicData: property.dynamicData || {},
    });

    await SoldProperty.save();
    console.log("Original property dynamicData:", property.dynamicData);
    console.log("Approved property dynamicData:", SoldProperty.dynamicData);
    await ApprovedProperty.findByIdAndDelete(id);

    // 6. Send final response
    res.status(200).json({
      message: "Property approved and push notifications sent to users",
      SoldProperty,
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const GetAllSoldedPropertys = async (req, res) => {
  try {
    const properties = await SoldedProperty.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const callDoneforliked = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await LikedPropertymodel.findByIdAndUpdate(
      id,
      { CallExecutiveCall: "Done" },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({
      message: "Call marked as done successfully",
      property,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const LikedDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await LikedPropertymodel.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  approveProperty,
  GetAllApprovdPropertys,
  deletProperty,
  updatePropertyAdmin,
  SoldProperty,
  GetAllSoldedPropertys,
  LikeProperty,
  GetlikedPropertys,
  GetAlllikedPropertys,
  callDoneforliked,
  LikedDelete,
};
