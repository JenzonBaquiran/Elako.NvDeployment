// Test all products-related API endpoints that might be affected
async function testAllProductsEndpoints() {
  const baseUrl = "http://localhost:1337";
  const msmeId = "68ded9143255b574542dacdd";

  const endpoints = [
    { name: "All products for MSME", url: `/api/products?msmeId=${msmeId}` },
    { name: "MSME-specific products", url: `/api/msme/${msmeId}/products` },
    { name: "Available products", url: `/api/products/available` },
    { name: "All products (no filter)", url: `/api/products` },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint.name}`);
      console.log(`📡 URL: ${baseUrl}${endpoint.url}`);

      const response = await fetch(`${baseUrl}${endpoint.url}`);

      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.success && data.products) {
        console.log(`✅ Success: ${data.products.length} products returned`);

        if (data.products.length > 0) {
          const firstProduct = data.products[0];
          console.log(
            `📋 First product: "${
              firstProduct.productName || "UNNAMED"
            }" (${typeof firstProduct.productName})`
          );

          // Check if this endpoint has the same issue
          if (!firstProduct.productName) {
            console.log(
              `⚠️  ISSUE: This endpoint still has missing productName!`
            );
          } else {
            console.log(`✅ productName is correctly set`);
          }
        }
      } else {
        console.log(`❌ API Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.log(`❌ Request Error: ${error.message}`);
    }
  }
}

// Use fetch polyfill for Node.js
if (typeof fetch === "undefined") {
  const { default: fetch } = require("node-fetch");
  global.fetch = fetch;
}

testAllProductsEndpoints();
