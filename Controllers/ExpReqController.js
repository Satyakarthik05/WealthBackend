const ExpReq = require("../Models/ReqExp");

const RequestExpert = async (req, res) => {
  const io = req.app.get("io");
  const { expertType, reason, WantedBy, UserType } = req.body;

  // Validate required fields
  if (!expertType || !WantedBy || !UserType) {
    return res
      .status(400)
      .json({ message: "Expert type, wantedBy, and userType are required." });
  }

  try {
    // Create a new expert request document
    const newRequest = new ExpReq({
      expertType,
      reason,
      WantedBy,
      UserType,
    });

    await newRequest.save();
    io.emit("new_requestExpert", {
      expert: newRequest,
      message: `New expert requested ${expertType}`,
      sound: true,
    });

    res.status(201).json({ message: "Request submitted successfully!" });
  } catch (error) {
    console.error("Error saving request:", error);
    res.status(500).json({ message: "Failed to submit request." });
  }
};



const getAllRequestedExperts = async (req, res) => {
  try {
    const experts = await ExpReq.find();
    res.status(200).json(experts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const resolvedRequest = async (req, res) => {
  try {
    const expert = await ExpReq.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ message: "Expert request not found" });
    }

    expert.resolved = true;
    expert.resolvedAt = new Date();
    const updatedExpert = await expert.save();

    res.json(updatedExpert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { RequestExpert, getAllRequestedExperts, resolvedRequest };
