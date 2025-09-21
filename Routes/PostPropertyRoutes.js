const express = require("express");
const multer = require("multer");
const PostPropertyController = require("../Controllers/PostProperty");
const verifyAgentToken = require("../middleWares/VerifyAgentToken");
const CustomerToken = require("../middleWares/VerifyCustomerToken");
const CoreToken = require("../middleWares/VerifyCoreToken");
const verifyUser = require("../middleWares/VerifyUser");
const CoreClients = require("../Controllers/CoreClientsController");
const ApprovedProperty = require("../Controllers/ApprovedProprerty");

const router = express.Router();

// Configure multer for file uploads
const AWS = require("aws-sdk");

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: "AKIAWX2IFPZYF2O4O3FG",
  secretAccessKey: "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",
  region: "us-east-1",
});


// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 6, // Maximum 6 files
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpeg|jpg|png|gif)$/)) {
      return cb(
        new Error("Only image files (jpeg, jpg, png, gif) are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

// Upload file to S3 helper function - matches your migration pattern
const uploadToS3 = async (file) => {
  const fileName = `Approved_Properties/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME || "wealthpropertyimages",
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

// ✅ Add Property with Multiple Photos (direct to S3)
router.post(
  "/addProperty",
  upload.any(),
  PostPropertyController.createProperty
);

router.post(
  "/addcoreclient",
  upload.single("photo"),
  CoreClients.createCoreClient
);

router.get("/getallPropertys", PostPropertyController.GetAllPropertys);
router.get("/getreqreff/:PostedBy", PostPropertyController.getReferrerDetails);

router.get("/getAdminProperties", PostPropertyController.AdminProperties);

router.delete("/delete/:id", PostPropertyController.deletProperty);
router.delete("/approvedelete/:id", ApprovedProperty.deletProperty);

router.get(
  "/getMyPropertys",
  verifyUser,
  PostPropertyController.GetMyPropertys
);
router.put(
  "/editProperty/:id",
  upload.single("photo"),
  PostPropertyController.editProperty
);
router.put("/update/:id", PostPropertyController.updatePropertyAdmin);
router.put("/approveupdate/:id", ApprovedProperty.updatePropertyAdmin);
router.get("/getApproveProperty", ApprovedProperty.GetAllApprovdPropertys);
router.post("/getlikedproperties", ApprovedProperty.GetlikedPropertys);
router.get("/getalllikedproperties", ApprovedProperty.GetAlllikedPropertys);
router.put("/callDone/:id", ApprovedProperty.callDoneforliked);
router.delete("/likeddelete/:id", ApprovedProperty.LikedDelete);
router.get("/getsoldProperty", ApprovedProperty.GetAllSoldedPropertys);
router.post("/approve/:id", ApprovedProperty.approveProperty);
router.post("/like", ApprovedProperty.LikeProperty);
router.post("/sold/:id", ApprovedProperty.SoldProperty);
router.get("/nearby/:constituency", PostPropertyController.getNearbyProperties);
router.post(
  "/get-referral-data",
  PostPropertyController.getReferralAndPostedData
);
router.post(
  "/getPropertyreffered",
  PostPropertyController.getReferredByDetails
);
// updateDynamicData;
router.patch("/:id/dynamic", PostPropertyController.updateDynamicData);

module.exports = router;
