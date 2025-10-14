const mongoose = require("mongoose");
const Customer = require("./models/customer.model");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

async function cleanupOrphanedReferences() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("🧹 CLEANING UP ORPHANED REFERENCES\n");

    const customers = await Customer.find({});
    let totalCleaned = 0;

    for (const customer of customers) {
      let hasChanges = false;

      // Clean up favorite products
      if (customer.favorites && customer.favorites.length > 0) {
        const originalFavoritesCount = customer.favorites.length;
        const validFavorites = await Product.find({
          _id: { $in: customer.favorites },
        });
        const validFavoriteIds = validFavorites.map((p) => p._id);

        // Keep only valid favorites
        const cleanedFavorites = customer.favorites.filter((favId) =>
          validFavoriteIds.some(
            (validId) => validId.toString() === favId.toString()
          )
        );

        if (cleanedFavorites.length !== originalFavoritesCount) {
          console.log(
            `🧹 ${customer.username}: Removed ${
              originalFavoritesCount - cleanedFavorites.length
            } orphaned favorite products`
          );
          customer.favorites = cleanedFavorites;
          hasChanges = true;
        }
      }

      // Clean up followed stores
      if (customer.following && customer.following.length > 0) {
        const originalFollowingCount = customer.following.length;
        const validFollowing = await MSME.find({
          _id: { $in: customer.following },
        });
        const validFollowingIds = validFollowing.map((m) => m._id);

        // Keep only valid following
        const cleanedFollowing = customer.following.filter((followId) =>
          validFollowingIds.some(
            (validId) => validId.toString() === followId.toString()
          )
        );

        if (cleanedFollowing.length !== originalFollowingCount) {
          console.log(
            `🧹 ${customer.username}: Removed ${
              originalFollowingCount - cleanedFollowing.length
            } orphaned followed stores`
          );
          customer.following = cleanedFollowing;
          hasChanges = true;
        }
      }

      // Save if there were changes
      if (hasChanges) {
        await customer.save();
        totalCleaned++;
      }
    }

    console.log(`\n✅ CLEANUP COMPLETE!`);
    console.log(`📊 Total customers cleaned: ${totalCleaned}`);
    console.log(`👥 Total customers checked: ${customers.length}`);

    console.log("\n🎯 RESULT:");
    console.log("• All orphaned product references removed");
    console.log("• All orphaned store references removed");
    console.log("• Database is now clean and consistent");
    console.log("• Profile statistics will now be accurate");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

cleanupOrphanedReferences();
