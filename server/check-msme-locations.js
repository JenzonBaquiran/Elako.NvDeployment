const mongoose = require("mongoose");
const MSME = require("./models/msme.model.js");

async function checkMSMELocations() {
  try {
    await mongoose.connect("mongodb://localhost:27017/elako-nv2");

    console.log("Checking MSME locations...\n");

    const msmes = await MSME.find(
      {},
      "businessName address municipality"
    ).limit(20);

    console.log(`Found ${msmes.length} MSMEs:`);
    msmes.forEach((msme, index) => {
      console.log(`${index + 1}. Business: ${msme.businessName}`);
      console.log(`   Address: ${msme.address || "No address"}`);
      console.log(`   Municipality: ${msme.municipality || "No municipality"}`);
      console.log("");
    });

    // Check for any MSME containing "bayombong" in address
    const bayombongMSMEs = await MSME.find(
      {
        address: { $regex: /bayombong/i },
      },
      "businessName address municipality"
    );

    console.log(
      `\nMSMEs with "bayombong" in address: ${bayombongMSMEs.length}`
    );
    bayombongMSMEs.forEach((msme, index) => {
      console.log(`${index + 1}. Business: ${msme.businessName}`);
      console.log(`   Address: ${msme.address}`);
      console.log(`   Municipality: ${msme.municipality}`);
    });

    // Check for any MSME containing "solano" since that's in the screenshot
    const solanoMSMEs = await MSME.find(
      {
        address: { $regex: /solano/i },
      },
      "businessName address municipality"
    );

    console.log(`\nMSMEs with "solano" in address: ${solanoMSMEs.length}`);
    solanoMSMEs.forEach((msme, index) => {
      console.log(`${index + 1}. Business: ${msme.businessName}`);
      console.log(`   Address: ${msme.address}`);
      console.log(`   Municipality: ${msme.municipality}`);
    });

    await mongoose.disconnect();
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkMSMELocations();
