const express = require("express");
const ExpertController = require("../Controllers/ExpertController");
const multer = require("multer");
const app = express.Router();

const storage = multer.memoryStorage(); 

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
});

app.post("/registerExpert", upload.single("photo"), ExpertController.registerExpert);
app.get("/getexpert/:expertType", ExpertController.getExpertsByType);
app.get("/getallexpert", ExpertController.getAllExperts);
app.put("/update/:id", ExpertController.modifyExpert);
app.delete("/delete/:id", ExpertController.deleteExpert);
app.put("/markasdone/:id", ExpertController.callDone);

module.exports = app;
