const mongoose = require("mongoose");
const Customer = require("./models/customer.model");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

async function testFixedStatistics() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("🔧 TESTING FIXED STATISTICS CALCULATION\n");

    // Get Nicolai's data
    const customer = await Customer.findOne({ username: "nicolai" });
    if (!customer) {
      console.log("❌ Customer not found");
      return;
    }

    console.log("👤 CUSTOMER:", customer.firstname, customer.lastname);

    // Original counts (what was shown before)
    console.log("\n📊 BEFORE FIX (DATABASE ARRAY LENGTH):");
    console.log("=".repeat(50));
    console.log(
      `❌ Favorite Products: ${customer.favorites.length} (included deleted items)`
    );
    console.log(
      `❌ Followed Stores: ${customer.following.length} (included deleted items)`
    );

    // New calculation (like the updated API)
    let validFavoriteCount = 0;
    if (customer.favorites && customer.favorites.length > 0) {
      const validFavorites = await Product.find({
        _id: { $in: customer.favorites },
      });
      validFavoriteCount = validFavorites.length;
    }

    let validFollowingCount = 0;
    if (customer.following && customer.following.length > 0) {
      const validFollowing = await MSME.find({
        _id: { $in: customer.following },
      });
      validFollowingCount = validFollowing.length;
    }

    // Reviews (this was already correct)
    const customerName = `${customer.firstname} ${customer.lastname}`.trim();
    const reviewCount = await Product.aggregate([
      {
        $match: {
          $or: [
            { "feedback.userId": customer._id.toString() },
            { "feedback.userId": customer.id },
            { "feedback.user": customerName },
          ],
        },
      },
      {
        $unwind: "$feedback",
      },
      {
        $match: {
          $or: [
            { "feedback.userId": customer._id.toString() },
            { "feedback.userId": customer.id },
            { "feedback.user": customerName },
          ],
        },
      },
      {
        $count: "totalReviews",
      },
    ]);
    const reviewsGiven =
      reviewCount.length > 0 ? reviewCount[0].totalReviews : 0;

    console.log("\n📊 AFTER FIX (ONLY EXISTING ITEMS):");
    console.log("=".repeat(50));
    console.log(`✅ Reviews Given: ${reviewsGiven} (unchanged, was correct)`);
    console.log(
      `✅ Favorite Products: ${validFavoriteCount} (fixed - only existing products)`
    );
    console.log(
      `✅ Followed Stores: ${validFollowingCount} (fixed - only existing stores)`
    );

    console.log("\n🎯 COMPARISON WITH SCREENSHOT:");
    console.log("=".repeat(50));
    console.log("Screenshot shows: 5 favorites, 3 followed stores");
    console.log(
      `Fixed API returns: ${validFavoriteCount} favorites, ${validFollowingCount} followed stores`
    );

    if (validFavoriteCount === 5 && validFollowingCount === 3) {
      console.log("✅ PERFECT MATCH! The fix is working correctly.");
    } else {
      console.log("⚠️  Numbers still don't match. Need further investigation.");
    }

    console.log("\n🔗 UPDATED API RESPONSE:");
    console.log("=".repeat(50));
    const stats = {
      reviewsGiven: reviewsGiven,
      followedStores: validFollowingCount,
      favoriteProducts: validFavoriteCount,
      memberSince: customer.createdAt
        ? new Date(customer.createdAt).getFullYear()
        : new Date().getFullYear(),
    };
    console.log("GET /api/customers/" + customer.id + "/profile stats:");
    console.log(JSON.stringify(stats, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

testFixedStatistics();
