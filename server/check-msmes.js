const mongoose = require("mongoose");
const MSME = require("./models/msme.model");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/elako_nv");

async function checkMSMEs() {
  try {
    const msmes = await MSME.find({});
    console.log(`Found ${msmes.length} MSMEs in database:`);

    msmes.forEach((msme, index) => {
      console.log(
        `${index + 1}. ${msme.businessName} (${msme.username}) - Status: ${
          msme.status
        }`
      );
    });

    // Update first MSME to approved if none are approved
    const approvedMSME = await MSME.findOne({ status: "approved" });
    if (!approvedMSME && msmes.length > 0) {
      await MSME.findByIdAndUpdate(msmes[0]._id, { status: "approved" });
      console.log(`\nUpdated ${msmes[0].businessName} to approved status.`);
    }
  } catch (error) {
    console.error("Error checking MSMEs:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkMSMEs();
