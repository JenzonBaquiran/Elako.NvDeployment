const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const PageView = require("./models/pageview.model");

async function checkPageViews() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Get florevo store
    const florevo = await MSME.findOne({ businessName: /florevo/i });

    if (florevo) {
      console.log("\n=== FLOREVO PAGEVIEW ANALYSIS ===");
      console.log("Store ID:", florevo._id);
      console.log("Business Name:", florevo.businessName);

      // Get total page views for florevo
      const totalViews = await PageView.countDocuments({
        storeId: florevo._id,
      });
      console.log("Total PageViews in database:", totalViews);

      // Get recent page views (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentViews = await PageView.countDocuments({
        storeId: florevo._id,
        viewDate: { $gte: thirtyDaysAgo },
      });
      console.log("Views in last 30 days:", recentViews);

      // Get all page views for florevo with details
      const allViews = await PageView.find({ storeId: florevo._id })
        .sort({ viewDate: -1 })
        .limit(10);

      console.log("\nRecent PageView records:");
      allViews.forEach((view, index) => {
        console.log(
          `${index + 1}. Date: ${view.viewDate}, Customer: ${
            view.customerId
          }, DateString: ${view.dateString}`
        );
      });

      // Get stats using the model method
      try {
        const stats = await PageView.getStoreStats(florevo._id);
        console.log("\nPageView Stats from model method:");
        console.log("Today:", stats.today);
        console.log("Weekly:", stats.weekly);
        console.log("Monthly:", stats.monthly);
        console.log("Total:", stats.total);
        console.log("Daily breakdown:", stats.dailyBreakdown);
      } catch (statsError) {
        console.log("Error getting stats:", statsError.message);
      }
    } else {
      console.log("Florevo store not found");
    }

    // Check all PageView collection stats
    console.log("\n=== OVERALL PAGEVIEW COLLECTION STATS ===");
    const totalPageViews = await PageView.countDocuments();
    console.log("Total PageView documents:", totalPageViews);

    // Get all stores with page views
    const storesWithViews = await PageView.aggregate([
      {
        $group: {
          _id: "$storeId",
          totalViews: { $sum: 1 },
          uniqueCustomers: { $addToSet: "$customerId" },
        },
      },
      {
        $lookup: {
          from: "msmes",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      {
        $project: {
          totalViews: 1,
          uniqueCustomers: { $size: "$uniqueCustomers" },
          storeName: { $arrayElemAt: ["$store.businessName", 0] },
        },
      },
    ]);

    console.log("\nPageViews by Store:");
    storesWithViews.forEach((store) => {
      console.log(
        `${store.storeName || "Unknown"}: ${store.totalViews} views from ${
          store.uniqueCustomers
        } unique customers`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkPageViews();
