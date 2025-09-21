const express = require("express");
const router = express.Router();
const {
  registerExpertRequest,
  getAllRequestedExperts,
  resolvedRequest,
} = require("../Controllers/RequestedExperts");

// Route to register a new expert request
router.post("/register", registerExpertRequest);

// Route to fetch all requested experts
router.get("/all", getAllRequestedExperts);
router.put("/resolve/:id", resolvedRequest);

module.exports = router;
