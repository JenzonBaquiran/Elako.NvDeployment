const mongoose = require("mongoose");
const MSME = require("./models/msme.model.js");
const Product = require("./models/product.model.js");
const Dashboard = require("./models/dashboard.model.js");

async function checkCorrectDatabase() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv");

    console.log("Checking ElakoNv database...\n");

    const msmeCount = await MSME.countDocuments();
    const productCount = await Product.countDocuments();
    const dashboardCount = await Dashboard.countDocuments();

    console.log(`MSME records: ${msmeCount}`);
    console.log(`Product records: ${productCount}`);
    console.log(`Dashboard records: ${dashboardCount}\n`);

    if (msmeCount > 0) {
      const sampleMSMEs = await MSME.find({}, "businessName address").limit(5);
      console.log("Sample MSMEs:");
      sampleMSMEs.forEach((msme, index) => {
        console.log(`${index + 1}. ${msme.businessName} - ${msme.address}`);
      });
      console.log("");
    }

    if (dashboardCount > 0) {
      const dashboards = await Dashboard.find({}, "location coordinates").limit(
        5
      );
      console.log("Sample Dashboard locations:");
      dashboards.forEach((dashboard, index) => {
        console.log(
          `${index + 1}. Location: ${dashboard.location || "No location"}`
        );
        console.log(
          `   Coordinates: ${dashboard.coordinates || "No coordinates"}`
        );
      });
      console.log("");
    }

    // Search for Solano or Bayombong
    const solanoMSMEs = await MSME.find(
      {
        address: { $regex: /solano|bayombong/i },
      },
      "businessName address"
    );

    console.log(`MSMEs with Solano or Bayombong: ${solanoMSMEs.length}`);
    solanoMSMEs.forEach((msme, index) => {
      console.log(`${index + 1}. ${msme.businessName} - ${msme.address}`);
    });

    const solanoProducts = await Product.find()
      .populate("msmeId", "businessName address")
      .limit(5);

    console.log(`\nSample products with MSME data:`);
    solanoProducts.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} - MSME: ${
          product.msmeId?.businessName
        } (${product.msmeId?.address})`
      );
    });

    await mongoose.disconnect();
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkCorrectDatabase();
