const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      "SUCCESS STORIES",
      "BUSINESS GROWTH",
      "FEATURED STORES",
      "ART & CULTURE",
      "DIGITAL MARKETING",
      "ENTREPRENEURSHIP",
      "TECHNOLOGY",
      "INNOVATION",
    ],
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
  author: {
    type: String,
    required: true,
    trim: true,
  },
  readTime: {
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
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
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
blogPostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one featured post at a time
blogPostSchema.pre("save", async function (next) {
  if (this.featured && this.isModified("featured")) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { featured: false }
    );
  }
  next();
});

// Static method to increment views
blogPostSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("BlogPost", blogPostSchema);
