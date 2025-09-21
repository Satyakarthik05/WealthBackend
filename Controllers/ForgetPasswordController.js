const AgentSchema = require("../Models/AgentModel");
const axios = require("axios");

const sendSMS = async (MobileNumber, OTP) => {
  try {
    const apiUrl = "http://bulksms.astinsoft.com/api/v2/sms/Send";
    const params = {
      UserName: "wealthassociates",
      APIKey: "88F40D9F-0172-4D25-9CF5-5823211E67E7",
      MobileNo: `${MobileNumber}`,
      Message: `Your OTP for password recovery is: ${OTP} This OTP is valid for 10 minutes. For Any Query - 7796356789 Wealth Associates`,
      SenderName: "WTHASC",
      TemplateId: "1707173933584753849",
      MType: 1,
    };

    console.log("Sending SMS with Parameters:", params);

    const response = await axios.get(apiUrl, { params });

    console.log("Full API Response:", response.data);

    if (
      response.data &&
      response.data.toLowerCase().includes("sms sent successfully")
    ) {
      console.log("SMS Sent Successfully:", response.data);
      return response.data;
    } else {
      console.error("SMS API Error Response:", response.data || response);
      throw new Error(response.data || "Failed to send SMS");
    }
  } catch (error) {
    console.error("Error in sendSMS function:", error.message);
    throw new Error("SMS sending failed");
  }
};

const ForgetPassword = async (req, res) => {
  const { MobileNo } = req.body;

  if (!MobileNo || typeof MobileNo !== "string") {
    return res.status(400).json({ message: "Invalid mobile number provided" });
  }

  try {
    console.log("Looking up agent with Mobile Number:", MobileNo);

    const Agent = await AgentSchema.findOne({ MobileNumber: MobileNo });

    if (Agent) {
      const OTP = Math.floor(1000 + Math.random() * 9000).toString();
      console.log("Generated OTP:", OTP);

      Agent.Otp = OTP;
      Agent.otpExpiresAt = Date.now() + 10 * 60 * 1000;
      await Agent.save();
      console.log("OTP saved in the database");

      try {
        const smsResponse = await sendSMS(MobileNo, OTP);
        return res.status(200).json({
          message: "OTP sent successfully and stored in the database",
          smsResponse,
        });
      } catch (smsError) {
        console.error("Failed to send SMS:", smsError.message);
        return res.status(500).json({
          message:
            "Failed to send OTP. Please check the mobile number or try again later.",
          error: smsError.message,
        });
      }
    } else {
      console.warn("Mobile number not found in database:", MobileNo);
      return res.status(400).json({ message: "Mobile number not found" });
    }
  } catch (dbError) {
    console.error("Database error:", dbError.message);
    return res
      .status(500)
      .json({ message: "Database error", error: dbError.message });
  }
};

const VerifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    // Find the agent by mobile number
    const agent = await AgentSchema.findOne({ MobileNumber: mobileNumber });

    if (!agent) {
      return res.status(400).json({ message: "Agent Not Found" });
    }

    // Check if OTP matches
    if (agent.Otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP Verified Successfully
    return res.status(200).json({ message: "OTP Verification Successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { mobileNumber, newPassword } = req.body;

    // Check if user exists
    const user = await AgentSchema.findOne({ MobileNumber: mobileNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.Password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { ForgetPassword, VerifyOtp, resetPassword };
