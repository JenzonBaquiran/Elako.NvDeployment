const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

async function checkRealRatings() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv");
    console.log("✅ Connected to MongoDB");

    // Get all products with feedback
    const products = await Product.find({}).limit(10);
    console.log(`\n=== CHECKING REAL DATABASE RATINGS ===`);
    console.log(`Found ${products.length} products total`);

    let productsWithRatings = 0;
    let totalFeedbackEntries = 0;

    for (const product of products) {
      if (product.feedback && product.feedback.length > 0) {
        productsWithRatings++;
        totalFeedbackEntries += product.feedback.length;

        console.log(`\n📦 Product: ${product.productName}`);
        console.log(`📊 Feedback entries: ${product.feedback.length}`);

        // Show first few feedback entries to see structure
        const sampleFeedback = product.feedback.slice(0, 3);
        sampleFeedback.forEach((feedback, index) => {
          console.log(`  ${index + 1}. Rating: ${feedback.rating}★`);
          if (feedback.customerId)
            console.log(`     Customer: ${feedback.customerId}`);
          if (feedback.review)
            console.log(
              `     Review: "${feedback.review.substring(0, 50)}..."`
            );
          if (feedback.createdAt)
            console.log(`     Date: ${feedback.createdAt}`);
        });

        // Calculate average for this product
        const avgRating =
          product.feedback.reduce((sum, f) => sum + f.rating, 0) /
          product.feedback.length;
        console.log(`📈 Average Rating: ${avgRating.toFixed(1)}★`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Products with ratings: ${productsWithRatings}`);
    console.log(`Total feedback entries: ${totalFeedbackEntries}`);
    console.log(
      `Products without ratings: ${products.length - productsWithRatings}`
    );

    // Check if this looks like test/mock data
    if (totalFeedbackEntries > 0) {
      console.log(`\n🔍 DATA ANALYSIS:`);
      console.log(
        `${
          totalFeedbackEntries > 50
            ? "⚠️  LIKELY MOCK DATA"
            : "✅ LIKELY REAL DATA"
        } - ${totalFeedbackEntries} total entries`
      );

      // Check for patterns in ratings that suggest mock data
      let allRatings = [];
      products.forEach((p) => {
        if (p.feedback) {
          allRatings.push(...p.feedback.map((f) => f.rating));
        }
      });

      if (allRatings.length > 0) {
        const uniqueRatings = [...new Set(allRatings)];
        console.log(
          `Unique rating values: [${uniqueRatings.sort().join(", ")}]`
        );

        if (uniqueRatings.length <= 2) {
          console.log(
            `⚠️  SUSPICIOUS: Only ${uniqueRatings.length} unique rating values suggests mock data`
          );
        } else {
          console.log(
            `✅ GOOD: ${uniqueRatings.length} different rating values suggests real user data`
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📝 Database disconnected");
  }
}

checkRealRatings();
