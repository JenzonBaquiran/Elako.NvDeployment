const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema({
  msmeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MSME',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: null
  },
  storeLogo: {
    type: String,
    default: null
  },
  contactNumber: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
dashboardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find public dashboards
dashboardSchema.statics.findPublic = function() {
  return this.find({ isPublic: true }).populate('msmeId', 'businessName username');
};

// Static method to find dashboard by MSME ID
dashboardSchema.statics.findByMsmeId = function(msmeId) {
  return this.findOne({ msmeId }).populate('msmeId', 'businessName username');
};

module.exports = mongoose.model("Dashboard", dashboardSchema);
