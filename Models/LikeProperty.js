const mongoose = require("mongoose");

const LikedpropertySchema = new mongoose.Schema(
 {
     propertyType: { type: String, required: true },
     location: { type: String, required: true },
     price: { type: String, required: true },
     photo: {
       type: mongoose.Schema.Types.Mixed,
       required: true,
       validate: {
         validator: function(value) {
           // If it's an array, validate length
           if (Array.isArray(value)) {
             return value.length > 0 && value.length <= 6;
           }
           // If it's a string, just check it's not empty
           else if (typeof value === 'string') {
             return value.trim().length > 0;
           }
           return false;
         },
         message: "Must have between 1 and 6 photos (or a single photo string)"
       }
     },
     PostedBy: { type: String, required: true },
     fullName: { type: String },
     mobile: { type: String },
     propertyDetails: { type: String },
    MobileNumber:{type:String},
    fullName:{type:String},
    like:{type:String},
     PostedUserType: { type: String },
     editedAt: { type: Date },
     CallExecutiveCall: {
      type: String,
      enum: ["Pending", "Done"], // Add this to enforce specific values
      default: "Pending",
    },
     
     // New field to store dynamic data
     dynamicData: {
       type: mongoose.Schema.Types.Mixed,
       default: {},
     },
   },
   {
     timestamps: true,
     strict: false, 
   }
 );


const LikedProperty = mongoose.model(
  "LikedPropertys",
  LikedpropertySchema
);

module.exports = LikedProperty;
