const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

// Connect to database
mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
  testHotPicksLogic();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

async function testHotPicksLogic() {
  try {
    console.log("🔍 Testing Hot Picks logic directly...");

    // This is exactly what the Hot Picks endpoint does
    const allHotProducts = await Product.find({
      availability: true,
      visible: true,
      rating: { $gte: 4.5, $lte: 5.0 },
    })
      .populate("msmeId", "businessName username status")
      .sort({ rating: -1, createdAt: -1 });

    console.log(
      `📊 Found ${allHotProducts.length} products with 4.5-5.0 rating`
    );

    // Filter out products from non-approved MSMEs
    const filteredProducts = allHotProducts.filter(
      (product) => product.msmeId && product.msmeId.status === "approved"
    );

    console.log(
      `✅ After MSME approval filtering: ${filteredProducts.length} products`
    );

    if (filteredProducts.length > 0) {
      console.log("\n📋 Hot Picks Products:");
      filteredProducts.slice(0, 4).forEach((product, index) => {
        console.log(`${index + 1}. ${product.productName}`);
        console.log(`   - Rating: ${product.rating}`);
        console.log(
          `   - Store: ${product.msmeId.businessName} (${product.msmeId.status})`
        );
        console.log(
          `   - Available: ${product.availability}, Visible: ${product.visible}`
        );
      });
    } else {
      console.log("\n❌ No qualifying hot picks found");

      // Let's check what products exist
      console.log("\n🔍 Checking all products...");
      const allProducts = await Product.find({}).populate(
        "msmeId",
        "businessName status"
      );
      console.log(`Total products: ${allProducts.length}`);

      const availableProducts = allProducts.filter(
        (p) => p.availability === true
      );
      console.log(`Available products: ${availableProducts.length}`);

      const visibleProducts = availableProducts.filter(
        (p) => p.visible === true
      );
      console.log(`Visible products: ${visibleProducts.length}`);

      const highRatedProducts = visibleProducts.filter(
        (p) => p.rating && p.rating >= 4.5
      );
      console.log(`High rated products (≥4.5): ${highRatedProducts.length}`);

      if (highRatedProducts.length > 0) {
        console.log("\nHigh rated products:");
        highRatedProducts.forEach((p) => {
          console.log(
            `- ${p.productName}: ${p.rating} stars (Store: ${p.msmeId?.businessName}, Status: ${p.msmeId?.status})`
          );
        });
      }

      const approvedStoreProducts = highRatedProducts.filter(
        (p) => p.msmeId && p.msmeId.status === "approved"
      );
      console.log(`From approved stores: ${approvedStoreProducts.length}`);
    }
  } catch (error) {
    console.error("❌ Error testing Hot Picks logic:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}
