const BadgeService = require("./services/badgeService");
const mongoose = require("mongoose");

async function updateAllStoreBadges() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");
    await BadgeService.processAllBadges();
    console.log(
      "All store badges recalculated. Only eligible stores will have active badges."
    );
  } catch (error) {
    console.error("Error updating badges:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

updateAllStoreBadges();
