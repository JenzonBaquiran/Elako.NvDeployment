// Test the actual API endpoint
async function testActualAPI() {
  try {
    const msmeId = "68ded9143255b574542dacdd";
    const url = `http://localhost:1337/api/products?msmeId=${msmeId}`;

    console.log(`🔍 Testing actual API endpoint: ${url}`);

    const response = await fetch(url);
    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();

    console.log("\n🔧 API Response:");
    console.log(`✅ Success: ${data.success}`);
    console.log(
      `📊 Number of products: ${data.products ? data.products.length : 0}`
    );

    if (data.products && data.products.length > 0) {
      console.log("\n📋 First Product from API:");
      const firstProduct = data.products[0];

      console.log(`- _id: ${firstProduct._id}`);
      console.log(`- productName: "${firstProduct.productName}"`);
      console.log(`- productName type: ${typeof firstProduct.productName}`);
      console.log(`- productName exists: ${!!firstProduct.productName}`);
      console.log(`- price: ${firstProduct.price}`);
      console.log(`- category: ${firstProduct.category}`);

      const displayName = firstProduct.productName || "Unnamed Product";
      console.log(`\n🎯 Frontend would display: "${displayName}"`);

      if (!firstProduct.productName) {
        console.log("⚠️  ISSUE: productName is missing!");
      } else {
        console.log("✅ productName is present and valid");
      }

      console.log("\n📝 Full product structure:");
      console.log("Keys:", Object.keys(firstProduct));
    } else {
      console.log("❌ No products returned from API");
    }
  } catch (error) {
    console.error("❌ Error testing API:", error.message);
  }
}

// Use fetch polyfill for Node.js
if (typeof fetch === "undefined") {
  const { default: fetch } = require("node-fetch");
  global.fetch = fetch;
}

testActualAPI();
