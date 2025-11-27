const mongoose = require("mongoose");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

async function testBadgeSystem() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    console.log("\n=== TESTING BADGE SYSTEM AFTER FIXES ===");

    // 1. Check current badge status
    const allBadges = await StoreBadge.find({}).sort({ createdAt: -1 });
    const activeBadges = allBadges.filter((b) => b.isActive);
    const expiredBadges = allBadges.filter(
      (b) => new Date(b.expiresAt) <= new Date()
    );
    const activeNotExpired = allBadges.filter(
      (b) => b.isActive && new Date(b.expiresAt) > new Date()
    );

    console.log(`Total badges in DB: ${allBadges.length}`);
    console.log(`Badges marked isActive=true: ${activeBadges.length}`);
    console.log(`Badges that are expired: ${expiredBadges.length}`);
    console.log(
      `Badges that are active AND not expired: ${activeNotExpired.length}`
    );

    if (activeNotExpired.length > 0) {
      console.log("\n🚨 Active non-expired badges found:");
      for (const badge of activeNotExpired) {
        const store = await MSME.findById(badge.storeId);
        console.log(
          `  - ${store?.businessName || "Unknown"} (expires: ${
            badge.expiresAt
          })`
        );
      }
    } else {
      console.log("\n✅ No active non-expired badges (correct behavior)");
    }

    // 2. Test getActiveBadge method for known stores
    const testStores = await MSME.find({
      businessName: { $in: ["Gotzest", "Mercancia Barata", "Florevo"] },
    });

    console.log("\n=== TESTING getActiveBadge METHOD ===");
    for (const store of testStores) {
      const activeBadge = await StoreBadge.getActiveBadge(store._id);
      console.log(
        `${store.businessName}: ${
          activeBadge ? "Has active badge" : "No active badge"
        }`
      );
    }

    // 3. Test the admin query logic
    const adminActiveQuery = {
      isActive: true,
      expiresAt: { $gt: new Date() },
    };

    const adminActiveBadges = await StoreBadge.find(adminActiveQuery).populate(
      "storeId",
      "businessName"
    );

    console.log(`\n=== ADMIN QUERY TEST ===`);
    console.log(
      `Badges from admin query (isActive=true AND not expired): ${adminActiveBadges.length}`
    );

    if (adminActiveBadges.length > 0) {
      console.log("Active badges for admin panel:");
      adminActiveBadges.forEach((badge) => {
        console.log(`  - ${badge.storeId?.businessName || "Unknown"}`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

testBadgeSystem();
