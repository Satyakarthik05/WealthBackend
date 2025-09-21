const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  // Common fields
  name: { type: String, required: true },
  expertType: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: String, required: true },
  location: { type: String, required: true },
  mobile: { type: String, required: true },
  photo: { type: String, required: true },
  officeAddress:{type:String,requird:true},
  CallExecutiveCall: {
    type: String,
    enum: ["Pending", "Done"],
    default: "Pending",
  },
   status: {
      type: String,
    },
    assignedExecutive: {
      type: String,
    },
    CallExecutivename: {
      type: String,
    },
    newurl:{
      type: String,
    },
  
  specialization: String,
  barCouncilId: String,
  courtAffiliation: String,
  lawFirmOrganisation: String,
  
  // Revenue Expert fields
  landTypeExpertise: String,
  revenueSpecialisation: String,
  govtApproval: String,
  certificationLicenseNumber: String,
  revenueOrganisation: String,
  keyServicesProvided: String,
  
  // Engineers fields
  engineeringField: String,
  certifications: String,
  projectsHandled: String,
  engineerOrganisation: String,
  specializedSkillsTechnologies: String,
  majorProjectsWorkedOn: String,
  govtLicensed: String,
  
  // Architects fields
  architectureType: String,
  softwareUsed: String,
  architectLicenseNumber: String,
  architectFirm: String,
  architectMajorProjects: String,
  
  // Survey fields
  surveyType: String,
  govtCertified: String,
  surveyOrganisation: String,
  surveyLicenseNumber: String,
  surveyMajorProjects: String,
  
  // Vaastu Pandits fields
  vaastuSpecialization: String,
  vaastuOrganisation: String,
  vaastuCertifications: String,
  remediesProvided: String,
  consultationMode: String,
  
  // Land Valuers fields
  valuationType: String,
  govtApproved: String,
  valuerLicenseNumber: String,
  valuerOrganisation: String,
  valuationMethods: String,
  
  // Banking fields
  bankingSpecialisation: String,
  bankingService: String,
  registeredWith: String,
  bankName: String,
  bankingGovtApproved: String,
  
  // Agriculture fields
  agricultureType: String,
  agricultureCertifications: String,
  agricultureOrganisation: String,
  servicesProvided: String,
  typesOfCrops: String,
  
  registrationSpecialisation: String,
  documentType: String,
  processingTime: String,
  registrationGovtCertified: String,
  additionalServices: String,
  
  // Auditing fields
  auditingSpecialisation: String,
  auditType: String,
  auditCertificationNumber: String,
  auditOrganisation: String,
  auditServices: String,
  auditGovtCertified: String,
  
  // Licensing fields
  licensingSpecialisations: String,
  licensingCertificationNumber: String,
  licensingOrganisation: String,
  licensingServicesProvided: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field before saving
expertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Expert = mongoose.model("expertpanel", expertSchema);

module.exports = Expert;