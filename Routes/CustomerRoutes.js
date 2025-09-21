const express = require("express");
const CustomerController = require("../Controllers/CustomerControlller");
const verifyAgentToken = require("../middleWares/VerifyAgentToken");
const verifCustomerToken = require("../middleWares/VerifyCustomerToken");
const verifyUser = require("../middleWares/VerifyUser");
// const ForgetPassword = require("../Controllers/ForgetPasswordController");

const app = express.Router();

app.post("/CustomerRegister", CustomerController.CustomerSign);
// app.post("/AgentLogin", AgentController.AgentLogin);
app.get("/getcustomer", verifCustomerToken, CustomerController.getCustomer);
app.get(
  "/myCustomers",
  verifyAgentToken,
  CustomerController.fetchReferredCustomers
);
app.get(
  "/mycusCustomers",
  verifCustomerToken,
  CustomerController.fetchReferredcusCustomers
);
app.post("/updateCustomerDetails", CustomerController.updateCustomerDetails);
app.get("/allcustomers", CustomerController.getAllCustomers);
app.delete("/deletecustomer/:id", CustomerController.deleteCustomer);

app.post("/CustomerLogin", CustomerController.customerLogin);
app.get(
  "/getmycustomer",
  verifyUser,
  CustomerController.getMyInvestorCustomers
);
app.put("/updatecustomer/:id", CustomerController.updatecustomerAdmin);
app.put("/markasdone/:id", CustomerController.callDone);

module.exports = app;
