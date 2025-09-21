const express = require("express");
const NotificationController = require("../Controllers/NoficationsController");

const app = express.Router();

app.post("/register-token", NotificationController.registerToken);

module.exports = app;
