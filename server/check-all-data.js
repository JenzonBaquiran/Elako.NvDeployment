const mongoose = require("mongoose");
const MSME = require("./models/msme.model.js");
const Product = require("./models/product.model.js");
const Dashboard = require("./models/dashboard.model.js");

async function checkAllData() {
  try {
    await mongoose.connect("mongodb://localhost:27017/elako-nv2");

    console.log("Checking all collections...\n");

    const msmeCount = await MSME.countDocuments();
    const productCount = await Product.countDocuments();
    const dashboardCount = await Dashboard.countDocuments();

    console.log(`MSME records: ${msmeCount}`);
    console.log(`Product records: ${productCount}`);
    console.log(`Dashboard records: ${dashboardCount}\n`);

    if (msmeCount > 0) {
      const sampleMSME = await MSME.findOne();
      console.log("Sample MSME:");
      console.log(JSON.stringify(sampleMSME, null, 2));
    }

    if (productCount > 0) {
      const sampleProduct = await Product.findOne();
      console.log("\nSample Product:");
      console.log(JSON.stringify(sampleProduct, null, 2));
    }

    if (dashboardCount > 0) {
      const sampleDashboard = await Dashboard.findOne();
      console.log("\nSample Dashboard:");
      console.log(JSON.stringify(sampleDashboard, null, 2));
    }

    await mongoose.disconnect();
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAllData();
