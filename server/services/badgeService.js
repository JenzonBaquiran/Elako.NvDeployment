const StoreBadge = require("../models/storeBadge.model");
const CustomerBadge = require("../models/customerBadge.model");
const CustomerNotification = require("../models/customerNotification.model");
const MSME = require("../models/msme.model");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");
const MSMEBlogPost = require("../models/msmeBlogPost.model");
const PageView = require("../models/pageview.model");

class BadgeService {
  // Store Badge Calculation Methods
  async calculateStoreBadge(storeId) {
    try {
      // Get or create current week's badge
      let badge = await StoreBadge.findOne({
        storeId: storeId,
        weekStart: { $lte: new Date() },
        weekEnd: { $gte: new Date() },
      });

      if (!badge) {
        badge = await StoreBadge.createWeeklyBadge(storeId);
      }

      // Calculate store rating
      const store = await MSME.findById(storeId);
      if (store && store.averageRating) {
        badge.criteria.storeRating.current = store.averageRating;
        badge.criteria.storeRating.met = store.averageRating >= 4.5;
      }

      // Calculate product ratings average
      const products = await Product.find({ msmeId: storeId });
      if (products.length > 0) {
        let totalRating = 0;
        let ratedProductsCount = 0;

        products.forEach((product) => {
          if (product.rating && product.rating > 0) {
            totalRating += product.rating;
            ratedProductsCount++;
          }
        });

        const avgRating =
          ratedProductsCount > 0 ? totalRating / ratedProductsCount : 0;
        badge.criteria.productRatings.current = avgRating;
        badge.criteria.productRatings.met = avgRating >= 4.0; // Slightly lower threshold
      }

      // Calculate profile views for current week
      const profileViews = await PageView.countDocuments({
        storeId: storeId,
        viewDate: {
          $gte: badge.weekStart,
          $lte: badge.weekEnd,
        },
      });
      badge.criteria.profileViews.current = profileViews;
      badge.criteria.profileViews.met = profileViews >= 25; // Updated threshold

      // Blog engagement removed - not required for badges

      // Check if all criteria are met
      badge.checkCriteria();

      await badge.save();
      return badge;
    } catch (error) {
      console.error("Error calculating store badge:", error);
      throw error;
    }
  }

  // Customer Badge Calculation Methods
  async calculateCustomerBadge(customerId) {
    try {
      // Get or create current week's badge
      let badge = await CustomerBadge.findOne({
        customerId: customerId,
        weekStart: { $lte: new Date() },
        weekEnd: { $gte: new Date() },
      });

      if (!badge) {
        badge = await CustomerBadge.createWeeklyBadge(customerId);
      }

      // Calculate ratings given this week
      const ratingsGiven = await this.countCustomerRatings(
        customerId,
        badge.weekStart,
        badge.weekEnd
      );
      badge.criteria.ratingsGiven.current = ratingsGiven;
      badge.criteria.ratingsGiven.met = ratingsGiven >= 3; // Updated threshold

      // Calculate blog engagement (page views on blog posts)
      const blogViews = await PageView.countDocuments({
        customerId: customerId,
        pageType: "blog", // Assuming you track blog page views
        viewDate: {
          $gte: badge.weekStart,
          $lte: badge.weekEnd,
        },
      });

      // If no blog-specific tracking, count any store page views as engagement
      const totalPageViews = await PageView.countDocuments({
        customerId: customerId,
        viewDate: {
          $gte: badge.weekStart,
          $lte: badge.weekEnd,
        },
      });

      // Use blog views if available, otherwise use a percentage of total page views
      const engagementScore =
        blogViews > 0 ? blogViews : Math.floor(totalPageViews * 0.3);
      badge.criteria.blogEngagement.current = engagementScore;
      badge.criteria.blogEngagement.met = engagementScore >= 3; // Updated threshold

      // Determine loyalty store (most interacted store)
      const loyaltyStore = await this.findMostLoyalStore(
        customerId,
        badge.weekStart,
        badge.weekEnd
      );
      if (loyaltyStore) {
        badge.loyaltyStore.storeId = loyaltyStore.storeId;
        badge.loyaltyStore.storeName = loyaltyStore.storeName;
        badge.loyaltyStore.interactionCount = loyaltyStore.interactionCount;
        badge.badgeType = "suki"; // Suki badge for loyal customers
      } else {
        badge.badgeType = "top_fan"; // General top fan badge
      }

      // Check if all criteria are met and create notification if newly awarded
      const wasActiveBeforeSave = badge.isActive;
      badge.checkCriteria();

      // If badge became active (newly awarded), create notification
      if (badge.isActive && !wasActiveBeforeSave && !badge.celebrationShown) {
        try {
          await CustomerNotification.createTopFanBadgeNotification(
            customerId,
            badge.badgeType,
            badge.expiresAt
          );
          console.log(
            `TOP FAN badge notification created for customer: ${customerId}`
          );
        } catch (notificationError) {
          console.error(
            "Error creating TOP FAN badge notification:",
            notificationError
          );
          // Don't fail the badge calculation if notification fails
        }
      }

      await badge.save();
      return badge;
    } catch (error) {
      console.error("Error calculating customer badge:", error);
      throw error;
    }
  }

