const mongoose = require('mongoose');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');

async function testRealStatistics() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ElakoNv');
    console.log('🔍 TESTING REAL CUSTOMER STATISTICS\n');

    // Get Nicolai's data to test with
    const customer = await Customer.findOne({ username: 'nicolai' });
    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }

    console.log('👤 CUSTOMER PROFILE:', customer.firstname, customer.lastname);
    console.log('📧 Email:', customer.email);
    console.log('🆔 ID:', customer.id);

    // Test 1: Reviews Given (from API logic)
    const customerName = `${customer.firstname} ${customer.lastname}`.trim();
    const reviewCount = await Product.aggregate([
      {
        $match: {
          $or: [
            { "feedback.userId": customer._id.toString() },
            { "feedback.userId": customer.id },
            { "feedback.user": customerName },
          ],
        },
      },
      {
        $unwind: "$feedback",
      },
      {
        $match: {
          $or: [
            { "feedback.userId": customer._id.toString() },
            { "feedback.userId": customer.id },
            { "feedback.user": customerName },
          ],
        },
      },
      {
        $count: "totalReviews",
      },
    ]);

    const reviewsGiven = reviewCount.length > 0 ? reviewCount[0].totalReviews : 0;

    // Test 2: Followed Stores
    const followedStores = customer.following ? customer.following.length : 0;

    // Test 3: Favorite Products
    const favoriteProducts = customer.favorites ? customer.favorites.length : 0;

    // Test 4: Member Since
    const memberSince = customer.createdAt ? new Date(customer.createdAt).getFullYear() : new Date().getFullYear();

    console.log('\n📊 REAL STATISTICS CALCULATION:');
    console.log('='.repeat(50));
    console.log(`📝 Reviews Given: ${reviewsGiven}`);
    console.log(`🏪 Followed Stores: ${followedStores}`);
    console.log(`❤️  Favorite Products: ${favoriteProducts}`);
    console.log(`📅 Member Since: ${memberSince}`);

    // Test API call simulation
    console.log('\n🔗 API RESPONSE SIMULATION:');
    console.log('='.repeat(50));
    const apiResponse = {
      success: true,
      profile: {
        id: customer.id,
        username: customer.username,
        fullName: `${customer.firstname} ${customer.lastname}`.trim(),
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
        contactNumber: customer.contactNumber || "",
        address: customer.address || "",
        bio: customer.bio || "Love discovering unique products from local MSMEs!",
        termsAcceptedAt: customer.termsAcceptedAt,
        stats: {
          reviewsGiven: reviewsGiven,
          followedStores: followedStores,
          favoriteProducts: favoriteProducts,
          memberSince: memberSince,
        },
      },
    };

    console.log('GET /api/customers/' + customer.id + '/profile would return:');
    console.log(JSON.stringify(apiResponse.profile.stats, null, 2));

    // Check if customer has any favorites or following to verify
    console.log('\n🔍 DATABASE VERIFICATION:');
    console.log('='.repeat(50));
    console.log(`Favorites array length: ${customer.favorites.length}`);
    console.log(`Following array length: ${customer.following.length}`);
    
    if (customer.favorites.length > 0) {
      console.log('Favorite product IDs:', customer.favorites.slice(0, 3));
    }
    
    if (customer.following.length > 0) {
      console.log('Following MSME IDs:', customer.following.slice(0, 3));
    }

    // Check for actual reviews
    const productsWithFeedback = await Product.find({
      $or: [
        { "feedback.userId": customer._id.toString() },
        { "feedback.userId": customer.id },
        { "feedback.user": customerName },
      ]
    }).select('name feedback');

    console.log(`\n📝 PRODUCTS WITH CUSTOMER'S REVIEWS: ${productsWithFeedback.length}`);
    if (productsWithFeedback.length > 0) {
      productsWithFeedback.slice(0, 3).forEach(product => {
        const customerFeedback = product.feedback.filter(f => 
          f.userId === customer._id.toString() || 
          f.userId === customer.id || 
          f.user === customerName
        );
        console.log(`- ${product.name}: ${customerFeedback.length} review(s)`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

testRealStatistics();