const express = require('express');
const router = express.Router();
const supplierController = require('../Controllers/SuppliersVeendorsController');
const multer = require("multer"); // Multer middleware for file uploads




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Suppliers");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
});


router.post('/addsupplier', upload.single("logo"), supplierController.addSupplier);
router.post('/getsuppliers', supplierController.getSuppliers);

module.exports = router;