const mongoose = require("mongoose");
const BadgeService = require("./services/badgeService");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

// List store business names to force-check
const storesToCheck = ["Mercancia Barata", "Gotzest"];

async function recalcAndClean() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    const stores = await MSME.find({ businessName: { $in: storesToCheck } });
    if (stores.length === 0) {
      console.log("No stores found by those names");
      return;
    }

    for (const store of stores) {
      console.log(`\nProcessing store: ${store.businessName} (${store._id})`);
      const badge = await BadgeService.calculateStoreBadge(store._id);
      console.log("After calculation - isActive:", badge.isActive);

      if (
        !badge.criteria.storeRating.met ||
        !badge.criteria.productRatings.met ||
        !badge.criteria.profileViews.met ||
        !badge.criteria.blogViews.met
      ) {
        console.log(
          "Store does not meet all criteria - forcing deactivation if any active badges exist for current week"
        );

        // Find all badges for this store for current week and deactivate them
        const now = new Date();
        const badgesThisWeek = await StoreBadge.find({
          storeId: store._id,
          weekStart: { $lte: now },
          weekEnd: { $gte: now },
        });

        for (const b of badgesThisWeek) {
          if (b.isActive) {
            b.isActive = false;
            await b.save();
            console.log(
              `Deactivated badge ${b._id} for store ${store.businessName}`
            );
          } else {
            console.log(`Badge ${b._id} already inactive`);
          }
        }
      } else {
        console.log(
          "Store meets all criteria - badge should remain active if awarded"
        );
      }
    }

    console.log("\nDone processing specified stores");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

recalcAndClean();
