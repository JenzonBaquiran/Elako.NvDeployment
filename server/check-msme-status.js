const mongoose = require("mongoose");
const MSME = require("./models/msme.model.js");

async function checkMsmeStatus() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to database");

    const msmes = await MSME.find({});
    console.log("Total MSMEs:", msmes.length);

    msmes.forEach((msme) => {
      console.log(`- ${msme.businessName}: status='${msme.status}'`);
    });

    // Count by status
    const statusCounts = {};
    msmes.forEach((msme) => {
      statusCounts[msme.status] = (statusCounts[msme.status] || 0) + 1;
    });

    console.log("\nStatus counts:", statusCounts);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkMsmeStatus();
