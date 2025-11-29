const mongoose = require("mongoose");
require("dotenv").config();

// Import your models
const Admin = require("./models/admin.model");
const Customer = require("./models/customer.model");
const MSME = require("./models/msme.model");

// Sample data to seed
const seedData = {
  admins: [
    {
      username: "admin",
      email: "admin@elako.nv",
      password: "$2a$10$rOeK7QG1Y.3nK7vL8X8X1eRqK7QG1Y.3nK7vL8X8X1eRqK7QG1Y.3", // 'admin123'
      firstname: "Admin",
      lastname: "User",
      role: "admin",
    },
  ],
  customers: [
    {
      username: "testcustomer",
      email: "customer@test.com",
      password: "$2a$10$rOeK7QG1Y.3nK7vL8X8X1eRqK7QG1Y.3nK7vL8X8X1eRqK7QG1Y.3", // 'password123'
      firstname: "Test",
      lastname: "Customer",
      contactNumber: "09123456789",
      address: "Test Address",
      isActive: true,
    },
  ],
  msmes: [
    {
      clientProfilingNumber: "CPN001",
      businessName: "Test Business",
      businessType: "Retail",
      businessAddress: "Test Business Address",
      contactPerson: "Test Owner",
      contactNumber: "09987654321",
      email: "business@test.com",
      username: "testbusiness",
      password: "$2a$10$rOeK7QG1Y.3nK7vL8X8X1eRqK7QG1Y.3nK7vL8X8X1eRqK7QG1Y.3", // 'password123'
      isActive: true,
      isApproved: true,
    },
  ],
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    let mongoURI;
    if (process.env.MONGODB_URI) {
      mongoURI = process.env.MONGODB_URI;
    } else if (process.env.MONGO_URL) {
      mongoURI = process.env.MONGO_URL;
    } else {
      mongoURI = "mongodb://127.0.0.1:27017/ElakoNv";
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB for seeding");

    // Check if data already exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log("📊 Database already has data. Skipping seed.");
      process.exit(0);
    }

    // Seed Admins
    console.log("🌱 Seeding admins...");
    await Admin.insertMany(seedData.admins);
    console.log("✅ Admins seeded");

    // Seed Customers
    console.log("🌱 Seeding customers...");
    await Customer.insertMany(seedData.customers);
    console.log("✅ Customers seeded");

    // Seed MSMEs
    console.log("🌱 Seeding MSMEs...");
    await MSME.insertMany(seedData.msmes);
    console.log("✅ MSMEs seeded");

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📝 Default credentials:");
    console.log("Admin: admin / admin123");
    console.log("Customer: testcustomer / password123");
    console.log("MSME: testbusiness / password123");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
