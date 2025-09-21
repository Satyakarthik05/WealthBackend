const express = require("express");
const {
  NRIMemberSign,
  fetchReferredNRIMembers,
  NRILogin,
  getNRI,
  updateNRIDetails,
  geymyNris,
  deleteReferredMember,
  editReferredMember,
} = require("../Controllers/NriController");
const verifyNriToken = require("../middleWares/NriToken");
const verifyUser = require("../middleWares/VerifyUser");

const router = express.Router();

// Route for NRI Member Registration
router.post("/register", NRIMemberSign);

// Route to fetch referred NRI members
router.get("/referred-members", fetchReferredNRIMembers);
router.post("/nrilogin", NRILogin);
router.get("/getnri", verifyNriToken, getNRI);
router.post("/updatenri", updateNRIDetails);
router.get("/getmynris", verifyUser, geymyNris);
router.delete("/deletenri/:id", deleteReferredMember);
router.put("/editnri/:id", editReferredMember);

module.exports = router;
