const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/elako-nv", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testStoreProducts() {
  try {
    console.log("🔍 Testing store products...");

    // Find all MSMEs to see what stores exist
    const stores = await MSME.find({}, "businessName username _id");
    console.log("\n📊 Available stores:");
    stores.forEach((store) => {
      console.log(
        `- ${store.businessName} (${store.username}) - ID: ${store._id}`
      );
    });

    if (stores.length === 0) {
      console.log("❌ No stores found in database");
      return;
    }

    // Test with the first store
    const testStore = stores[0];
    console.log(`\n🏪 Testing products for store: ${testStore.businessName}`);

    const products = await Product.find({ msmeId: testStore._id });
    console.log(`\n📦 Found ${products.length} products:`);

    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Product: ${product.productName}`);
      console.log(`   - Price: ₱${product.price}`);
      console.log(`   - Category: ${product.category}`);
      console.log(`   - Available: ${product.availability}`);
      console.log(`   - Visible: ${product.visible}`);
      console.log(
        `   - Feedback count: ${product.feedback ? product.feedback.length : 0}`
      );
      console.log(`   - ID: ${product._id}`);

      if (product.feedback && product.feedback.length > 0) {
        console.log(`   - Reviews:`);
        product.feedback.forEach((fb, fbIndex) => {
          console.log(
            `     ${fbIndex + 1}. ${fb.user}: ${fb.rating}⭐ - "${fb.comment}"`
          );
        });
      }
    });

    // Test the API endpoint simulation
    console.log(`\n🌐 Testing API endpoint simulation:`);
    const apiProducts = await Product.find({ msmeId: testStore._id }).populate(
      "msmeId",
      "businessName username"
    );

    console.log(
      `API would return ${apiProducts.length} products with populated MSME data`
    );
  } catch (error) {
    console.error("❌ Error testing store products:", error);
  } finally {
    mongoose.disconnect();
  }
}

testStoreProducts();
