const mongoose = require("mongoose");

const customerBadgeSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    badgeType: {
      type: String,
      enum: ["top_fan", "suki"],
      default: "suki",
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
      ratingsGiven: {
        current: { type: Number, default: 0 },
        required: { type: Number, default: 3 }, // Lowered from 5
        met: { type: Boolean, default: false },
      },
      blogEngagement: {
        current: { type: Number, default: 0 },
        required: { type: Number, default: 3 }, // Lowered from 5
        met: { type: Boolean, default: false },
      },
    },
    loyaltyStore: {
      storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MSME",
        default: null,
      },
      storeName: {
        type: String,
        default: "",
      },
      interactionCount: {
        type: Number,
        default: 0,
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
customerBadgeSchema.index({ customerId: 1, weekStart: 1, weekEnd: 1 });
customerBadgeSchema.index({ isActive: 1, expiresAt: 1 });

// Method to check if all criteria are met
customerBadgeSchema.methods.checkCriteria = function () {
  const allMet =
    this.criteria.ratingsGiven.met && this.criteria.blogEngagement.met;

  if (allMet && !this.isActive) {
    this.isActive = true;
    this.awardedAt = new Date();
  }

  return allMet;
};

// Method to check if badge is expired
customerBadgeSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Static method to get active badge for a customer
customerBadgeSchema.statics.getActiveBadge = function (customerId) {
  return this.findOne({
    customerId: customerId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to create new weekly badge
customerBadgeSchema.statics.createWeeklyBadge = function (customerId) {
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
    customerId,
    weekStart,
    weekEnd,
    expiresAt,
  });
};

module.exports = mongoose.model("CustomerBadge", customerBadgeSchema);
