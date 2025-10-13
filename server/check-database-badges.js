const mongoose = require("mongoose");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

async function checkDatabaseBadges() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Get all store badges from database
    const allBadges = await StoreBadge.find({})
      .populate("storeId", "businessName email")
      .sort({ createdAt: -1 });

    console.log(`\n=== ALL BADGES IN DATABASE (${allBadges.length}) ===`);

    if (allBadges.length === 0) {
      console.log("No badges found in database");
      return;
    }

    allBadges.forEach((badge, index) => {
      const store = badge.storeId || {};
      console.log(`\n--- Badge #${index + 1} ---`);
      console.log(`Store: ${store.businessName || "Unknown"}`);
      console.log(`Email: ${store.email || "N/A"}`);
      console.log(`Badge ID: ${badge._id}`);
      console.log(`Is Active: ${badge.isActive ? "✅ YES" : "❌ NO"}`);
      console.log(
        `Week: ${badge.weekStart.toLocaleDateString()} - ${badge.weekEnd.toLocaleDateString()}`
      );
      console.log(
        `Awarded At: ${
          badge.awardedAt ? badge.awardedAt.toLocaleString() : "Not awarded"
        }`
      );
      console.log(`Expires At: ${badge.expiresAt.toLocaleString()}`);
      console.log(`Celebration Shown: ${badge.celebrationShown}`);

      // Show criteria
      const c = badge.criteria;
      console.log("Criteria:");
      console.log(
        `  Store Rating: ${c.storeRating.current}/${c.storeRating.required} ${
          c.storeRating.met ? "✅" : "❌"
        }`
      );
      console.log(
        `  Product Ratings: ${c.productRatings.current}/${
          c.productRatings.required
        } ${c.productRatings.met ? "✅" : "❌"}`
      );
      console.log(
        `  Profile Views: ${c.profileViews.current}/${
          c.profileViews.required
        } ${c.profileViews.met ? "✅" : "❌"}`
      );
      console.log(
        `  Blog Views: ${c.blogViews.current}/${c.blogViews.required} ${
          c.blogViews.met ? "✅" : "❌"
        }`
      );
    });

    // Get specific stores and check if they have badges
    const stores = await MSME.find({ status: "approved" });

    console.log(`\n\n=== BADGE STATUS BY STORE ===`);
    for (const store of stores) {
      const storeBadges = await StoreBadge.find({ storeId: store._id }).sort({
        createdAt: -1,
      });
      const activeBadges = storeBadges.filter((b) => b.isActive);

      console.log(`\n${store.businessName}:`);
      console.log(`  Total badges: ${storeBadges.length}`);
      console.log(`  Active badges: ${activeBadges.length}`);

      if (activeBadges.length > 0) {
        console.log(`  ⚠️  HAS ACTIVE BADGE(S) - Should this store qualify?`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkDatabaseBadges();
