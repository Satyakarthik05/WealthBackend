const express = require("express");
const multer = require("multer");
// const PostPropertyController = require("../Controllers/PostProperty");
const CoreClientController = require("../Controllers/CoreClientsController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/image\/(jpeg|jpg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

router.post(
  "/addCoreClient",
  upload.single("photo"),
  CoreClientController.createCoreClient
);
router.get("/getallcoreclients", CoreClientController.GetAllcoreClients);
module.exports = router;
