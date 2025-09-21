const jwt = require("jsonwebtoken");
const AgentSchema = require("../Models/AgentModel");
const CoreSchema = require("../Models/CoreModel");
const CustomerSchema = require("../Models/Customer");
const InvestorSchema = require("../Models/InvestorModel");
const NriSchema = require("../Models/NriModel");
const SkillSchema = require("../Models/SkillModel");

const secret = process.env.JWT_SECRET || "Wealth@123";

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    // Extract IDs from decoded token
    const { AgentId, coreId, CustomerId, InvestorId, NriId, SkillId } = decoded;

    // Check in all three collections
    const agent = AgentId ? await AgentSchema.findById(AgentId) : null;
    const coreUser = coreId ? await CoreSchema.findById(coreId) : null;
    const InvestorUser = InvestorId
      ? await InvestorSchema.findById(InvestorId)
      : null;
    const NriUser = NriId ? await NriSchema.findById(NriId) : null;
    const skillUser = SkillId ? await SkillSchema.findById(SkillId) : null;
    const customerUser = CustomerId
      ? await CustomerSchema.findById(CustomerId)
      : null;

    let userData = null;
    let userType = "";
    let mobileNumber = "";

    if (agent) {
      userData = agent;
      userType = "agent";
      mobileNumber = agent.MobileNumber;
    } else if (coreUser) {
      userData = coreUser;
      userType = "coreMember";
      mobileNumber = coreUser.MobileNumber;
    } else if (customerUser) {
      userData = customerUser;
      userType = "customerMember";
      mobileNumber = customerUser.MobileNumber;
    } else if (InvestorUser) {
      userData = InvestorUser;
      userType = "InvestorMember";
      mobileNumber = InvestorUser.MobileNumber;
    } else if (NriUser) {
      userData = NriUser;
      userType = "NriMember";
      mobileNumber = NriUser.MobileIN;
    } else if (skillUser) {
      userData = skillUser;
      userType = "SkilledMember";
      mobileNumber = skillUser.MobileNumber;
    } else {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = userData;
    req.userType = userType;
    req.mobileNumber = mobileNumber; // Send mobile number to the controller
    next();
  } catch (error) {
    console.error("Error in verifyUser middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = verifyUser;
