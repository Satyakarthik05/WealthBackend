const BuyProperty = require("../Models/BuyProperty");

const BuyPropertys = async (req, res) => {
  const { propertyType, location, price, PostedBy, WantedBy, WantedUserType } =
    req.body;

  try {
    const buy = new BuyProperty({
      propertyType,
      location,
      price,
      PostedBy,
      WantedBy,
      WantedUserType,
    });
    await buy.save();
    if (buy) {
      res.status(200).json({ message: "Buyed Property Successfully" });
    } else {
      res.status(400).json({ message: "Error while buying Property" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { BuyPropertys };
