const fetch = require("node-fetch");

async function testHashtagSearch() {
  try {
    const response = await fetch(
      "http://localhost:1337/api/products/search/hashtag/hoodie"
    );
    const data = await response.json();

    console.log("Hashtag search result:");
    console.log("Success:", data.success);
    console.log("Products found:", data.products?.length || 0);

    if (data.products && data.products.length > 0) {
      console.log("First product name:", data.products[0].productName);
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

testHashtagSearch();
