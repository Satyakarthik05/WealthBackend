const express = require("express");
const CoreController = require("../Controllers/CoreController");
const verifyCoreToken = require("../middleWares/VerifyCoreToken");

const app = express.Router();

app.post("/CoreRegister", CoreController.CoreSign);
app.get("/getcore", verifyCoreToken, CoreController.getCore);
app.get("/getallcoremembers", CoreController.getAllCoreMembers);
app.post("/coreLogin", CoreController.coreLogin);
app.get("/myagents", verifyCoreToken, CoreController.fetchReferredAgents);
app.get("/mycustomers", verifyCoreToken, CoreController.fetchReferredCustomers);
app.post("/updateCoreDetails", CoreController.updateCoreDetails);
app.delete("/deletecore/:id", CoreController.deleteCore);
app.put("/updatecore/:id", CoreController.updateCoreByadmin);

module.exports = app;
