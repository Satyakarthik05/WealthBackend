const express = require("express");
const ReqExp = require("../Controllers/ExpReqController");

const app = express.Router();

app.post("/direqexp", ReqExp.RequestExpert);
app.get("/all", ReqExp.getAllRequestedExperts);
app.put("/resolve/:id", ReqExp.resolvedRequest);

module.exports = app;
