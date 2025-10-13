const mongoose = require("mongoose");
const PageView = require("./models/pageview.model");
const MSME = require("./models/msme.model");
const Customer = require("./models/customer.model");
const BadgeService = require("./services/badgeService");

async function completeTestBadge() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Get the test store and customers
    const stores = await MSME.find({ status: "approved" });
    const customers = await Customer.find({});

    if (stores.length > 0 && customers.length > 0) {
      const testStore = stores[0]; // florevo
      console.log(`Adding test page views for: ${testStore.businessName}`);

      // Add enough page views to meet the criteria (need 39 more to reach 50)
      const viewsNeeded = 50; // Start fresh, aim for 50 total

      for (let i = 0; i < viewsNeeded; i++) {
        const randomCustomer = customers[i % customers.length];
        try {
          await PageView.recordView(testStore._id, randomCustomer._id);
        } catch (error) {
          // Ignore duplicate key errors (same customer viewing same store same day)
          if (error.code !== 11000) {
            console.error("PageView error:", error);
          }
        }
      }

      console.log(`Added test page views. Now calculating badge...`);

      // Calculate the badge
      const badge = await BadgeService.calculateStoreBadge(testStore._id);

      console.log("\n🎯 Final Badge Result:");
      console.log("- Active:", badge.isActive);
      console.log("- Awarded At:", badge.awardedAt);
      console.log("- Criteria:");

      Object.entries(badge.criteria).forEach(([key, criterion]) => {
        const status = criterion.met ? "✅" : "❌";
        console.log(
          `  ${status} ${key}: ${criterion.current}/${criterion.required}`
        );
      });

      if (badge.isActive) {
        console.log(
          "\n🎉 SUCCESS! Badge is now ACTIVE and should appear in the frontend!"
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

completeTestBadge();
