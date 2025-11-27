const mongoose = require("mongoose");

async function testAdminAPI() {
  try {
    console.log("Testing admin API endpoints after fixes...\n");

    // Test the admin badges endpoint
    const response = await fetch(
      "http://localhost:1337/api/badges/admin/stores?isActive=true"
    );
    const data = await response.json();

    console.log("=== ACTIVE BADGES FROM ADMIN API ===");
    console.log(`Success: ${data.success}`);
    console.log(`Total badges returned: ${data.badges?.length || 0}`);

    if (data.badges && data.badges.length > 0) {
      console.log("WARNING: Found active badges (should be 0 after cleanup):");
      data.badges.forEach((badge, index) => {
        const store = badge.storeId || {};
        console.log(
          `${index + 1}. ${store.businessName} - Active: ${
            badge.isActive
          } - Expires: ${badge.expiresAt}`
        );
      });
    } else {
      console.log("✅ No active badges found (correct behavior)");
    }

    // Test individual store badge endpoints for known stores
    const testStores = ["Gotzest", "Mercancia Barata", "Florevo"];

    // First get store IDs
    const storeResponse = await fetch("http://localhost:1337/api/admin/msmes");
    const storeData = await storeResponse.json();

    console.log("\n=== INDIVIDUAL STORE BADGE TESTS ===");

    if (storeData.success && storeData.msmes) {
      for (const testStoreName of testStores) {
        const store = storeData.msmes.find(
          (m) => m.businessName === testStoreName
        );
        if (store) {
          const badgeResponse = await fetch(
            `http://localhost:1337/api/badges/store/${store._id}`
          );
          const badgeData = await badgeResponse.json();

          console.log(
            `${testStoreName} (${store._id}): ${
              badgeData.success ? "Has badge" : "No badge"
            }`
          );
          if (badgeData.badge) {
            console.log(`  - Active: ${badgeData.badge.isActive}`);
            console.log(`  - Expires: ${badgeData.badge.expiresAt}`);
          }
        } else {
          console.log(`${testStoreName}: Store not found`);
        }
      }
    }
  } catch (error) {
    console.error("Error testing APIs:", error);
  }
}

testAdminAPI();
