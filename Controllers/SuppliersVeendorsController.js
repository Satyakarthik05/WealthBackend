const Supplier = require('../Models/SuppliersVendors');
const fs = require('fs');
const path = require('path');
// const { uploadFile } = require('../utils/fileUpload'); 

// Add new supplier
const addSupplier = async (req, res) => {
  try {
    const { companyName, ownerName, phone, category, location, exactLocation,subcategory } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: "logo is required." });
    }
  
    const photoPath = `/Suppliers/${req.file.filename}`;
  

    const supplier = new Supplier({
      companyName,
      ownerName,
      phone,
      category,
      location,
      exactLocation,
      subcategory,
      logo: photoPath
    });

    await supplier.save();

    res.status(200).json({
      success: true,
      data: supplier,
      message: 'Supplier added successfully'
    });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add supplier',
      error: error.message
    });
  }
};

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const { category } = req.body;
    
        if (!category) {
          return res.status(400).json({ error: "Category is required" });
        }
    
        const suppliers = await Supplier.find({ category });
    
        res.json(suppliers);
      } catch (error) {
        console.error("Error fetching suppliers:", error.message);
        res.status(500).json({ error: "Internal server error" });
      }
    };

module.exports={addSupplier,getSuppliers}

// Other CRUD operations (update, delete) can be added similarly