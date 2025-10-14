const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

// Connect to database
mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
  testProductsAPI();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

async function testProductsAPI() {
  try {
    console.log("🔍 Testing Products API logic...");

    // The Mercancia Barata MSME ID we found
    const msmeId = "68ded9143255b574542dacdd";

    console.log(`📡 Simulating API call with msmeId: ${msmeId}`);

    // This is exactly what the API does
    const products = await Product.find({ msmeId }).populate(
      "msmeId",
      "businessName username"
    );

    console.log("\n📊 Products found:", products.length);

    if (products.length > 0) {
      console.log("\n📋 Products:");
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.productName || "UNNAMED"}`);
        console.log(`   - ID: ${product._id}`);
        console.log(`   - Price: ₱${product.price}`);
        console.log(`   - Available: ${product.availability}`);
        console.log(`   - Visible: ${product.visible}`);
        console.log(`   - Category: ${product.category}`);
        console.log(
          `   - Feedback: ${
            product.feedback ? product.feedback.length : 0
          } reviews`
        );
        console.log(
          `   - MSME Info: ${
            product.msmeId ? product.msmeId.businessName : "N/A"
          }`
        );

        // Show the raw object structure
        console.log(
          `   - Raw product keys: ${Object.keys(product.toObject()).join(", ")}`
        );
      });

      // Test what the API would return
      const apiResponse = {
        success: true,
        products: products,
      };

      console.log("\n🔧 API would return success:", apiResponse.success);
      console.log(
        "🔧 First product name from API:",
        apiResponse.products[0]?.productName
      );
    } else {
      console.log("\n❌ No products found");
    }
  } catch (error) {
    console.error("❌ Error testing:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}
