const mongoose = require("mongoose");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

async function debugActiveBadges() {
  try {
    console.log("🔍 DEBUGGING ACTIVE BADGES ISSUE");
    console.log("=================================\n");

    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv");
    console.log("✅ Connected to MongoDB\n");

    // Check all badges
    const allBadges = await StoreBadge.find({})
      .populate("storeId", "businessName")
      .sort({ createdAt: -1 });

    console.log(`📊 TOTAL BADGES: ${allBadges.length}\n`);

    // Check active badges
    const activeBadges = await StoreBadge.find({ isActive: true })
      .populate("storeId", "businessName")
      .sort({ createdAt: -1 });

    console.log(`🏆 ACTIVE BADGES: ${activeBadges.length}\n`);

    // Check badges that are not expired
    const now = new Date();
    const nonExpiredBadges = await StoreBadge.find({
      expiresAt: { $gt: now },
    })
      .populate("storeId", "businessName")
      .sort({ createdAt: -1 });

    console.log(`⏰ NON-EXPIRED BADGES: ${nonExpiredBadges.length}\n`);

    // Check badges that should be active (not expired AND isActive)
    const shouldBeActive = await StoreBadge.find({
      isActive: true,
      expiresAt: { $gt: now },
    })
      .populate("storeId", "businessName")
      .sort({ createdAt: -1 });

    console.log(`✅ SHOULD BE ACTIVE: ${shouldBeActive.length}\n`);

    // Detailed analysis of all badges
    console.log("📋 DETAILED BADGE ANALYSIS:");
    console.log("============================");

    allBadges.forEach((badge, index) => {
      const store = badge.storeId || {};
      const isExpired = new Date(badge.expiresAt) <= now;
      const daysUntilExpiry = Math.ceil(
        (new Date(badge.expiresAt) - now) / (1000 * 60 * 60 * 24)
      );

      console.log(`\n${index + 1}. ${store.businessName || "Unknown Store"}`);
      console.log(`   Badge ID: ${badge._id}`);
      console.log(`   Store ID: ${badge.storeId}`);
      console.log(`   Is Active: ${badge.isActive ? "✅ YES" : "❌ NO"}`);
      console.log(`   Expires: ${new Date(badge.expiresAt).toLocaleString()}`);
      console.log(
        `   Expired: ${
          isExpired ? "❌ YES" : "✅ NO"
        } (${daysUntilExpiry} days remaining)`
      );
      console.log(
        `   Awarded: ${
          badge.awardedAt
            ? new Date(badge.awardedAt).toLocaleString()
            : "Not awarded"
        }`
      );
      console.log(
        `   Week: ${new Date(
          badge.weekStart
        ).toLocaleDateString()} - ${new Date(
          badge.weekEnd
        ).toLocaleDateString()}`
      );

      // Check if this badge should be showing
      const shouldShow = badge.isActive && !isExpired;
      console.log(`   Should Show: ${shouldShow ? "✅ YES" : "❌ NO"}`);

      if (badge.criteria) {
        console.log(`   Criteria:`);
        console.log(
          `     - Store Rating: ${badge.criteria.storeRating?.current || 0}/${
            badge.criteria.storeRating?.required || 4
          } ${badge.criteria.storeRating?.met ? "✅" : "❌"}`
        );
        console.log(
          `     - Profile Views: ${badge.criteria.profileViews?.current || 0}/${
            badge.criteria.profileViews?.required || 25
          } ${badge.criteria.profileViews?.met ? "✅" : "❌"}`
        );
      }
    });

    // Test specific store IDs
    console.log("\n🎯 TESTING SPECIFIC STORE IDS:");
    console.log("==============================");

    const testStoreIds = [
      "67490321a6bc4b0ead47143e", // Mercancia Barata
      "67490321a6bc4b0ead47143f", // Florevo
    ];

    for (const storeId of testStoreIds) {
      console.log(`\n🏪 Testing Store ID: ${storeId}`);

      // Try to get active badge
      const activeBadge = await StoreBadge.getActiveBadge(storeId);
      console.log(`   Active Badge Found: ${activeBadge ? "✅ YES" : "❌ NO"}`);

      if (activeBadge) {
        console.log(`   Badge Details:`);
        console.log(`     - ID: ${activeBadge._id}`);
        console.log(`     - Is Active: ${activeBadge.isActive}`);
        console.log(
          `     - Expires: ${new Date(activeBadge.expiresAt).toLocaleString()}`
        );
      }

      // Try to find store
      const store = await MSME.findById(storeId);
      console.log(`   Store Found: ${store ? "✅ YES" : "❌ NO"}`);
      if (store) {
        console.log(`   Store Name: ${store.businessName}`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📝 Database disconnected");
  }
}

debugActiveBadges();
