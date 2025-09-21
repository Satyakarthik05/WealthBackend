const NotificationToken = require("../Models/NotificationToken");

const registerToken = async (req, res) => {
  try {
    const { token, deviceType, appVersion, userId } = req.body;

    // Validate required fields
    if (!token) {
      return res.status(400).json({ 
        success: false,
        error: "Expo push token is required" 
      });
    }

    if (!deviceType || !['ios', 'android', 'web'].includes(deviceType)) {
      return res.status(400).json({ 
        success: false,
        error: "Valid device type (ios/android/web) is required" 
      });
    }

    if (!appVersion) {
      return res.status(400).json({ 
        success: false,
        error: "App version is required" 
      });
    }

    // Check for existing token
    const existingToken = await NotificationToken.findOne({ expoPushToken: token });

    if (existingToken) {
      // Update existing token with new information
      existingToken.deviceType = deviceType;
      existingToken.appVersion = appVersion;
      existingToken.userId = userId || existingToken.userId;
      existingToken.lastActive = new Date();
      
      await existingToken.save();
      
      return res.status(200).json({ 
        success: true,
        message: "Token updated successfully",
        token: existingToken
      });
    }

    // Create new token record
    const newToken = await NotificationToken.create({
      expoPushToken: token,
      deviceType,
      appVersion,
      userId,
      lastActive: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Token registered successfully",
      token: newToken
    });

  } catch (error) {
    console.error("Error registering notification token:", error);
    
    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "This token is already registered"
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional controller methods
const getTokensByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tokens = await NotificationToken.find({ userId });
    
    res.status(200).json({
      success: true,
      count: tokens.length,
      tokens
    });
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

const deleteToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required"
      });
    }
    
    const result = await NotificationToken.deleteOne({ expoPushToken: token });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Token not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Token deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting token:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

module.exports = {
  registerToken,
  getTokensByUser,
  deleteToken
};