const express = require("express");
const buyController = require("../Controllers/BuyProperty");

const app = express.Router();

app.post("/buyproperty", buyController.BuyPropertys);

module.exports = app;
