const mongoose = require("mongoose");
const MSME = require("./models/msme.model");

mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
  checkMsmeUser();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

async function checkMsmeUser() {
  try {
    console.log("\n🔍 Checking MSME database...");

    // Check all MSMEs
    const allMsmes = await MSME.find({});
    console.log(`\n📊 Total MSMEs in database: ${allMsmes.length}`);

    if (allMsmes.length > 0) {
      console.log("\n📋 All MSMEs found:");
      allMsmes.forEach((msme, index) => {
        console.log(`\n${index + 1}. MSME Details:`);
        console.log(`   - ID: ${msme._id}`);
        console.log(`   - Custom ID: ${msme.id}`);
        console.log(`   - Username: ${msme.username}`);
        console.log(`   - Business Name: ${msme.businessName}`);
        console.log(`   - Email: ${msme.email}`);
        console.log(`   - Category: ${msme.category}`);
        console.log(`   - Status: ${msme.status}`);
        console.log(`   - Created: ${msme.createdAt}`);
      });
    }

    // Look specifically for "Mercancia Barata"
    console.log("\n🔍 Looking for 'Mercancia Barata'...");

    const mercanciaByName = await MSME.find({
      businessName: { $regex: /mercancia/i },
    });

    const mercanciaByUsername = await MSME.find({
      username: { $regex: /mercancia/i },
    });

    console.log(
      `Found ${mercanciaByName.length} MSMEs with 'mercancia' in business name`
    );
    console.log(
      `Found ${mercanciaByUsername.length} MSMEs with 'mercancia' in username`
    );

    if (mercanciaByName.length > 0) {
      console.log("\n📋 Mercancia MSMEs by business name:");
      mercanciaByName.forEach((msme) => {
        console.log(`   - Username: ${msme.username}`);
        console.log(`   - Business Name: ${msme.businessName}`);
        console.log(`   - ID: ${msme._id}`);
      });
    }

    if (mercanciaByUsername.length > 0) {
      console.log("\n📋 Mercancia MSMEs by username:");
      mercanciaByUsername.forEach((msme) => {
        console.log(`   - Username: ${msme.username}`);
        console.log(`   - Business Name: ${msme.businessName}`);
        console.log(`   - ID: ${msme._id}`);
      });
    }
  } catch (error) {
    console.error("❌ Error checking MSME user:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}
