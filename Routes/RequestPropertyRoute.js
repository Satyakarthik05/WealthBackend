const express = require("express");
const RequestProperty = require("../Controllers/RequestProperty");
const verifyAgentToken = require("../middleWares/VerifyAgentToken");
const verifyUser = require("../middleWares/VerifyUser");

const app = express.Router();

app.post("/requestProperty", RequestProperty.PropertyRequest);
app.get("/getallrequestProperty", RequestProperty.GetRequsestedPropertys);
app.get(
  "/myrequestedPropertys",
  verifyUser,
  RequestProperty.GetMyRequestedPropertys
);
app.delete("/delete/:id", RequestProperty.DeleteRequestedProperty);
app.put("/approve/:id", RequestProperty.approveRequestProperty);

// New route for updating a requested property
app.put(
  "/updateProperty/:id",
  verifyUser,
  RequestProperty.UpdateRequestedProperty
);
app.put(
  "/adminupdateProperty/:id",
  RequestProperty.AdminUpdateRequestedProperty
);

module.exports = app;
