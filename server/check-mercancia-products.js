const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const Product = require("./models/product.model");

mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
  checkMercanciaProducts();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

async function checkMercanciaProducts() {
  try {
    console.log("\n🔍 Checking Mercancia Barata products...");

    // Find the Mercancia Barata MSME
    const msme = await MSME.findOne({
      $or: [
        { username: "mercanciabarata" },
        { businessName: { $regex: /mercancia barata/i } },
      ],
    });

    if (!msme) {
      console.log("❌ Mercancia Barata MSME not found");
      return;
    }

    console.log(`\n✅ Found MSME:`);
    console.log(`   - Username: ${msme.username}`);
    console.log(`   - Business Name: ${msme.businessName}`);
    console.log(`   - MongoDB _id: ${msme._id}`);
    console.log(`   - Custom id: ${msme.id}`);

    // Check products using MongoDB _id (which is what the API uses)
    console.log(`\n🔍 Looking for products with msmeId: ${msme._id}`);
    const products = await Product.find({ msmeId: msme._id });

    console.log(`\n📊 Found ${products.length} products for Mercancia Barata`);

    if (products.length > 0) {
      console.log("\n📋 Products found:");
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. Product Details:`);
        console.log(`   - ID: ${product._id}`);
        console.log(`   - Name: ${product.productName}`);
        console.log(`   - Price: ₱${product.price}`);
        console.log(`   - Category: ${product.category}`);
        console.log(`   - Available: ${product.availability}`);
        console.log(`   - Visible: ${product.visible}`);
        console.log(`   - Description: ${product.description}`);
        console.log(
          `   - Feedback count: ${
            product.feedback ? product.feedback.length : 0
          }`
        );
        if (product.feedback && product.feedback.length > 0) {
          console.log(
            `   - Sample feedback: ${JSON.stringify(
              product.feedback[0],
              null,
              2
            )}`
          );
        }
      });
    } else {
      console.log("\n❌ No products found for this MSME");

      // Check if there are products for any other MSMEs
      console.log("\n🔍 Checking products for other MSMEs...");
      const allProducts = await Product.find({});
      console.log(`Total products in database: ${allProducts.length}`);

      if (allProducts.length > 0) {
        console.log("\nProducts by MSME:");
        const productsByMsme = {};
        allProducts.forEach((product) => {
          const msmeId = product.msmeId.toString();
          if (!productsByMsme[msmeId]) {
            productsByMsme[msmeId] = [];
          }
          productsByMsme[msmeId].push(product.productName);
        });

        for (const [msmeId, productNames] of Object.entries(productsByMsme)) {
          console.log(`   MSME ${msmeId}: ${productNames.join(", ")}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error checking products:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}
