const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    availability: {
      type: Boolean,
      required: true,
      default: true,
    },
    visible: {
      type: Boolean,
      required: true,
      default: true,
    },

    picture: {
      type: String,
      required: false,
      default: null,
    },
    // Multiple images support
    pictures: [
      {
        type: String,
        required: false,
      },
    ],
    // Variants for food products (spicy, cheese, etc.)
    variants: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        imageIndex: { type: Number, default: 0 }, // Which image to show for this variant
      },
    ],
    // Size options for beverages
    sizeOptions: [
      {
        id: { type: String, required: true },
        size: { type: Number, required: true },
        unit: {
          type: String,
          required: true,
          enum: ["ml", "L", "g", "kg", "oz", "lb"],
        },
      },
    ],
    hashtags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Additional useful fields
    msmeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MSME",
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    // Artist name for artworks/paintings
    artistName: {
      type: String,
      trim: true,
      maxlength: 100,
      required: false,
    },
    // Customer feedback and rating
    feedback: [
      {
        user: { type: String, required: true },
        userId: { type: String, required: false }, // Store customer ID for reference
        comment: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        selectedVariant: {
          type: {
            id: String,
            name: String,
          },
          required: false,
        }, // Store selected variant for this review
        selectedSize: {
          type: {
            id: String,
            size: Number,
            unit: String,
          },
          required: false,
        }, // Store selected size for this review
        createdAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Ensure feedback and rating are always present
productSchema.pre("validate", function (next) {
  if (!Array.isArray(this.feedback)) {
    this.feedback = [];
  }
  if (typeof this.rating === "undefined") {
    this.rating = null;
  }
  next();
});

// Index for better search performance
productSchema.index({
  productName: "text",
  description: "text",
  hashtags: "text",
  artistName: "text",
});
productSchema.index({ msmeId: 1 });
productSchema.index({ availability: 1 });
productSchema.index({ visible: 1 });
productSchema.index({ hashtags: 1 });

// Virtual for product URL (backward compatibility)
productSchema.virtual("imageUrl").get(function () {
  // Prioritize new pictures array, fallback to single picture
  if (this.pictures && this.pictures.length > 0) {
    return `/uploads/${this.pictures[0]}`;
  }
  return this.picture ? `/uploads/${this.picture}` : null;
});

// Virtual for all image URLs
productSchema.virtual("imageUrls").get(function () {
  const urls = [];

  // Add images from pictures array
  if (this.pictures && this.pictures.length > 0) {
    this.pictures.forEach((pic) => {
      if (pic) urls.push(`/uploads/${pic}`);
    });
  }

  // Fallback to single picture if no pictures array
  if (urls.length === 0 && this.picture) {
    urls.push(`/uploads/${this.picture}`);
  }

  return urls;
});

// Method to check if product is available
productSchema.methods.isAvailable = function () {
  return this.availability;
};

// Method to add hashtags
productSchema.methods.addHashtags = function (newHashtags) {
  const currentHashtags = this.hashtags || [];
  const uniqueHashtags = [...new Set([...currentHashtags, ...newHashtags])];
  this.hashtags = uniqueHashtags;
  return this.save();
};

// Method to toggle visibility
productSchema.methods.toggleVisibility = function () {
  this.visible = !this.visible;
  return this.save();
};

// Pre-save middleware to update the updatedAt field
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find products by hashtag
productSchema.statics.findByHashtag = function (hashtag) {
  return this.find({ hashtags: { $in: [hashtag.toLowerCase()] } });
};

// Static method to find available products
productSchema.statics.findAvailable = function () {
  return this.find({ availability: true });
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
