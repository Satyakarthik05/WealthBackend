const Agents = require("../Models/AgentModel");
const Customers = require("../Models/Customer");
const Properties = require("../Models/Property");
const Experts = require("../Models/ExpertModel");
const skilledLabours = require("../Models/SkillModel");
const Investors =require("../Models/InvestorModel")
const express = require("express");
const ApprovedPropertys=require("../Models/ApprovedPropertys")
const app = express.Router();

app.get("/total-agents", async (req, res) => {
  try {
    const count = await Agents.countDocuments();
    res.json({ totalAgents: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent count" });
  }
});

app.get("/total-customers", async (req, res) => {
  try {
    const count = await Customers.countDocuments();
    res.json({ totalAgents: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent count" });
  }
});
app.get("/total-properties", async (req, res) => {
  try {
    const count = await Properties.countDocuments();
    res.json({ totalAgents: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent count" });
  }
});
app.get("/total-approvedproperties", async (req, res) => {
  try {
    const count = await ApprovedPropertys.countDocuments();
    res.json({ totalAgents: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent count" });
  }
});
app.get("/total-experts", async (req, res) => {
  try {
    const count = await Experts.countDocuments();
    res.json({ totalAgents: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent count" });
  }
});
app.get("/total-skilledlabours", async (req, res) => {
  try {
    const count = await skilledLabours.countDocuments();
    res.json({ totalAgents: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent count" });
  }
});
app.get("/total-Investors", async (req, res) => {
  try {
    const count = await Investors.countDocuments();
    res.json({ totalAgents: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent count" });
  }
});

module.exports = app;
