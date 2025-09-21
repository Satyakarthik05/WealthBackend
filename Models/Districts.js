const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
  name: String,
  code: String,
});

const District = mongoose.model("District", districtSchema);

const ConstituencySchema = new mongoose.Schema({
  name: String,
  code: String,
});

const Constituency = mongoose.model("Constituencys", ConstituencySchema);

const ExpertiseSchema = new mongoose.Schema({
  name: String,
  code: String,
});

const Expertise = mongoose.model("Expertises", ExpertiseSchema);

const OccupationSchema = new mongoose.Schema({
  name: String,
  code: String,
});

const Occupation = mongoose.model("Occupatiopons", OccupationSchema);

const PropertyTypeSchema = new mongoose.Schema({
  name: String,
  code: String,
});

const PropertyType = mongoose.model("PropertyTypes", PropertyTypeSchema);

// const insertDataIfEmpty = async () => {
//   try {
//     const count = await District.countDocuments();
//     if (count === 0) {
//       await District.insertMany(initialDistricts);
//       console.log("Districts added to DB");
//     } else {
//       console.log("Districts already exist in DB");
//     }
//   } catch (error) {
//     console.error("Error inserting districts:", error);
//   }
// };

// const skillSchema = new mongoose.Schema({ name: String });
// // const Skills = mongoose.model("Skill", skillSchema);
// const Skils = mongoose.model("SKills", skillSchema);

const skillSchema = new mongoose.Schema({ name: String });
const Skills = mongoose.model("Skills", skillSchema);

module.exports = {
  District,
  Constituency,
  Expertise,
  Occupation,
  PropertyType,
  Skills,
};
