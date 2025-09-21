const express = require("express");
const DistrictData = require("../Controllers/DisConsExpert");
const app = express.Router();

app.get("/districts", DistrictData.district);
app.get("/constituencys", DistrictData.constituency);
app.get("/expertise", DistrictData.Expertis);
app.get("/occupations", DistrictData.Occupations);
app.get("/propertytype", DistrictData.PropertyTypes);
app.get("/skills", DistrictData.Skillss);

app.post("/adddistrict", DistrictData.addDistrict);
app.post("/addconstituency", DistrictData.addConstituency);
app.post("/addexpertise", DistrictData.addExpertise);
app.post("/addoccupation", DistrictData.addOccupation);
app.post("/addproperty-type", DistrictData.addPropertyType);
app.post("/addskill", DistrictData.addSkill);

module.exports = app;
