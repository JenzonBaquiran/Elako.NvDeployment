const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  availability: {
    type: Boolean,
    required: true,
    default: true
  },
  visible: {
    type: Boolean,
    required: true,
    default: true
  },
  stocks: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  picture: {
    type: String,
    required: false,
    default: null
  },
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Additional useful fields
  msmeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MSME',
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ productName: 'text', description: 'text', hashtags: 'text' });
productSchema.index({ msmeId: 1 });
productSchema.index({ availability: 1 });
productSchema.index({ visible: 1 });
productSchema.index({ hashtags: 1 });

// Virtual for product URL
productSchema.virtual('imageUrl').get(function() {
  return this.picture ? `/uploads/${this.picture}` : null;
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.availability && this.stocks > 0;
};

// Method to update stock quantity
productSchema.methods.updateStock = function(quantity) {
  this.stocks = Math.max(0, this.stocks + quantity);
  if (this.stocks === 0) {
    this.availability = false;
  }
  return this.save();
};

// Method to add hashtags
productSchema.methods.addHashtags = function(newHashtags) {
  const currentHashtags = this.hashtags || [];
  const uniqueHashtags = [...new Set([...currentHashtags, ...newHashtags])];
  this.hashtags = uniqueHashtags;
  return this.save();
};

// Method to toggle visibility
productSchema.methods.toggleVisibility = function() {
  this.visible = !this.visible;
  return this.save();
};

// Pre-save middleware to update the updatedAt field
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find products by hashtag
productSchema.statics.findByHashtag = function(hashtag) {
  return this.find({ hashtags: { $in: [hashtag.toLowerCase()] } });
};

// Static method to find available products
productSchema.statics.findAvailable = function() {
  return this.find({ availability: true, stocks: { $gt: 0 } });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;