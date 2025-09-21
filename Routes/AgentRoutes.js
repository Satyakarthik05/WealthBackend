const express = require("express");
const AgentController = require("../Controllers/AgentController");
const verifyAgentToken = require("../middleWares/VerifyAgentToken");
const ForgetPassword = require("../Controllers/ForgetPasswordController");
const multer = require("multer");
const app = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/image\/(jpeg|jpg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

app.post("/AgentRegister", upload.single("photo"), AgentController.AgentSign);
app.post("/AgentLogin", AgentController.AgentLogin);
app.get("/AgentDetails", verifyAgentToken, AgentController.getAgent);
app.post("/valueagents", AgentController.getvalueAgent);
app.post("/updateAgentDetails", AgentController.updateAgentDetails);
app.get("/myAgents", verifyAgentToken, AgentController.fetchReferredAgents);
app.post("/ForgetPassword", ForgetPassword.ForgetPassword);
app.post("/VerifyOtp", ForgetPassword.VerifyOtp);
app.post("/updatepassword", ForgetPassword.resetPassword);
app.get("/allagents", AgentController.getAllAgents);
app.delete("/deleteagent/:id", AgentController.deleteAgent);
app.put(
  "/updateagent/:id",
  upload.single("photo"),
  AgentController.updateAgentByadmin
);
app.put("/markasdone/:id", AgentController.callDone);
app.put(
  "/updateProfileImage",
  upload.single("photo"),
  AgentController.updateProfileImage
);
app.delete("/deleteProfileImage", AgentController.deleteProfileImage);
app.post("/assign/:agentId",AgentController.callassign)
app.get("/assigned/:id",AgentController.getAssignedAgents)
app.get("/assignedcus/:id",AgentController.getAssignedCustomers)
app.get("/assignedskill/:id",AgentController.getAssignedskilled)
app.get("/assignedinves/:id",AgentController.getAssignedinvestor)
app.get("/assignedproperties/:id",AgentController.getPropertiesWithExecutiveFirst)
module.exports = app;
