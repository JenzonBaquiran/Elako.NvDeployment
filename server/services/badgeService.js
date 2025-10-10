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
      if (store && store.rating) {
        badge.criteria.storeRating.current = store.rating;
        badge.criteria.storeRating.met = store.rating >= 4.5;
      }

      // Calculate product ratings average
      const products = await Product.find({ msmeId: storeId });
      if (products.length > 0) {
        const totalRating = products.reduce(
          (sum, product) => sum + (product.rating || 0),
          0
        );
        const avgRating = totalRating / products.length;
        badge.criteria.productRatings.current = avgRating;
        badge.criteria.productRatings.met = avgRating >= 4.5;
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
      badge.criteria.profileViews.met = profileViews >= 200;

      // Calculate blog views for store's blog posts
      const storeBlogPosts = await MSMEBlogPost.find({ msmeId: storeId });
      const blogPostIds = storeBlogPosts.map((post) => post._id);

      // Note: Current PageView model doesn't track blog views,
      // so we'll set this to 0 for now or implement blog view tracking separately
      const blogViews = 0;
      badge.criteria.blogViews.current = blogViews;
      badge.criteria.blogViews.met = blogViews >= 100;

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
      // Assuming you have a Rating/Review model - adjust based on your actual model
      const ratingsGiven = await this.countCustomerRatings(
        customerId,
        badge.weekStart,
        badge.weekEnd
      );
      badge.criteria.ratingsGiven.current = ratingsGiven;
      badge.criteria.ratingsGiven.met = ratingsGiven >= 5;

      // Note: Current PageView model doesn't track blog views by customer,
      // so we'll set this to 0 for now or implement blog engagement tracking separately
      const blogViews = 0;
      badge.criteria.blogEngagement.current = blogViews;
      badge.criteria.blogEngagement.met = blogViews >= 5;

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
    // This is a placeholder - adjust based on your actual rating/review system
    // You might have a Rating model or reviews embedded in Product model
    try {
      // Example implementation - modify based on your actual schema
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
}

module.exports = new BadgeService();
