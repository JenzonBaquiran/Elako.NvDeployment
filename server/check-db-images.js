// Debug script to check what images are stored in the database
const mongoose = require('mongoose');

// Connect to MongoDB - Use the same connection logic as the main server
require('dotenv').config();

let mongoURI;

// Use Railway MongoDB connection string if available
if (process.env.MONGODB_URI) {
  mongoURI = process.env.MONGODB_URI;
  console.log("🚀 Using Railway MongoDB connection");
} else if (process.env.MONGO_URL) {
  mongoURI = process.env.MONGO_URL;
  console.log("🌐 Using MONGO_URL connection");
} else {
  mongoURI = "mongodb://localhost:27017/elako-nv";
  console.log("🏠 Using local MongoDB connection");
}

async function checkDatabaseImages() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Import Product model
    const Product = require('./models/product.model');
    
    // Find products with images
    const productsWithImages = await Product.find({
      $or: [
        { picture: { $exists: true, $ne: null } },
        { pictures: { $exists: true, $ne: [] } }
      ]
    }).select('_id productName picture pictures msmeId').limit(20);

    console.log(`\n📊 Found ${productsWithImages.length} products with images:`);
    
    productsWithImages.forEach((product, index) => {
      console.log(`\n${index + 1}. Product: ${product.productName}`);
      console.log(`   ID: ${product._id}`);
      if (product.picture) {
        console.log(`   Single picture: ${product.picture}`);
      }
      if (product.pictures && product.pictures.length > 0) {
        console.log(`   Pictures array: [${product.pictures.join(', ')}]`);
      }
    });

    // Get total count of products with images
    const totalWithImages = await Product.countDocuments({
      $or: [
        { picture: { $exists: true, $ne: null } },
        { pictures: { $exists: true, $ne: [] } }
      ]
    });

    console.log(`\n📈 Total products with images: ${totalWithImages}`);

    // Check total product count
    const totalProducts = await Product.countDocuments({});
    console.log(`\n📦 Total products in database: ${totalProducts}`);

    if (totalProducts > 0) {
      // Check all products to see their image fields
      const allProducts = await Product.find({}).select('_id productName picture pictures rating').limit(10);
      console.log(`\n🔍 Sample products in database:`);
      allProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productName} (${product.rating || 0}★)`);
        console.log(`      picture: ${product.picture || 'null'}`);
        console.log(`      pictures: ${product.pictures ? JSON.stringify(product.pictures) : 'null'}`);
      });
    } else {
      console.log(`\n❌ No products found in database!`);
      console.log(`   Database URI: ${mongoURI}`);
      
      // List all collections to see what's in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`\n📋 Collections in database:`);
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }

    // Check top rated products specifically
    const topRatedWithImages = await Product.find({
      rating: { $gte: 4.5 },
      $or: [
        { picture: { $exists: true, $ne: null } },
        { pictures: { $exists: true, $ne: [] } }
      ]
    }).select('_id productName picture pictures rating').limit(10);

    console.log(`\n⭐ Top rated products (4.5+ stars) with images: ${topRatedWithImages.length}`);
    topRatedWithImages.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.productName} (${product.rating}★)`);
      console.log(`      Images: ${product.picture || product.pictures?.[0] || 'None'}`);
    });

    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

if (require.main === module) {
  checkDatabaseImages();
}

module.exports = { checkDatabaseImages };