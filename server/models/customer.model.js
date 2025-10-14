const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    middlename: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    bio: { type: String, default: "" },
    password: { type: String, required: true },
    userType: { type: String, default: "customer" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "MSME" }],
    termsAcceptedAt: { type: Date, default: Date.now }, // When terms were accepted during signup
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "customers" }
);

module.exports = mongoose.model("Customer", CustomerSchema);
