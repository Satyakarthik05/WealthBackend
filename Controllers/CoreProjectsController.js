const CoreProjects = require("../Models/CoreProjectsModel");
const ValueProjects = require("../Models/ValueProjects");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: "AKIAWX2IFPZYF2O4O3FG",
  secretAccessKey: "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",
  region: "us-east-1",
});

const uploadToS3 = async (file, folderName) => {
  const fileName = `${folderName}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME || "wealthpropertyimages",
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();
  
  // Convert S3 URL to CloudFront URL
  const cloudFrontDomain = "d2xj2qzllg3mnf.cloudfront.net";
  const s3Url = new URL(result.Location);
  const cloudFrontUrl = `https://${cloudFrontDomain}/${s3Url.pathname.split('/').slice(2).join('/')}`;
  
  return cloudFrontUrl;
};

const createCoreProjects = async (req, res) => {
  try {
    const { companyName, officeAddress, city, website, mobile } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Photo is required." });
    }

    // Upload to S3 with 'core-projects' folder and get CloudFront URL
    const photoUrl = await uploadToS3(req.file, "core-projects");

    const newProject = new CoreProjects({
      companyName,
      officeAddress,
      city,
      website,
      mobile,
      photo: photoUrl,
      newImageUrl: photoUrl,
    });

    await newProject.save();

    res.status(200).json({
      message: "Core project added successfully",
      newProject,
    });
  } catch (error) {
    console.error("Error in createCoreProjects:", error);
    res.status(500).json({
      message: "Error adding core project",
      error: error.message,
    });
  }
};

const GetAllcoreProjects = async (req, res) => {
  try {
    const properties = await CoreProjects.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const createValueProjects = async (req, res) => {
  try {
    const { companyName, officeAddress, city, website, mobile } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Photo is required." });
    }

    // Upload to S3 with 'value-projects' folder and get CloudFront URL
    const photoUrl = await uploadToS3(req.file, "value-projects");

    const newProject = new ValueProjects({
      companyName,
      officeAddress,
      city,
      website,
      mobile,
      photo: photoUrl,
      newImageUrl: photoUrl,
    });

    await newProject.save();

    res.status(200).json({
      message: "Value project added successfully",
      newProject,
    });
  } catch (error) {
    console.error("Error in createValueProjects:", error);
    res.status(500).json({
      message: "Error adding value project",
      error: error.message,
    });
  }
};

const GetAllValueProjects = async (req, res) => {
  try {
    const properties = await ValueProjects.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

module.exports = {
  createCoreProjects,
  GetAllcoreProjects,
  createValueProjects,
  GetAllValueProjects,
};