const express = require("express");
const multer = require("multer");
const CoreClientController = require("../Controllers/CoreProjectsController");

const router = express.Router();

// 📁 Multer storage for Core Projects
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/image\/(jpeg|jpg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// ✅ Core Projects Routes
router.post(
  "/addCoreProjects",
  upload.single("photo"),
  CoreClientController.createCoreProjects
);
router.get("/getallcoreprojects", CoreClientController.GetAllcoreProjects);

// ✅ Value Projects Routes
router.post(
  "/addValueProjects",
  upload.single("photo"),
  CoreClientController.createValueProjects
);
router.get("/getallValueprojects", CoreClientController.GetAllValueProjects);

module.exports = router;
