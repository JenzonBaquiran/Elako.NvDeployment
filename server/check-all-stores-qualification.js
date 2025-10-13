const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const BadgeService = require("./services/badgeService");

async function checkAllStoresQualification() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Get all approved stores
    const stores = await MSME.find({ status: "approved" });
    console.log(`\n=== CHECKING ALL ${stores.length} APPROVED STORES ===\n`);

    const qualifyingStores = [];
    const nonQualifyingStores = [];

    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      console.log(
        `--- Store ${i + 1}/${stores.length}: ${store.businessName} ---`
      );

      try {
        // Calculate badge for this store
        const badge = await BadgeService.calculateStoreBadge(store._id);

        console.log(`Business Type: ${store.businessType || "N/A"}`);
        console.log(`Email: ${store.email || "N/A"}`);
        console.log(`Average Rating: ${store.averageRating || 0}`);

        // Show detailed criteria
        const criteria = badge.criteria;
        console.log("\nCriteria Analysis:");
        console.log(
          `  🏪 Store Rating: ${criteria.storeRating.current}/${
            criteria.storeRating.required
          } ${criteria.storeRating.met ? "✅" : "❌"}`
        );
        console.log(
          `  📦 Product Ratings: ${criteria.productRatings.current}/${
            criteria.productRatings.required
          } ${criteria.productRatings.met ? "✅" : "❌"}`
        );
        console.log(
          `  👁️ Profile Views: ${criteria.profileViews.current}/${
            criteria.profileViews.required
          } ${criteria.profileViews.met ? "✅" : "❌"}`
        );
        console.log(
          `  📖 Blog Views: ${criteria.blogViews.current}/${
            criteria.blogViews.required
          } ${criteria.blogViews.met ? "✅" : "❌"}`
        );

        // Count met criteria
        const metCriteria = [
          criteria.storeRating.met,
          criteria.productRatings.met,
          criteria.profileViews.met,
          criteria.blogViews.met,
        ].filter(Boolean).length;

        console.log(`\nScore: ${metCriteria}/4 criteria met`);
        console.log(
          `Badge Status: ${
            badge.isActive ? "🏆 QUALIFIED" : "❌ NOT QUALIFIED"
          }`
        );

        if (badge.isActive) {
          qualifyingStores.push({
            name: store.businessName,
            email: store.email,
            score: metCriteria,
            criteria: criteria,
          });
        } else {
          nonQualifyingStores.push({
            name: store.businessName,
            email: store.email,
            score: metCriteria,
            criteria: criteria,
          });
        }
      } catch (error) {
        console.error(
          `Error calculating badge for ${store.businessName}:`,
          error.message
        );
      }

      console.log("\n" + "=".repeat(50) + "\n");
    }

    // Summary
    console.log("🏆 FINAL QUALIFICATION RESULTS 🏆");
    console.log("=".repeat(50));

    console.log(`\n✅ QUALIFYING STORES (${qualifyingStores.length}):`);
    if (qualifyingStores.length === 0) {
      console.log("   No stores currently qualify for Top Store badge");
    } else {
      qualifyingStores.forEach((store, index) => {
        console.log(
          `   ${index + 1}. ${store.name} (${store.score}/4 criteria) - ${
            store.email
          }`
        );
      });
    }

    console.log(`\n❌ NON-QUALIFYING STORES (${nonQualifyingStores.length}):`);
    if (nonQualifyingStores.length === 0) {
      console.log("   All stores qualify!");
    } else {
      nonQualifyingStores.forEach((store, index) => {
        console.log(
          `   ${index + 1}. ${store.name} (${store.score}/4 criteria) - ${
            store.email
          }`
        );
      });
    }

    console.log(`\nTOTAL: ${stores.length} approved stores checked`);
    console.log(`QUALIFIED: ${qualifyingStores.length} stores`);
    console.log(`NOT QUALIFIED: ${nonQualifyingStores.length} stores`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkAllStoresQualification();
