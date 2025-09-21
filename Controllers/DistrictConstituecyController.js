const mongoose = require("mongoose");
const Constituency = require("../Models/DistrictsConstituencysModel");

const addDistrict = async (req, res) => {
  const { parliament, parliamentCode, assemblies } = req.body;

  // Validation
  if (
    !parliament ||
    !parliamentCode ||
    !Array.isArray(assemblies) ||
    assemblies.length !== 7
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid data. Must include parliament, code, and exactly 7 assemblies.",
      });
  }

  try {
    const newDistrict = new Constituency({
      parliament,
      parliamentCode,
      assemblies,
    });
    await newDistrict.save();
    res
      .status(201)
      .json({ message: "District added successfully", district: newDistrict });
  } catch (error) {
    res.status(500).json({ message: "Error adding district", error });
  }
};

const getConstDistrict = async (req, res) => {
  try {
    const data = await Constituency.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getConstDistrict, addDistrict };
