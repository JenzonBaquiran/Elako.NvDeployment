const fetch = require("node-fetch");

async function testHotPicks() {
  try {
    console.log("🔍 Testing Hot Picks API endpoint...");

    const response = await fetch("http://localhost:1337/api/hot-picks");
    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return;
    }

    const data = await response.json();

    console.log("\n🔧 Hot Picks API Response:");
    console.log(`✅ Success: ${data.success}`);
    console.log(
      `📊 Number of hot picks: ${data.products ? data.products.length : 0}`
    );
    console.log(`📝 Message: ${data.message || "No message"}`);

    if (data.products && data.products.length > 0) {
      console.log("\n📋 Hot Picks Products:");
      data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.productName || "UNNAMED"}`);
        console.log(`   - Rating: ${product.rating || "No rating"}`);
        console.log(
          `   - Store: ${product.msmeId?.businessName || "Unknown store"}`
        );
        console.log(`   - Category: ${product.category || "No category"}`);
      });
    } else {
      console.log("\n❌ No hot picks returned");
      if (data.error) {
        console.log(`Error: ${data.error}`);
      }
    }
  } catch (error) {
    console.error("❌ Error testing Hot Picks API:", error.message);
  }
}

testHotPicks();
