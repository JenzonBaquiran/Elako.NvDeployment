// Database Image Updater - Assign existing images to products
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Use the same connection logic as main server
require('dotenv').config();

let mongoURI;

// Use Railway MongoDB connection string if available
if (process.env.MONGODB_URI) {
  mongoURI = process.env.MONGODB_URI;
  console.log("🚀 Using Railway MongoDB connection");
} else if (process.env.MONGO_URL) {
  mongoURI = process.env.MONGO_URL;
  console.log("🚀 Using Railway MONGO_URL connection");
} else {
  // For local testing, let's prompt for Atlas connection
  console.log("⚠️  Please set MONGODB_URI environment variable for Atlas connection");
  console.log("💡 You can find your Atlas connection string in MongoDB Atlas dashboard");
  process.exit(1);
}

async function updateProductImages() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Import Product model
    const Product = require('./models/product.model');
    
    // Get all available image files
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const imageFiles = [];
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext)) {
          imageFiles.push(file);
        }
      });
    }

    console.log(`📁 Found ${imageFiles.length} image files in uploads directory`);
    
    // Get all products without images
    const productsWithoutImages = await Product.find({
      $and: [
        { $or: [{ picture: { $exists: false } }, { picture: null }, { picture: '' }] },
        { $or: [{ pictures: { $exists: false } }, { pictures: { $size: 0 } }] }
      ]
    }).select('_id productName picture pictures');

    console.log(`📦 Found ${productsWithoutImages.length} products without images`);

    if (productsWithoutImages.length > 0 && imageFiles.length > 0) {
      console.log('🔄 Assigning images to products...');
      
      let imageIndex = 0;
      const updates = [];
      
      for (const product of productsWithoutImages) {
        if (imageIndex < imageFiles.length) {
          const imageName = imageFiles[imageIndex];
          
          updates.push({
            updateOne: {
              filter: { _id: product._id },
              update: {
                $set: {
                  picture: imageName,
                  pictures: [imageName]
                }
              }
            }
          });
          
          console.log(`   ✅ ${product.productName} → ${imageName}`);
          imageIndex = (imageIndex + 1) % imageFiles.length; // Cycle through images
        }
      }
      
      // Execute bulk update
      if (updates.length > 0) {
        const result = await Product.bulkWrite(updates);
        console.log(`\n🎉 Successfully updated ${result.modifiedCount} products with images!`);
      }
    } else if (productsWithoutImages.length === 0) {
      console.log('✅ All products already have images assigned!');
    } else {
      console.log('❌ No image files found to assign');
    }

    // Check final status
    const totalProducts = await Product.countDocuments({});
    const productsWithImages = await Product.countDocuments({
      $or: [
        { picture: { $exists: true, $ne: null, $ne: '' } },
        { pictures: { $exists: true, $ne: [] } }
      ]
    });

    console.log(`\n📊 Final Status:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Products with images: ${productsWithImages}`);
    console.log(`   Coverage: ${totalProducts > 0 ? ((productsWithImages / totalProducts) * 100).toFixed(1) : 0}%`);

    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

if (require.main === module) {
  updateProductImages();
}

module.exports = { updateProductImages };