const CoreClient = require("../Models/CoreClientsModel");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: "AKIAWX2IFPZYF2O4O3FG",
  secretAccessKey: "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",
  region: "us-east-1",
});

// Helper function to upload to S3 and return CloudFront URL
const uploadToS3 = async (file) => {
  const fileName = `core-clients/${Date.now()}-${file.originalname}`;

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

const createCoreClient = async (req, res) => {
  try {
    const { companyName, officeAddress, city, website, mobile } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Photo is required." });
    }

    // Upload the file to S3 and get CloudFront URL
    const photoUrl = await uploadToS3(req.file);

    const newClient = new CoreClient({
      companyName,
      officeAddress,
      city,
      website,
      mobile,
      photo: photoUrl, // Storing CloudFront URL
      newImageUrl: photoUrl, // Additional field with CloudFront URL
    });

    await newClient.save();

    res.status(200).json({
      message: "Client added successfully",
      newClient,
    });
  } catch (error) {
    console.error("Error in createCoreClient:", error);
    res.status(500).json({
      message: "Error adding client",
      error: error.message,
    });
  }
};

const GetAllcoreClients = async (req, res) => {
  try {
    const properties = await CoreClient.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

module.exports = { createCoreClient, GetAllcoreClients };