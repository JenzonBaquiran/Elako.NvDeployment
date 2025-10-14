const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/ELako_Nv");

async function checkProducts() {
  try {
    const products = await Product.find({}).populate("msmeId", "businessName");

    console.log(`Found ${products.length} products in database:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productName}`);
      console.log(`   Store: ${product.msmeId?.businessName || "Unknown"}`);
      console.log(`   Hashtags: ${product.hashtags || "None"}`);
      console.log(`   Available: ${product.availability}`);
      console.log(`   Visible: ${product.visible}`);
      console.log("");
    });
  } catch (error) {
    console.error("Error checking products:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkProducts();
