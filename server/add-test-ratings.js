const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const Product = require("./models/product.model");

async function addTestRatings() {
  try {
    console.log(
      "🔧 Adding test ratings to make stores eligible for badges...\n"
    );

    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});
    console.log("✅ Database connected\n");

    // Find Mercancia Barata store
    const mercanciaStore = await MSME.findOne({
      businessName: /Mercancia Barata/i,
    });
    if (!mercanciaStore) {
      console.log("❌ Mercancia Barata store not found");
      return;
    }

    console.log(
      `Found store: ${mercanciaStore.businessName} (${mercanciaStore._id})`
    );

    // Get products for this store
    const products = await Product.find({ msmeId: mercanciaStore._id });
    console.log(`Found ${products.length} products for this store`);

    if (products.length === 0) {
      console.log("❌ No products found for this store");
      return;
    }

    // Add high ratings to products to make store qualify
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Adding ratings to product: ${product.productName}`);

      // Add high ratings to products to make store qualify
      const ratings = [
        {
          user: "Nicolai Dela Pena",
          userId: "68bddb09925ffeb350700783",
          comment: "Excellent product!",
          rating: 5,
        },
        {
          user: "Ferylene Valentin",
          userId: "68ce67ff178e4d2540df5e4e",
          comment: "Amazing quality!",
          rating: 5,
        },
        {
          user: "Zeth Layno",
          userId: "68d43c1d960d44ca8b8fd4cc",
          comment: "Perfect!",
          rating: 5,
        },
        {
          user: "John Doe",
          userId: "68d4b16ac4ebfaeb3fa781f6",
          comment: "Great product",
          rating: 4,
        },
        {
          user: "Jane Smith",
          userId: "68d4b26fc4ebfaeb3fa78383",
          comment: "Love it!",
          rating: 5,
        },
        {
          user: "Mike Johnson",
          userId: "68deb24e716ed01a446e800a",
          comment: "Highly recommend!",
          rating: 5,
        },
        {
          user: "Sarah Brown",
          userId: "68e93649ab9caf944bb19388",
          comment: "Very good",
          rating: 4,
        },
        {
          user: "Tom Wilson",
          userId: "68ecba887a0e55e09e3ee66b",
          comment: "Outstanding!",
          rating: 5,
        },
      ];

      await Product.findByIdAndUpdate(product._id, {
        feedback: ratings,
        rating: 4.8,
      });

      console.log(`  ✅ Added ${ratings.length} ratings (average: 4.8★)`);
    }

    // Also add ratings to other stores to create competition
    const allStores = await MSME.find({});
    for (const store of allStores) {
      if (store._id.toString() === mercanciaStore._id.toString()) continue; // Skip Mercancia Barata

      const storeProducts = await Product.find({ msmeId: store._id });
      for (const product of storeProducts) {
        // Add moderate ratings (3.5-4.2 range) to other stores
        const ratings = [
          {
            user: "Customer A",
            userId: "68bddb09925ffeb350700783",
            comment: "Good product",
            rating: 4,
          },
          {
            user: "Customer B",
            userId: "68ce67ff178e4d2540df5e4e",
            comment: "Okay quality",
            rating: 3,
          },
          {
            user: "Customer C",
            userId: "68d43c1d960d44ca8b8fd4cc",
            comment: "Nice",
            rating: 4,
          },
          {
            user: "Customer D",
            userId: "68d4b16ac4ebfaeb3fa781f6",
            comment: "Average",
            rating: 3,
          },
        ];

        const avgRating = store.businessName === "florevo" ? 4.1 : 3.7; // Give florevo second place

        await Product.findByIdAndUpdate(product._id, {
          feedback: ratings,
          rating: avgRating,
        });

        console.log(
          `  ✅ Added ratings to ${store.businessName} - ${product.productName} (${avgRating}★)`
        );
      }
    }

    console.log("\n🎉 Test ratings added successfully!");
    console.log(
      "Now Mercancia Barata should qualify for Top Store badge with 4.8★ rating"
    );
    console.log("Run the badge calculation to award the badge!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📝 Database disconnected");
  }
}

addTestRatings();
