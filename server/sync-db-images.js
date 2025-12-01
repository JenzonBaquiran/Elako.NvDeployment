// Script to sync database image references with available files
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

let mongoURI;
if (process.env.MONGODB_URI) {
  mongoURI = process.env.MONGODB_URI;
} else if (process.env.MONGO_URL) {
  mongoURI = process.env.MONGO_URL;
} else {
  mongoURI = "mongodb://127.0.0.1:27017/ElakoNv";
}

async function syncDatabaseImages() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const Product = require('./models/product.model');
    
    // Get available image files in our uploads directory
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const availableImages = [];
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.JPG', '.PNG'].includes(ext)) {
          availableImages.push(file);
        }
      });
    }

    console.log(`📁 Available images in uploads: ${availableImages.length}`);
    console.log(`   Sample available: ${availableImages.slice(0, 5).join(', ')}`);

    // Get products with image references from database
    const productsWithImages = await Product.find({
      $or: [
        { picture: { $exists: true, $ne: null, $ne: '' } },
        { pictures: { $exists: true, $ne: [] } }
      ]
    }).select('_id productName picture pictures rating');

    console.log(`\n📦 Products with image references in DB: ${productsWithImages.length}`);

    if (productsWithImages.length > 0) {
      console.log('\n🔍 Checking if referenced images exist:');
      
      const missingImages = [];
      const existingImages = [];
      const updates = [];

      productsWithImages.forEach((product, index) => {
        const dbImage = product.picture || (product.pictures && product.pictures[0]);
        console.log(`\n${index + 1}. ${product.productName}`);
        console.log(`   DB Image: ${dbImage}`);
        
        if (dbImage && fs.existsSync(path.join(uploadsDir, dbImage))) {
          console.log(`   ✅ Image exists`);
          existingImages.push(product);
        } else {
          console.log(`   ❌ Image missing`);
          missingImages.push(product);
          
          // Assign a random available image
          if (availableImages.length > 0) {
            const randomImage = availableImages[index % availableImages.length];
            console.log(`   🔄 Will assign: ${randomImage}`);
            
            updates.push({
              updateOne: {
                filter: { _id: product._id },
                update: {
                  $set: {
                    picture: randomImage,
                    pictures: [randomImage]
                  }
                }
              }
            });
          }
        }
      });

      console.log(`\n📊 Summary:`);
      console.log(`   Products with existing images: ${existingImages.length}`);
      console.log(`   Products with missing images: ${missingImages.length}`);
      console.log(`   Updates to perform: ${updates.length}`);

      // Perform updates if requested
      if (process.argv.includes('--fix') && updates.length > 0) {
        console.log('\n🔄 Performing updates...');
        const result = await Product.bulkWrite(updates);
        console.log(`✅ Updated ${result.modifiedCount} products with new images`);
      } else if (updates.length > 0) {
        console.log('\n💡 Run with --fix flag to update missing images');
      }
    }

    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

if (require.main === module) {
  syncDatabaseImages();
}

module.exports = { syncDatabaseImages };