const mongoose = require("mongoose");

const msmeBlogPostSchema = new mongoose.Schema({
  msmeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MSME",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    required: true,
    enum: ["image", "video", "youtube"],
    default: "image",
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "STORE UPDATE",
      "NEW PRODUCTS",
      "BEHIND THE SCENES",
      "CUSTOMER STORIES",
      "BUSINESS JOURNEY",
      "PROMOTIONS",
      "EVENTS",
      "TUTORIALS",
    ],
    default: "STORE UPDATE",
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published",
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
msmeBlogPostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find published posts for a specific MSME
msmeBlogPostSchema.statics.findPublishedByMsme = function (msmeId) {
  return this.find({ msmeId, status: "published" })
    .sort({ featured: -1, createdAt: -1 })
    .populate("msmeId", "businessName username");
};

// Static method to increment views
msmeBlogPostSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("MsmeBlogPost", msmeBlogPostSchema);
