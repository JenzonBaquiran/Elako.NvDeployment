const fetch = require("node-fetch");

async function testBadgeAPI() {
  try {
    console.log("Testing badge API endpoints...\n");

    // Test active badges endpoint
    console.log("=== ACTIVE BADGES ENDPOINT ===");
    const activeResponse = await fetch(
      "http://localhost:1337/api/badges/admin/stores?isActive=true"
    );
    const activeData = await activeResponse.json();

    console.log("Response status:", activeResponse.status);
    console.log("Response data:", JSON.stringify(activeData, null, 2));

    if (activeData.success && activeData.badges.length > 0) {
      console.log("\n--- Store Data Structure ---");
      const firstBadge = activeData.badges[0];
      console.log("Badge ID:", firstBadge._id);
      console.log("Store ID Type:", typeof firstBadge.storeId);
      console.log("Store ID Value:", firstBadge.storeId);
      console.log("Is Active:", firstBadge.isActive);
      console.log("Week Start:", firstBadge.weekStart);
      console.log("Week End:", firstBadge.weekEnd);
    }

    // Test all badges endpoint
    console.log("\n\n=== ALL BADGES ENDPOINT ===");
    const allResponse = await fetch(
      "http://localhost:1337/api/badges/admin/stores"
    );
    const allData = await allResponse.json();

    console.log("Response status:", allResponse.status);
    console.log("Total badges:", allData.badges?.length || 0);
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testBadgeAPI();
