const express = require("express");
const ConstituencyController = require("../Controllers/DistrictConstituecyController");

const app = express.Router();

app.get("/alldiscons", ConstituencyController.getConstDistrict);
app.post("/addDistrict", ConstituencyController.addDistrict);

module.exports = app;
