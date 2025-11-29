require("dotenv").config();
const mongoose = require("mongoose");

async function checkLocalData() {
  try {
    console.log("🔍 Checking local MongoDB data...");

    // Connect to local MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv");
    console.log("✅ Connected to local MongoDB");

    // Get database stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log("\n📊 Available Collections:");
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  • ${collection.name}: ${count} documents`);
    }

    await mongoose.disconnect();
    console.log("\n✅ Check completed");
  } catch (error) {
    console.error("❌ Error checking local data:", error.message);
    console.log(
      "\n💡 Make sure your local MongoDB server is running on port 27017"
    );
  }
}

checkLocalData();
