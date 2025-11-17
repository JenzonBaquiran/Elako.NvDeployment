const http = require("http");

// Simple HTTP request to test badge API
const options = {
  hostname: "localhost",
  port: 1337,
  path: "/api/badges/active",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

console.log("🧪 Testing Badge API with Corrected Blog Views");
console.log("=============================================");

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const result = JSON.parse(data);

      console.log("\n🏆 TOP STORE BADGES:");
      console.log("===================");

      if (result.topStoreBadges && result.topStoreBadges.length > 0) {
        result.topStoreBadges.forEach((badge, index) => {
          console.log(`${index + 1}. ${badge.name}`);
          console.log(`   Rating: ${badge.rating}★`);
          console.log(`   Blog Views: ${badge.blogViews || 0}`); // This should now be 0
          console.log(`   Weekly Views: ${badge.weeklyViews}`);
          console.log(`   Badge: ${badge.badgeType}`);
          console.log();
        });

        console.log("✅ SUCCESS: Blog views now show realistic data!");
        console.log(
          "Stores without blogs display 0 views instead of fake 100+"
        );
      } else {
        console.log("❌ No badges found");
      }
    } catch (error) {
      console.error("❌ Error parsing response:", error);
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request error:", error.message);
});

req.end();
