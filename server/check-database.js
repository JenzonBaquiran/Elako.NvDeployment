const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");
const Customer = require("./models/customer.model");

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/elako-nv");

async function checkDatabase() {
  try {
    console.log("🔍 Checking database status...");

    // Check database connection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("\n📊 Available collections:");
    collections.forEach((col) => {
      console.log(`- ${col.name}`);
    });

    // Check MSMEs
    const msmeCount = await MSME.countDocuments();
    console.log(`\n🏪 MSME stores: ${msmeCount}`);

    if (msmeCount > 0) {
      const msmes = await MSME.find({}, "businessName username email").limit(5);
      msmes.forEach((msme) => {
        console.log(
          `  - ${msme.businessName} (${msme.username}) - ${msme.email}`
        );
      });
    }

    // Check Customers
    const customerCount = await Customer.countDocuments();
    console.log(`\n👥 Customers: ${customerCount}`);

    // Check Products
    const productCount = await Product.countDocuments();
    console.log(`\n📦 Products: ${productCount}`);

    if (productCount > 0) {
      const products = await Product.find({}, "productName msmeId price").limit(
        5
      );
      console.log("Sample products:");
      products.forEach((product) => {
        console.log(
          `  - ${product.productName} (₱${product.price}) - MSME: ${product.msmeId}`
        );
      });
    }

    // If no MSMEs, let's create a test one
    if (msmeCount === 0) {
      console.log("\n🔧 Creating test MSME store...");
      const testMSME = new MSME({
        username: "teststore",
        email: "test@store.com",
        password: "hashedpassword", // In real app, this would be properly hashed
        businessName: "Test Store",
        businessType: "Retail",
        businessAddress: "Test Address",
        contactNumber: "1234567890",
        isVerified: true,
      });

      const savedMSME = await testMSME.save();
      console.log(
        `✅ Created test MSME: ${savedMSME.businessName} with ID: ${savedMSME._id}`
      );

      // Create test products
      console.log("\n🔧 Creating test products...");
      const testProducts = [
        {
          productName: "Delicious Burger",
          price: 150,
          description: "A tasty burger with fresh ingredients",
          category: "food",
          msmeId: savedMSME._id,
          availability: true,
          visible: true,
          feedback: [
            {
              user: "John Doe",
              comment: "Great burger! Really enjoyed it.",
              rating: 5,
              createdAt: new Date(),
            },
            {
              user: "Jane Smith",
              comment: "Good but could be better.",
              rating: 4,
              createdAt: new Date(),
            },
          ],
        },
        {
          productName: "Fresh Fruit Juice",
          price: 80,
          description: "Natural fruit juice, no preservatives",
          category: "beverage",
          msmeId: savedMSME._id,
          availability: true,
          visible: true,
          feedback: [
            {
              user: "Mike Johnson",
              comment: "Very refreshing!",
              rating: 5,
              createdAt: new Date(),
            },
          ],
        },
        {
          productName: "Homemade Cookies",
          price: 120,
          description: "Freshly baked cookies made with love",
          category: "food",
          msmeId: savedMSME._id,
          availability: false,
          visible: true,
          feedback: [],
        },
      ];

      const savedProducts = await Product.insertMany(testProducts);
      console.log(`✅ Created ${savedProducts.length} test products`);

      savedProducts.forEach((product) => {
        console.log(`  - ${product.productName} (₱${product.price})`);
      });
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    mongoose.disconnect();
  }
}

checkDatabase();
