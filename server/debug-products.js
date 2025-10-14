const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/elako", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugProducts() {
  try {
    console.log("=== DEBUGGING PRODUCTS ===");

    // Check if there are any MSMEs
    const msmes = await MSME.find({});
    console.log(`Found ${msmes.length} MSMEs in database`);

    if (msmes.length > 0) {
      console.log("Sample MSME:", {
        id: msmes[0]._id,
        businessName: msmes[0].businessName,
        username: msmes[0].username,
      });
    }

    // Check if there are any products
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} products in database`);

    if (allProducts.length > 0) {
      console.log("Sample product:", {
        id: allProducts[0]._id,
        productName: allProducts[0].productName,
        msmeId: allProducts[0].msmeId,
        availability: allProducts[0].availability,
        feedback: allProducts[0].feedback ? allProducts[0].feedback.length : 0,
      });

      // Check if any products belong to MSMEs
      for (let msme of msmes) {
        const msmeProducts = await Product.find({ msmeId: msme._id });
        console.log(
          `MSME "${msme.businessName}" has ${msmeProducts.length} products`
        );

        if (msmeProducts.length > 0) {
          console.log("Sample product for this MSME:", {
            productName: msmeProducts[0].productName,
            price: msmeProducts[0].price,
            description: msmeProducts[0].description,
            category: msmeProducts[0].category,
            availability: msmeProducts[0].availability,
          });
        }
      }
    } else {
      console.log("No products found in database!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

debugProducts();