  // Helper method to count customer ratings (adjust based on your rating system)
  async countCustomerRatings(customerId, startDate, endDate) {
    try {
      // Count from product reviews
      const products = await Product.find({
        "reviews.customerId": customerId,
        "reviews.createdAt": {
          $gte: startDate,
          $lte: endDate,
        },
      });

      let ratingCount = 0;
      products.forEach((product) => {
        if (product.reviews) {
          ratingCount += product.reviews.filter(
            (review) =>
              review.customerId.toString() === customerId.toString() &&
              review.createdAt >= startDate &&
              review.createdAt <= endDate
          ).length;
        }
      });

      // Also count store ratings if they exist separately
      const stores = await MSME.find({
        "reviews.customerId": customerId,
        "reviews.createdAt": {
          $gte: startDate,
          $lte: endDate,
        },
      });

      stores.forEach((store) => {
        if (store.reviews) {
          ratingCount += store.reviews.filter(
            (review) =>
              review.customerId.toString() === customerId.toString() &&
              review.createdAt >= startDate &&
              review.createdAt <= endDate
          ).length;
        }
      });

      console.log(
        `Customer ${customerId} gave ${ratingCount} ratings this week`
      );
      return ratingCount;
    } catch (error) {
      console.error("Error counting customer ratings:", error);
      return 0;
    }
  }

  // Helper method to find most loyal store
  async findMostLoyalStore(customerId, startDate, endDate) {
    try {
      // Count interactions with each store (page views)
      const storeInteractions = await PageView.aggregate([
        {
          $match: {
            customerId: customerId,
            viewDate: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$storeId",
            interactionCount: { $sum: 1 },
          },
        },
        {
          $sort: { interactionCount: -1 },
        },
        {
          $limit: 1,
        },
      ]);

      if (storeInteractions.length > 0) {
        const storeId = storeInteractions[0]._id;
        const interactionCount = storeInteractions[0].interactionCount;

        // Only consider it a loyalty store if there are at least 3 interactions
        if (interactionCount >= 3) {
          const store = await MSME.findOne({ _id: storeId });
          return {
            storeId: storeId,
            storeName: store ? store.businessName : "Unknown Store",
            interactionCount: interactionCount,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error finding most loyal store:", error);
      return null;
    }
  }

  // Get active badges
  async getActiveStoreBadge(storeId) {
    return await StoreBadge.getActiveBadge(storeId);
  }

  async getActiveCustomerBadge(customerId) {
    return await CustomerBadge.getActiveBadge(customerId);
  }

  // Check and award badges for all users (can be run as a cron job)
  async processAllBadges() {
    try {
      console.log("Starting badge processing for all users...");

      // Process all stores
      const stores = await MSME.find({ status: "approved" });
      for (const store of stores) {
        await this.calculateStoreBadge(store._id);
      }

      // Process all customers
      const customers = await Customer.find({});
      for (const customer of customers) {
        await this.calculateCustomerBadge(customer._id);
      }

      console.log("Badge processing completed");
    } catch (error) {
      console.error("Error processing badges:", error);
    }
  }

  // Clean up expired badges
  async cleanupExpiredBadges() {
    try {
      const now = new Date();

      // Deactivate expired store badges
      await StoreBadge.updateMany(
        {
          isActive: true,
          expiresAt: { $lt: now },
        },
        {
          isActive: false,
        }
      );

      // Deactivate expired customer badges
      await CustomerBadge.updateMany(
        {
          isActive: true,
          expiresAt: { $lt: now },
        },
        {
          isActive: false,
        }
      );

      console.log("Expired badges cleaned up");
    } catch (error) {
      console.error("Error cleaning up expired badges:", error);
    }
  }

  // Mark celebration as shown
  async markCelebrationShown(badgeType, badgeId) {
    try {
      if (badgeType === "store") {
        await StoreBadge.findByIdAndUpdate(badgeId, { celebrationShown: true });
      } else if (badgeType === "customer") {
        await CustomerBadge.findByIdAndUpdate(badgeId, {
          celebrationShown: true,
        });
      }
    } catch (error) {
      console.error("Error marking celebration as shown:", error);
    }
  }

  async manuallyAwardStoreBadge(storeId) {
    try {
      console.log(`🏆 ManuallyAwardStoreBadge called for storeId: ${storeId}`);

      // 1. Validate store exists
      const store = await MSME.findById(storeId);
      if (!store) {
        throw new Error("Store not found");
      }
      console.log(`✅ Store found: ${store.businessName}`);

      // 2. Check if already has active badge for current week
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of current week
      weekEnd.setHours(23, 59, 59, 999);

      let existingBadge = await StoreBadge.findOne({
        storeId: storeId,
        weekStart: { $lte: weekEnd },
        weekEnd: { $gte: weekStart }
      });

      // 3. Create or find existing badge for current week
      if (!existingBadge) {
        console.log(`Creating new badge for current week`);
        existingBadge = new StoreBadge({
          storeId: storeId,
          badgeType: "top_store",
          weekStart: weekStart,
          weekEnd: weekEnd,
          awardedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: false,
          celebrationShown: false,
          criteria: {
            storeRating: {
              current: 0,
              required: 4.0,
              met: false
            },
            productRatings: {
              current: 0,
              required: 4.0,
              met: false
            },
            customerEngagement: {
              current: 0,
              required: 50,
              met: false
            },
            profileViews: {
              current: 0,
              required: 100,
              met: false
            }
          }
        });
      } else {
        console.log(`Found existing badge: ${existingBadge._id}`);
      }

      // 4. Set badge as active and manually awarded
      existingBadge.isActive = true;
      existingBadge.manuallyAwarded = true;
      existingBadge.awardedAt = new Date();

      // 5. Mark all criteria as met (manual override)
      existingBadge.criteria.storeRating.met = true;
      existingBadge.criteria.productRatings.met = true;
      existingBadge.criteria.customerEngagement.met = true;
      existingBadge.criteria.profileViews.met = true;

      // 6. Save and return success
      await existingBadge.save();
      console.log(`✅ Badge saved successfully: ${existingBadge._id}`);

      return {
        success: true,
        badge: existingBadge,
        message: `Top Store badge awarded to ${store.businessName}`
      };

    } catch (error) {
      console.error("❌ Error in manuallyAwardStoreBadge:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BadgeService();
