const mongoose = require('mongoose');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');
const MSME = require('./models/msme.model');

async function investigateDiscrepancy() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ElakoNv');
    console.log('🔍 INVESTIGATING FAVORITES/FOLLOWING DISCREPANCY\n');

    // Get Nicolai's data
    const customer = await Customer.findOne({ username: 'nicolai' });
    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }

    console.log('👤 CUSTOMER:', customer.firstname, customer.lastname);
    console.log('🆔 ID:', customer.id);

    // Check favorites in detail
    console.log('\n❤️  FAVORITE PRODUCTS ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`Database favorites array length: ${customer.favorites.length}`);
    console.log('Favorite Product IDs in database:');
    customer.favorites.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });

    // Check if these products still exist
    console.log('\n🔍 CHECKING IF FAVORITE PRODUCTS STILL EXIST:');
    let validFavorites = 0;
    for (let i = 0; i < customer.favorites.length; i++) {
      const productId = customer.favorites[i];
      const product = await Product.findById(productId);
      if (product) {
        validFavorites++;
        console.log(`  ✅ ${i + 1}. ${product.name} (${product.businessName})`);
      } else {
        console.log(`  ❌ ${i + 1}. Product ID ${productId} - NOT FOUND`);
      }
    }
    console.log(`\nValid favorites that exist: ${validFavorites}`);

    // Check following stores in detail
    console.log('\n🏪 FOLLOWED STORES ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`Database following array length: ${customer.following.length}`);
    console.log('Followed Store IDs in database:');
    customer.following.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });

    // Check if these stores still exist
    console.log('\n🔍 CHECKING IF FOLLOWED STORES STILL EXIST:');
    let validFollowing = 0;
    for (let i = 0; i < customer.following.length; i++) {
      const storeId = customer.following[i];
      const msme = await MSME.findById(storeId);
      if (msme) {
        validFollowing++;
        console.log(`  ✅ ${i + 1}. ${msme.businessName} (@${msme.username})`);
      } else {
        console.log(`  ❌ ${i + 1}. Store ID ${storeId} - NOT FOUND`);
      }
    }
    console.log(`\nValid followed stores that exist: ${validFollowing}`);

    // Summary
    console.log('\n📊 DISCREPANCY ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`Database says: ${customer.favorites.length} favorites, ${customer.following.length} following`);
    console.log(`Actually exist: ${validFavorites} favorites, ${validFollowing} following`);
    console.log(`Screenshot shows: 5 favorites, 3 following`);
    
    if (validFavorites !== customer.favorites.length) {
      console.log(`\n⚠️  ISSUE FOUND: ${customer.favorites.length - validFavorites} favorite products don't exist anymore`);
    }
    
    if (validFollowing !== customer.following.length) {
      console.log(`\n⚠️  ISSUE FOUND: ${customer.following.length - validFollowing} followed stores don't exist anymore`);
    }

    console.log('\n🔧 RECOMMENDED FIX:');
    console.log('='.repeat(50));
    console.log('Update the API to only count favorites/following that still exist:');
    console.log('• Filter out deleted products from favorites count');
    console.log('• Filter out deleted MSMEs from following count');
    console.log('• Clean up orphaned references in database');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

investigateDiscrepancy();