const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "super-admin"],
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive", "suspended"],
  },
  createdBy: {
    type: String, // Admin ID who created this admin
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Admin", adminSchema);