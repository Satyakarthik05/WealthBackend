const jwt = require("jsonwebtoken");
const Skill = require("../Models/SkillModel");

const secret = process.env.JWT_SECRET || "Wealth@123";

const verifySkillToken = async (req, res, next) => {
  const token = req.headers.token;

  console.log("Received Token:", token); // Log the token for debugging

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, secret);
    console.log("Decoded Token:", decoded); // Log the decoded token

    // Check if the agent exists
    const agent = await Skill.findById(decoded.SkillId);
    if (!agent) {
      return res.status(404).json({ error: "Skilled not found" });
    }

    req.SkillId = agent._id;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Malformed or invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = verifySkillToken;
