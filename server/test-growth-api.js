const fetch = require("node-fetch");

async function testMonthlyGrowthAPI() {
  try {
    console.log("Testing updated monthly growth API...");

    const response = await fetch(
      "http://localhost:1337/api/admin/analytics/monthly-growth"
    );
    const data = await response.json();

    if (data.success && data.monthlyData) {
      console.log("\n=== MONTHLY GROWTH DATA ===");
      console.log("Months:", data.monthlyData.months);

      data.monthlyData.stores.forEach((store) => {
        const totalViews = store.views.reduce((sum, views) => sum + views, 0);
        const latestViews = store.views[store.views.length - 1];
        const latestRating = store.ratings[store.ratings.length - 1];

        console.log(`\n--- ${store.name} ---`);
        console.log("Color:", store.color);
        console.log("Latest Rating:", latestRating);
        console.log("Latest Month Views:", latestViews);
        console.log("Total Views (12 months):", totalViews);
        console.log("Monthly Views:", store.views);
      });
    } else {
      console.log("API Error:", data);
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testMonthlyGrowthAPI();
