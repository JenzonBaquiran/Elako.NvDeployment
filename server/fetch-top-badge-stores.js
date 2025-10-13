const mongoose = require("mongoose");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

async function fetchTopBadgeStores() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Fetch all store badges, sorted by creation date (most recent first)
    const allBadges = await StoreBadge.find({})
      .populate("storeId", "businessName email businessType averageRating")
      .sort({ createdAt: -1 });

    console.log("\n=== ALL STORE BADGES ===");
    console.log(`Total badges found: ${allBadges.length}`);

    if (allBadges.length === 0) {
      console.log("No store badges found in the database.");
      return;
    }

    // Display all badges with details
    allBadges.forEach((badge, index) => {
      const store = badge.storeId || {};
      const weekStart = new Date(badge.weekStart).toLocaleDateString();
      const weekEnd = new Date(badge.weekEnd).toLocaleDateString();
      const awardedAt = badge.awardedAt
        ? new Date(badge.awardedAt).toLocaleString()
        : "Not awarded";

      console.log(`\n--- Badge #${index + 1} ---`);
      console.log(`Store: ${store.businessName || "Unknown"}`);
      console.log(`Email: ${store.email || "N/A"}`);
      console.log(`Business Type: ${store.businessType || "N/A"}`);
      console.log(`Badge Type: ${badge.badgeType}`);
      console.log(`Is Active: ${badge.isActive ? "✅ YES" : "❌ NO"}`);
      console.log(`Week Range: ${weekStart} - ${weekEnd}`);
      console.log(`Awarded At: ${awardedAt}`);
      console.log(`Criteria Met:`);
      console.log(
        `  - Store Rating: ${badge.criteria.storeRating.current}/${
          badge.criteria.storeRating.required
        } ${badge.criteria.storeRating.met ? "✅" : "❌"}`
      );
      console.log(
        `  - Product Ratings: ${badge.criteria.productRatings.current}/${
          badge.criteria.productRatings.required
        } ${badge.criteria.productRatings.met ? "✅" : "❌"}`
      );
      console.log(
        `  - Profile Views: ${badge.criteria.profileViews.current}/${
          badge.criteria.profileViews.required
        } ${badge.criteria.profileViews.met ? "✅" : "❌"}`
      );
      console.log(
        `  - Blog Views: ${badge.criteria.blogViews.current}/${
          badge.criteria.blogViews.required
        } ${badge.criteria.blogViews.met ? "✅" : "❌"}`
      );
    });

    // Fetch only ACTIVE badges
    const activeBadges = await StoreBadge.find({ isActive: true })
      .populate("storeId", "businessName email businessType averageRating")
      .sort({ awardedAt: -1 });

    console.log("\n\n=== TOP STORES WITH ACTIVE BADGES ===");
    console.log(`Active badges found: ${activeBadges.length}`);

    if (activeBadges.length === 0) {
      console.log("No stores currently have active Top Store badges.");
    } else {
      activeBadges.forEach((badge, index) => {
        const store = badge.storeId || {};
        const weekStart = new Date(badge.weekStart).toLocaleDateString();
        const weekEnd = new Date(badge.weekEnd).toLocaleDateString();
        const awardedAt = new Date(badge.awardedAt).toLocaleString();

        console.log(`\n🏆 TOP STORE #${index + 1}`);
        console.log(`Store Name: ${store.businessName || "Unknown"}`);
        console.log(`Business Type: ${store.businessType || "N/A"}`);
        console.log(`Store Rating: ${store.averageRating || "N/A"}`);
        console.log(`Badge Week: ${weekStart} - ${weekEnd}`);
        console.log(`Awarded: ${awardedAt}`);
        console.log(`Email: ${store.email || "N/A"}`);

        // Show criteria summary
        const criteria = badge.criteria;
        const totalCriteria = 4;
        const metCriteria = [
          criteria.storeRating.met,
          criteria.productRatings.met,
          criteria.profileViews.met,
          criteria.blogViews.met,
        ].filter(Boolean).length;

        console.log(`Criteria Score: ${metCriteria}/${totalCriteria} ⭐`);
      });
    }

    // Show some statistics
    console.log("\n\n=== BADGE STATISTICS ===");
    console.log(`Total Badges: ${allBadges.length}`);
    console.log(`Active Badges: ${activeBadges.length}`);
    console.log(`Inactive Badges: ${allBadges.length - activeBadges.length}`);

    // Group by store to show which stores have multiple badges
    const storeGroups = {};
    allBadges.forEach((badge) => {
      const storeName = badge.storeId?.businessName || "Unknown";
      if (!storeGroups[storeName]) {
        storeGroups[storeName] = [];
      }
      storeGroups[storeName].push(badge);
    });

    console.log("\n=== BADGES BY STORE ===");
    Object.entries(storeGroups).forEach(([storeName, badges]) => {
      const activeBadgesCount = badges.filter((b) => b.isActive).length;
      console.log(
        `${storeName}: ${badges.length} total badges (${activeBadgesCount} active)`
      );
    });
  } catch (error) {
    console.error("Error fetching badge stores:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit();
  }
}

fetchTopBadgeStores();
