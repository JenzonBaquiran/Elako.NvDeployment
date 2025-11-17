const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const StoreBadge = require("./models/storeBadge.model");
const PageView = require("./models/pageview.model");
const Product = require("./models/product.model");

async function checkStoreRatings() {
  try {
    console.log("🔍 Checking all store ratings and badge eligibility...\n");

    // Connect to database
    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});
    console.log("✅ Database connected\n");

    // Get all stores with their ratings
    const stores = await MSME.find({}).lean();
    console.log(`Found ${stores.length} stores in database\n`);

    const storeAnalysis = [];

    for (const store of stores) {
      console.log(`📊 Analyzing: ${store.businessName} (${store._id})`);

      // Get products for this store
      const products = await Product.find({ msmeId: store._id });
      console.log(`  📦 Products: ${products.length}`);

      // Calculate average rating from products
      let totalRating = 0;
      let ratingCount = 0;

      for (const product of products) {
        if (product.ratings && product.ratings.length > 0) {
          const productAvg =
            product.ratings.reduce((sum, r) => sum + r.rating, 0) /
            product.ratings.length;
          totalRating += productAvg;
          ratingCount++;
          console.log(
            `    - ${product.productName}: ${productAvg.toFixed(1)}★ (${
              product.ratings.length
            } reviews)`
          );
        }
      }

      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Get profile views (last 7 days)
      const weeklyViews = await PageView.countDocuments({
        targetType: "store",
        targetId: store._id,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      // Get total profile views
      const totalViews = await PageView.countDocuments({
        targetType: "store",
        targetId: store._id,
      });

      // Check current badge status
      const currentBadge = await StoreBadge.findOne({
        storeId: store._id,
        isActive: true,
      });

      const analysis = {
        storeId: store._id,
        businessName: store.businessName,
        averageRating: averageRating,
        ratingCount: ratingCount,
        weeklyViews: weeklyViews,
        totalViews: totalViews,
        hasActiveBadge: !!currentBadge,
        badgeId: currentBadge?._id,
      };

      storeAnalysis.push(analysis);

      console.log(
        `  ⭐ Average Rating: ${averageRating.toFixed(
          1
        )}★ (from ${ratingCount} products)`
      );
      console.log(
        `  👀 Profile Views: ${weeklyViews} this week, ${totalViews} total`
      );
      console.log(`  🏆 Has Badge: ${currentBadge ? "YES" : "NO"}`);

      // Check if should have badge based on rating
      const shouldHaveBadge = averageRating >= 4.0 && weeklyViews >= 25;
      console.log(
        `  📝 Should have badge: ${shouldHaveBadge} (rating >= 4.0 AND views >= 25)`
      );
      console.log("");
    }

    // Sort stores by rating (highest first)
    storeAnalysis.sort((a, b) => b.averageRating - a.averageRating);

    console.log("🏆 TOP STORES BY RATING:");
    console.log("========================");
    storeAnalysis.forEach((store, index) => {
      const badge = store.hasActiveBadge ? "🏆" : "❌";
      console.log(
        `${index + 1}. ${store.businessName}: ${store.averageRating.toFixed(
          1
        )}★ ${badge}`
      );
      console.log(
        `   Views: ${store.weeklyViews} weekly, ${store.totalViews} total`
      );
    });

    console.log("\n🎯 BADGE ASSIGNMENT ANALYSIS:");
    console.log("=============================");

    const topStores = storeAnalysis.slice(0, 3); // Top 3 stores
    console.log("Top 3 stores that SHOULD have badges:");
    topStores.forEach((store, index) => {
      const shouldHave = store.averageRating >= 4.0;
      const actualHas = store.hasActiveBadge;
      const status = shouldHave === actualHas ? "✅ CORRECT" : "❌ INCORRECT";

      console.log(
        `${index + 1}. ${store.businessName}: ${store.averageRating.toFixed(
          1
        )}★`
      );
      console.log(`   Should have badge: ${shouldHave}`);
      console.log(`   Actually has badge: ${actualHas}`);
      console.log(`   Status: ${status}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📝 Database disconnected");
  }
}

checkStoreRatings();
