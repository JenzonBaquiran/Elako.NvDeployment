const mongoose = require("mongoose");
const PageView = require("./models/pageview.model");
const MSME = require("./models/msme.model");
const Customer = require("./models/customer.model");

async function addProfileViews() {
  try {
    console.log("👀 Adding profile views to stores...\n");

    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});
    console.log("✅ Database connected\n");

    const stores = await MSME.find({});
    const customers = await Customer.find({});

    console.log(
      `Found ${stores.length} stores and ${customers.length} customers`
    );

    for (const store of stores) {
      console.log(`Adding views for: ${store.businessName}`);

      // Mercancia Barata gets most views (highest rated)
      let viewCount = 35; // Default high views
      if (store.businessName.includes("Mercancia Barata")) {
        viewCount = 50; // Highest views for highest rated
      } else if (store.businessName.includes("florevo")) {
        viewCount = 35; // Second highest
      } else if (store.businessName.includes("Gotzest")) {
        viewCount = 28; // Third
      }

      // Create page views for the last week using different customers
      const viewPromises = [];
      for (let i = 0; i < viewCount; i++) {
        const daysAgo = Math.floor(Math.random() * 7); // Random day in last week
        const viewDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const dateString = viewDate.toISOString().split("T")[0]; // YYYY-MM-DD format

        // Use different customers for views
        const customer = customers[i % customers.length];

        try {
          // Use the PageView model's static method to record views
          await PageView.recordView(
            store._id,
            customer._id,
            `192.168.1.${Math.floor(Math.random() * 200) + 1}`,
            "Mozilla/5.0 Test Browser"
          );
        } catch (error) {
          // Ignore duplicate key errors (same customer viewing same store on same day)
          if (error.code !== 11000) {
            console.log(`    Warning: ${error.message}`);
          }
        }
      }

      console.log(`  ✅ Added up to ${viewCount} profile views`);
    }

    console.log("\n🎉 Profile views added successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📝 Database disconnected");
  }
}

addProfileViews();
