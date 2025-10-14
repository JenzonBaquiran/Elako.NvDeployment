const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

// Connect to database
mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
  testAPIResponse();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

async function addFavoriteStatusToProducts(products, customerId) {
  // Simulate the favorite status function (if it exists)
  return products.map((product) => ({
    ...product.toObject(),
    isFavorite: false, // Default value since we don't have customerId
  }));
}

async function testAPIResponse() {
  try {
    console.log("🔍 Testing exact API response for Reviews page...");

    // The Mercancia Barata MSME ID
    const msmeId = "68ded9143255b574542dacdd";

    console.log(`📡 Simulating GET /api/products?msmeId=${msmeId}`);

    // This is exactly what the API endpoint does
    let filter = {};
    if (msmeId) filter.msmeId = msmeId;

    const products = await Product.find(filter).populate(
      "msmeId",
      "businessName username"
    );

    // Add favorite status to products (same as API)
    const productsWithFavoriteStatus = await addFavoriteStatusToProducts(
      products,
      null // No customerId for MSME review page
    );

    const apiResponse = {
      success: true,
      products: productsWithFavoriteStatus,
    };

    console.log("\n🔧 API Response Structure:");
    console.log(`✅ Success: ${apiResponse.success}`);
    console.log(`📊 Number of products: ${apiResponse.products.length}`);

    if (apiResponse.products.length > 0) {
      console.log("\n📋 First Product Analysis:");
      const firstProduct = apiResponse.products[0];

      console.log("Raw product object keys:", Object.keys(firstProduct));
      console.log("\n🔍 Key Properties:");
      console.log(`- _id: ${firstProduct._id}`);
      console.log(`- productName: "${firstProduct.productName}"`);
      console.log(`- productName type: ${typeof firstProduct.productName}`);
      console.log(`- price: ${firstProduct.price}`);
      console.log(`- category: ${firstProduct.category}`);
      console.log(`- availability: ${firstProduct.availability}`);
      console.log(`- visible: ${firstProduct.visible}`);
      console.log(
        `- feedback count: ${
          firstProduct.feedback ? firstProduct.feedback.length : 0
        }`
      );
      console.log(
        `- msmeId populated: ${
          firstProduct.msmeId?.businessName || "Not populated"
        }`
      );

      console.log("\n📝 Complete First Product JSON:");
      console.log(JSON.stringify(firstProduct, null, 2));

      // Test the exact condition used in the frontend
      const displayName = firstProduct.productName || "Unnamed Product";
      console.log(`\n🎯 Frontend would display: "${displayName}"`);

      if (!firstProduct.productName) {
        console.log("⚠️  ISSUE: productName is missing or falsy!");
        console.log("Raw productName value:", firstProduct.productName);
      }
    }
  } catch (error) {
    console.error("❌ Error testing API response:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}
