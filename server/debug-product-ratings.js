const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

async function checkProductRatings() {
  try {
    console.log("🔍 Checking product ratings...\n");

    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});
    console.log("✅ Database connected\n");

    const stores = await MSME.find({});

    for (const store of stores) {
      console.log(`📊 ${store.businessName} (${store._id}):`);

      const products = await Product.find({ msmeId: store._id });
      console.log(`  Found ${products.length} products:`);

      for (const product of products) {
        console.log(`    - ${product.productName}:`);
        console.log(
          `      Feedback array: ${
            product.feedback ? product.feedback.length : 0
          } reviews`
        );
        console.log(`      Rating field: ${product.rating}`);

        if (product.feedback && product.feedback.length > 0) {
          console.log(
            `      Sample feedback: ${JSON.stringify(product.feedback[0])}`
          );
          const avgRating =
            product.feedback.reduce((sum, f) => sum + f.rating, 0) /
            product.feedback.length;
          console.log(`      Calculated average: ${avgRating.toFixed(1)}★`);
        }
      }
      console.log("");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📝 Database disconnected");
  }
}

checkProductRatings();
