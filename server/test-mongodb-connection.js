const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testMongoDBConnection() {
  console.log('🔄 Testing MongoDB Atlas connection...');
  console.log('📍 Connection URI:', MONGODB_URI.replace(/%40Jenzon0108_/, '***'));

  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');

    // Get database
    const db = client.db('ElakoNv');
    console.log('📊 Connected to database: ElakoNv');

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📚 Available Collections:');
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name}`);
    });

    // Fetch data from key collections
    console.log('\n🔍 Fetching data from collections...\n');

    // 1. Customers
    try {
      const customers = await db.collection('customers').find({}).limit(5).toArray();
      console.log('👥 CUSTOMERS:');
      console.log(`   Total found: ${await db.collection('customers').countDocuments()}`);
      if (customers.length > 0) {
        customers.forEach((customer, i) => {
          console.log(`   ${i + 1}. ${customer.firstname} ${customer.lastname} (${customer.email})`);
        });
      }
    } catch (err) {
      console.log('❌ Error fetching customers:', err.message);
    }

    // 2. MSMEs
    try {
      const msmes = await db.collection('msmes').find({}).limit(5).toArray();
      console.log('\n🏪 MSMEs:');
      console.log(`   Total found: ${await db.collection('msmes').countDocuments()}`);
      if (msmes.length > 0) {
        msmes.forEach((msme, i) => {
          console.log(`   ${i + 1}. ${msme.businessName} (${msme.email})`);
        });
      }
    } catch (err) {
      console.log('❌ Error fetching MSMEs:', err.message);
    }

    // 3. Admins
    try {
      const admins = await db.collection('admins').find({}).toArray();
      console.log('\n👨‍💼 ADMINS:');
      console.log(`   Total found: ${await db.collection('admins').countDocuments()}`);
      if (admins.length > 0) {
        admins.forEach((admin, i) => {
          console.log(`   ${i + 1}. ${admin.firstname} ${admin.lastname} (${admin.username})`);
        });
      }
    } catch (err) {
      console.log('❌ Error fetching admins:', err.message);
    }

    // 4. Products
    try {
      const products = await db.collection('products').find({}).limit(5).toArray();
      console.log('\n🛍️ PRODUCTS:');
      console.log(`   Total found: ${await db.collection('products').countDocuments()}`);
      if (products.length > 0) {
        products.forEach((product, i) => {
          console.log(`   ${i + 1}. ${product.name} - ₱${product.price}`);
        });
      }
    } catch (err) {
      console.log('❌ Error fetching products:', err.message);
    }

    // 5. Reviews
    try {
      const reviews = await db.collection('reviews').find({}).limit(3).toArray();
      console.log('\n⭐ REVIEWS:');
      console.log(`   Total found: ${await db.collection('reviews').countDocuments()}`);
      if (reviews.length > 0) {
        reviews.forEach((review, i) => {
          console.log(`   ${i + 1}. ${review.rating}⭐ - "${review.comment}"`);
        });
      }
    } catch (err) {
      console.log('❌ Error fetching reviews:', err.message);
    }

    // 6. Messages/Conversations
    try {
      const conversations = await db.collection('conversations').find({}).limit(3).toArray();
      console.log('\n💬 CONVERSATIONS:');
      console.log(`   Total found: ${await db.collection('conversations').countDocuments()}`);
      if (conversations.length > 0) {
        conversations.forEach((conv, i) => {
          console.log(`   ${i + 1}. Conversation ID: ${conv._id}`);
        });
      }
    } catch (err) {
      console.log('❌ Error fetching conversations:', err.message);
    }

    // 7. Badges
    try {
      const badges = await db.collection('badges').find({}).limit(3).toArray();
      console.log('\n🏆 BADGES:');
      console.log(`   Total found: ${await db.collection('badges').countDocuments()}`);
      if (badges.length > 0) {
        badges.forEach((badge, i) => {
          console.log(`   ${i + 1}. ${badge.title} - Store: ${badge.storeId}`);
        });
      }
    } catch (err) {
      console.log('❌ Error fetching badges:', err.message);
    }

    console.log('\n✅ MongoDB connection test completed successfully!');

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.message.includes('authentication')) {
      console.log('🔑 Authentication failed. Check your username and password.');
    } else if (error.message.includes('network')) {
      console.log('🌐 Network error. Check your internet connection.');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 MongoDB connection closed.');
    }
  }
}

// Run the test
testMongoDBConnection().catch(console.error);