const mongoose = require("mongoose");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

async function debugBadgeExpiration() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    const currentDate = new Date();
    console.log(`Current Date/Time: ${currentDate.toLocaleString()}`);
    console.log(`Current UTC: ${currentDate.toISOString()}`);

    // Get all badges
    const allBadges = await StoreBadge.find({})
      .populate("storeId", "businessName email")
      .sort({ createdAt: -1 });

    console.log(`\n=== BADGE EXPIRATION ANALYSIS ===`);

    allBadges.forEach((badge, index) => {
      const store = badge.storeId || {};
      const isExpiredByDate = currentDate > badge.expiresAt;
      const isExpiredByWeek = currentDate > badge.weekEnd;

      console.log(
        `\n--- Badge #${index + 1}: ${store.businessName || "Unknown"} ---`
      );
      console.log(`Badge ID: ${badge._id}`);
      console.log(`Is Active in DB: ${badge.isActive ? "✅ YES" : "❌ NO"}`);
      console.log(
        `Week Range: ${badge.weekStart.toLocaleDateString()} - ${badge.weekEnd.toLocaleDateString()}`
      );
      console.log(`Week End: ${badge.weekEnd.toLocaleString()}`);
      console.log(`Expires At: ${badge.expiresAt.toLocaleDateString()}`);
      console.log(`Expires At (full): ${badge.expiresAt.toLocaleString()}`);
      console.log(
        `Should be expired by week end: ${isExpiredByWeek ? "❌ YES" : "✅ NO"}`
      );
      console.log(
        `Should be expired by expiration date: ${
          isExpiredByDate ? "❌ YES" : "✅ NO"
        }`
      );

      // Calculate days remaining
      const daysFromWeekEnd = Math.floor(
        (currentDate - badge.weekEnd) / (1000 * 60 * 60 * 24)
      );
      const daysFromExpiration = Math.floor(
        (currentDate - badge.expiresAt) / (1000 * 60 * 60 * 24)
      );

      console.log(`Days since week ended: ${daysFromWeekEnd}`);
      console.log(`Days since expiration: ${daysFromExpiration}`);

      if (badge.isActive && (isExpiredByDate || isExpiredByWeek)) {
        console.log(`🚨 ISSUE: Badge is active but should be expired!`);
      }
    });

    // Check what the getActiveBadge method would return
    console.log(`\n=== TESTING getActiveBadge METHOD ===`);
    for (let badge of allBadges) {
      if (badge.storeId) {
        const activeBadge = await StoreBadge.getActiveBadge(badge.storeId._id);
        console.log(`Store: ${badge.storeId.businessName}`);
        console.log(
          `getActiveBadge returns: ${activeBadge ? "Badge found" : "No badge"}`
        );
        if (activeBadge) {
          console.log(`  Badge ID: ${activeBadge._id}`);
          console.log(
            `  Week: ${activeBadge.weekStart.toLocaleDateString()} - ${activeBadge.weekEnd.toLocaleDateString()}`
          );
          console.log(`  Expires: ${activeBadge.expiresAt.toLocaleString()}`);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

debugBadgeExpiration();
