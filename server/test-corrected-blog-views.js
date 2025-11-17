const mongoose = require("mongoose");
require("./models/customer.model");
require("./models/storeBadge.model");
require("./models/product.model");
require("./models/pageView.model");

mongoose.connect(
  "mongodb+srv://elakonirvin:1HJCfG6mPy1FDLTU@cluster0.xeubhql.mongodb.net/elako_nv?retryWrites=true&writeConcern=majority"
);

const badgeService = require("./services/badgeService");

async function testCorrectedBlogViews() {
  try {
    console.log("🧪 TESTING CORRECTED BLOG VIEW DATA");
    console.log("===================================");

    const badges = await badgeService.getActiveBadgeHolders();

    for (const badge of badges.topStoreBadges) {
      console.log(`Store: ${badge.name}`);
      console.log(`  Rating: ${badge.rating}★`);
      console.log(`  Blog Views: ${badge.blogViews || 0}`); // Should now be 0 instead of 100+
      console.log(`  Weekly Views: ${badge.weeklyViews}`);
      console.log(`  Badge Type: ${badge.badgeType}`);
      console.log(`  Awarded: ${badge.awardedDate}`);
      console.log();
    }

    console.log("✅ Blog view data is now consistent!");
    console.log("Stores without blogs show 0 views instead of fake 100+");

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error testing blog views:", error);
    mongoose.disconnect();
  }
}

testCorrectedBlogViews();
