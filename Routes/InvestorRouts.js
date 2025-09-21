const express = require("express");
const {
  registerInvestors,
  fetchSkilledLabours,
  fetchAgentInvestors,
  fetchAdminInvestors,
  deleteInvestor,
  fetchInvestors,
  InvestorLogin,
  getInvestor,
  UpdateInvestorAdmin,
  updateInvestorDetails,
  callDone
} = require("../Controllers/InvestorController");
const verifyInvestorToken = require("../middleWares/InvestorToken");
const verifyUser = require("../middleWares/VerifyUser");

const router = express.Router();

// Route to register a skilled labour
router.post("/register", registerInvestors);

// Route to fetch all skilled labours
router.get("/list", fetchInvestors);
router.get("/getagentinvestor", verifyUser, fetchAgentInvestors);
router.get("/AdminInvestor", fetchAdminInvestors);
router.delete("/delete/:id", deleteInvestor);
router.post("/investorlogin", InvestorLogin);
router.get("/getinvestor", verifyInvestorToken, getInvestor);
router.post("/updateInvestor", updateInvestorDetails);
router.put("/update/:id", UpdateInvestorAdmin);
router.put("/markasdone/:id", callDone);

module.exports = router;
