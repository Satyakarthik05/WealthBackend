const {
  District,
  Constituency,
  Expertise,
  Occupation,
  PropertyType,
  Skills,
} = require("../Models/Districts");

// Generic function to add data to a collection
const addData = async (Model, req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const newData = new Model({ name, code });
    await newData.save();
    res.status(201).json({ message: "Data added successfully", data: newData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding data", error: error.message });
  }
};

const getData = async (Model, res, label) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching ${label}`, error: error.message });
  }
};

module.exports = {
  addDistrict: (req, res) => addData(District, req, res),
  addConstituency: (req, res) => addData(Constituency, req, res),
  addExpertise: (req, res) => addData(Expertise, req, res),
  addOccupation: (req, res) => addData(Occupation, req, res),
  addPropertyType: (req, res) => addData(PropertyType, req, res),
  addSkill: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const newSkill = new Skills({ name });
      await newSkill.save();
      res
        .status(201)
        .json({ message: "Skill added successfully", data: newSkill });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding skill", error: error.message });
    }
  },
  district: (req, res) => getData(District, res, "districts"),
  constituency: (req, res) => getData(Constituency, res, "constituencies"),
  Expertis: (req, res) => getData(Expertise, res, "expertise"),
  Occupations: (req, res) => getData(Occupation, res, "occupations"),
  PropertyTypes: (req, res) => getData(PropertyType, res, "property types"),
  Skillss: async (req, res) => {
    try {
      const skills = await Skills.find();
      res.json({ skills: skills.map((skill) => skill.name) });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching skills", error: error.message });
    }
  },
};
