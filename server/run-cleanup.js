const mongoose = require("mongoose");
const BadgeService = require("./services/badgeService");

async function runCleanup() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    console.log("Running expired badge cleanup...");
    await BadgeService.cleanupExpiredBadges();
    console.log("✅ Cleanup completed successfully");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

runCleanup();
