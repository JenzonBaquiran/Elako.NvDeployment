const mongoose = require("mongoose");
const Dashboard = require("./models/dashboard.model.js");

async function checkLocations() {
  try {
    await mongoose.connect("mongodb://localhost:27017/elako-nv2");

    console.log("Checking dashboard locations...\n");

    const dashboards = await Dashboard.find({}, "location coordinates").limit(
      20
    );

    console.log(`Found ${dashboards.length} dashboards:`);
    dashboards.forEach((dashboard, index) => {
      console.log(`${index + 1}. ID: ${dashboard._id}`);
      console.log(`   Location: ${dashboard.location || "No location"}`);
      console.log(
        `   Coordinates: ${dashboard.coordinates || "No coordinates"}`
      );
      console.log("");
    });

    // Check for any dashboard containing "bayombong"
    const bayombongDashboards = await Dashboard.find(
      {
        location: { $regex: /bayombong/i },
      },
      "location coordinates"
    );

    console.log(
      `\nDashboards with "bayombong" in location: ${bayombongDashboards.length}`
    );
    bayombongDashboards.forEach((dashboard, index) => {
      console.log(`${index + 1}. ID: ${dashboard._id}`);
      console.log(`   Location: ${dashboard.location}`);
      console.log(`   Coordinates: ${dashboard.coordinates}`);
    });

    await mongoose.disconnect();
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkLocations();
