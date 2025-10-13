const mongoose = require("mongoose");
const MSME = require("./models/msme.model");

async function getStoreIds() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    const stores = await MSME.find({ status: "approved" });

    console.log("Store IDs:");
    stores.forEach((store) => {
      console.log(`${store.businessName}: ${store._id}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

getStoreIds();
