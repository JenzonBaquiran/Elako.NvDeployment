const mongoose = require("mongoose");

const storeBadgeSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MSME",
      required: true,
    },
    badgeType: {
      type: String,
      enum: ["top_store"],
      default: "top_store",
    },
    weekStart: {
      type: Date,
      required: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    criteria: {
      storeRating: {
        current: { type: Number, default: 0 },
        required: { type: Number, default: 4.5 },
        met: { type: Boolean, default: false },
      },
      productRatings: {
        current: { type: Number, default: 0 },
        required: { type: Number, default: 4.5 },
        met: { type: Boolean, default: false },
      },
      profileViews: {
        current: { type: Number, default: 0 },
        required: { type: Number, default: 200 },
        met: { type: Boolean, default: false },
      },
      blogViews: {
        current: { type: Number, default: 0 },
        required: { type: Number, default: 100 },
        met: { type: Boolean, default: false },
      },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    awardedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    celebrationShown: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
storeBadgeSchema.index({ storeId: 1, weekStart: 1, weekEnd: 1 });
storeBadgeSchema.index({ isActive: 1, expiresAt: 1 });

// Method to check if all criteria are met
storeBadgeSchema.methods.checkCriteria = function () {
  const allMet =
    this.criteria.storeRating.met &&
    this.criteria.productRatings.met &&
    this.criteria.profileViews.met &&
    this.criteria.blogViews.met;

  if (allMet && !this.isActive) {
    this.isActive = true;
    this.awardedAt = new Date();
  }

  return allMet;
};

// Method to check if badge is expired
storeBadgeSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Static method to get active badge for a store
storeBadgeSchema.statics.getActiveBadge = function (storeId) {
  return this.findOne({
    storeId: storeId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to create new weekly badge
storeBadgeSchema.statics.createWeeklyBadge = function (storeId) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of current week

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const expiresAt = new Date(weekEnd);
  expiresAt.setDate(expiresAt.getDate() + 7); // Badge expires after 1 week

  return this.create({
    storeId,
    weekStart,
    weekEnd,
    expiresAt,
  });
};

module.exports = mongoose.model("StoreBadge", storeBadgeSchema);
