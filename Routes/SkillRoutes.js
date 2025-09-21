const express = require("express");
const {
  registerSkilledLabour,
  fetchSkilledLabours,
  fetchAddedSkillLAbours,
  fetchAdminSkill,
  deleteSkillLabour,
  SkillLogin,
  getSkilled,
  updateSkilledDetails,
  UpdateSkillAdmin,
  callDone
} = require("../Controllers/SkillController");
const verifySkilledToken = require("../middleWares/SkillToken");
const verifyUser = require("../middleWares/VerifyUser");

const router = express.Router();

// Route to register a skilled labour
router.post("/register", registerSkilledLabour);

// Route to fetch all skilled labours
router.get("/list", fetchSkilledLabours);
router.get("/getmyskilllabour", verifyUser, fetchAddedSkillLAbours);
router.get("/AdminLabour", fetchAdminSkill);
router.delete("/delete/:id", deleteSkillLabour);
router.post("/skilllogin", SkillLogin);
router.post("/updateskill", updateSkilledDetails);
router.get("/getskilled", verifySkilledToken, getSkilled);
router.put("/update/:id", UpdateSkillAdmin);
router.put("/markasdone/:id", callDone);

module.exports = router;
