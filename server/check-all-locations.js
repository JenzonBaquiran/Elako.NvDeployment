const mongoose = require("mongoose");
const MSME = require("./models/msme.model.js");
const Product = require("./models/product.model.js");
const Dashboard = require("./models/dashboard.model.js");

async function checkAllLocations() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv");

    console.log("=== ALL DASHBOARD LOCATIONS ===\n");

    const dashboards = await Dashboard.find(
      {},
      "location coordinates msmeId"
    ).populate("msmeId", "businessName");

    dashboards.forEach((dashboard, index) => {
      console.log(`${index + 1}. Dashboard ID: ${dashboard._id}`);
      console.log(
        `   MSME: ${dashboard.msmeId?.businessName || "No MSME linked"}`
      );
      console.log(`   Location: ${dashboard.location || "No location"}`);
      console.log(
        `   Coordinates: ${
          JSON.stringify(dashboard.coordinates) || "No coordinates"
        }`
      );
      console.log("");
    });

    console.log("\n=== ALL MSMES ===\n");

    const msmes = await MSME.find({}, "businessName address email");

    msmes.forEach((msme, index) => {
      console.log(`${index + 1}. Business: ${msme.businessName}`);
      console.log(`   Address: ${msme.address || "No address"}`);
      console.log(`   Email: ${msme.email || "No email"}`);
      console.log("");
    });

    console.log("\n=== PRODUCTS WITH LOCATION DATA ===\n");

    const products = await Product.find({}).populate({
      path: "msmeId",
      populate: {
        path: "msmeId",
        model: "Dashboard",
        select: "location coordinates",
      },
    });

    console.log(`Found ${products.length} products`);

    await mongoose.disconnect();
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAllLocations();
