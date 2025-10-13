const mongoose = require("mongoose");
const BadgeService = require("./services/badgeService");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

async function testBadges() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Get approved stores
    const stores = await MSME.find({ status: "approved" });
    console.log(`Found ${stores.length} approved stores`);

    // Calculate badge for first store
    if (stores.length > 0) {
      const testStore = stores[0];
      console.log(`\nCalculating badge for: ${testStore.businessName}`);

      const badge = await BadgeService.calculateStoreBadge(testStore._id);
      console.log("Badge result:");
      console.log("- Active:", badge.isActive);
      console.log("- Awarded At:", badge.awardedAt);
      console.log("- Criteria:", badge.criteria);

      if (badge.isActive) {
        console.log("\n🎉 BADGE IS ACTIVE! Store meets all criteria.");
      } else {
        console.log("\n⏳ Badge not active yet. Progress:");
        Object.entries(badge.criteria).forEach(([key, criterion]) => {
          const status = criterion.met ? "✅" : "❌";
          console.log(
            `  ${status} ${key}: ${criterion.current}/${criterion.required}`
          );
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testBadges();
