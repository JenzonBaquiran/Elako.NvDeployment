const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const MSME = require("./models/msme.model");
const Product = require("./models/product.model");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/elako");

async function createMercanciaBarata() {
  try {
    console.log("=== CREATING MERCANCIA BARATA USER ===");

    // Check if user already exists
    const existingUser = await MSME.findOne({ username: "mercanciabarata" });
    if (existingUser) {
      console.log("User already exists:", existingUser._id);
      return existingUser._id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create new MSME user
    const newMSME = new MSME({
      businessName: "Mercancia Barata",
      username: "mercanciabarata",
      email: "mercancia@example.com",
      password: hashedPassword,
      isVerified: true,
      businessType: "retail",
      location: "Sample Location",
    });

    const savedMSME = await newMSME.save();
    console.log("Created new MSME user:", savedMSME._id);

    // Create some sample products for this user
    const sampleProducts = [
      {
        productName: "Sample Product 1",
        price: 299,
        description: "This is a sample product for testing",
        availability: true,
        category: "general",
        msmeId: savedMSME._id,
        feedback: [
          {
            user: "Test Customer",
            comment: "Great product!",
            rating: 5,
            createdAt: new Date(),
          },
        ],
      },
      {
        productName: "Sample Product 2",
        price: 199,
        description: "Another sample product for testing",
        availability: true,
        category: "general",
        msmeId: savedMSME._id,
        feedback: [
          {
            user: "Another Customer",
            comment: "Good quality.",
            rating: 4,
            createdAt: new Date(),
          },
        ],
      },
    ];

    for (let productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.productName}`);
    }

    console.log("Setup complete!");
    console.log("You can now log in with:");
    console.log("Username: mercanciabarata");
    console.log("Password: password123");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

createMercanciaBarata();
