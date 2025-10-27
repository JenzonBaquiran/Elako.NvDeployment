const mongoose = require("mongoose");
const MSME = require("./models/msme.model");

// Sample Philippine municipalities
const sampleMunicipalities = [
  "Quezon City",
  "Manila",
  "Makati",
  "Taguig",
  "Pasig",
  "Marikina",
  "San Juan",
  "Mandaluyong",
  "Muntinlupa",
  "Parañaque",
  "Las Piñas",
  "Caloocan",
  "Valenzuela",
  "Malabon",
  "Navotas",
  "Pasay",
  "Pateros",
  "Antipolo",
  "Cainta",
  "Taytay",
];

async function addMunicipalityData() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/elako");
    console.log("✅ Connected to MongoDB");

    // Get all MSMEs that don't have municipality data
    const msmes = await MSME.find({
      $or: [
        { municipality: { $exists: false } },
        { municipality: "" },
        { municipality: null },
      ],
    });

    console.log(`\n📊 Found ${msmes.length} MSMEs without municipality data`);

    if (msmes.length === 0) {
      console.log("✅ All MSMEs already have municipality data");
      return;
    }

    console.log("\n🏙️ Adding municipality data to MSMEs...");

    for (let i = 0; i < msmes.length; i++) {
      const msme = msmes[i];

      // Assign a random municipality
      const randomMunicipality =
        sampleMunicipalities[
          Math.floor(Math.random() * sampleMunicipalities.length)
        ];

      // Update the MSME
      await MSME.findByIdAndUpdate(msme._id, {
        municipality: randomMunicipality,
        // Also update address if it's empty to include the municipality
        ...((!msme.address || msme.address.trim() === "") && {
          address: `${randomMunicipality}, Metro Manila`,
        }),
      });

      console.log(
        `   ✅ Updated ${msme.businessName} (${msme.username}) -> ${randomMunicipality}`
      );
    }

    console.log("\n📈 Summary of municipality distribution:");

    // Show distribution
    const distribution = {};
    const allUpdatedMSMEs = await MSME.find({ municipality: { $ne: "" } });

    allUpdatedMSMEs.forEach((msme) => {
      const municipality = msme.municipality;
      distribution[municipality] = (distribution[municipality] || 0) + 1;
    });

    Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .forEach(([municipality, count]) => {
        console.log(`   ${municipality}: ${count} MSMEs`);
      });

    console.log(
      `\n✅ Successfully updated ${msmes.length} MSMEs with municipality data`
    );
    console.log("🎯 You can now test municipality-based search!");
  } catch (error) {
    console.error("❌ Error adding municipality data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the function
addMunicipalityData();
