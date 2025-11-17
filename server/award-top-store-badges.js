const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const Product = require("./models/product.model");
const PageView = require("./models/pageview.model");
const StoreBadge = require("./models/storeBadge.model");

async function awardTopStoreBadges() {
  try {
    console.log("🏆 Awarding badges to highest-rated stores...\n");

    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});
    console.log("✅ Database connected\n");

    // Get all stores and calculate their ratings
    const stores = await MSME.find({}).lean();
    const storeAnalysis = [];

    console.log("📊 Calculating ratings for all stores...\n");

    for (const store of stores) {
      const products = await Product.find({ msmeId: store._id });

      let totalRating = 0;
      let ratingCount = 0;
      let totalReviews = 0;

      // Calculate average rating from all products using feedback array
      for (const product of products) {
        if (product.feedback && product.feedback.length > 0) {
          const productRating =
            product.feedback.reduce((sum, f) => sum + f.rating, 0) /
            product.feedback.length;
          totalRating += productRating;
          ratingCount++;
          totalReviews += product.feedback.length;
        }
      }

      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Get weekly views using PageView stats
      let weeklyViews = 0;
      try {
        const stats = await PageView.getStoreStats(store._id);
        weeklyViews = stats.weekly;
      } catch (error) {
        console.log(
          `Warning: Could not get stats for ${store.businessName}: ${error.message}`
        );
      }

      storeAnalysis.push({
        storeId: store._id,
        businessName: store.businessName,
        averageRating: averageRating,
        totalReviews: totalReviews,
        weeklyViews: weeklyViews,
        score: averageRating + weeklyViews * 0.01, // Rating + bonus for views
      });

      console.log(`${store.businessName}:
        - Rating: ${averageRating.toFixed(2)}★ (${totalReviews} reviews)
        - Weekly Views: ${weeklyViews}
        - Score: ${(averageRating + weeklyViews * 0.01).toFixed(2)}`);
    }

    // Sort stores by score (highest first)
    storeAnalysis.sort((a, b) => b.score - a.score);

    console.log("\n🥇 RANKING BY SCORE:");
    console.log("===================");
    storeAnalysis.forEach((store, index) => {
      console.log(
        `${index + 1}. ${store.businessName}: ${store.score.toFixed(
          2
        )} (${store.averageRating.toFixed(2)}★, ${store.weeklyViews} views)`
      );
    });

    // Remove all existing badges first
    console.log("\n🧹 Clearing existing badges...");
    await StoreBadge.updateMany({}, { isActive: false });

    // Award badges to top stores (those with rating >= 4.0 OR top 1-2 stores regardless)
    const topStores = storeAnalysis.filter(
      (store) => store.averageRating >= 4.0 || storeAnalysis.indexOf(store) < 2
    );

    console.log(
      `\n🏆 Awarding badges to ${topStores.length} qualifying stores...\n`
    );

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of current week
    const weekNumber = Math.ceil(
      ((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + 1) / 7
    );

    for (let i = 0; i < topStores.length; i++) {
      const store = topStores[i];

      const newBadge = new StoreBadge({
        storeId: store.storeId,
        weekStart: weekStart,
        weekEnd: weekEnd,
        weekNumber: weekNumber,
        isActive: true,
        awardedAt: now,
        expiresAt: weekEnd,
        criteria: {
          storeRating: {
            required: 4.0,
            current: store.averageRating,
          },
          profileViews: {
            required: 25,
            current: store.weeklyViews,
          },
          blogViews: {
            required: 10,
            current: 0, // Set to 0 since stores don't have blogs yet
          },
        },
        celebrationShown: false,
      });

      await newBadge.save();

      console.log(`✅ Badge awarded to: ${store.businessName}
        - Rank: #${i + 1}
        - Rating: ${store.averageRating.toFixed(2)}★ 
        - Reviews: ${store.totalReviews}
        - Views: ${store.weeklyViews}
        - Badge ID: ${newBadge._id}`);
    }

    console.log(
      `\n🎉 Successfully awarded ${topStores.length} Top Store badges!`
    );
    console.log("The highest-rated stores now have active badges.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📝 Database disconnected");
  }
}

awardTopStoreBadges();
