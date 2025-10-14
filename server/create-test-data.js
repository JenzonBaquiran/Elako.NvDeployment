const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const Product = require("./models/product.model");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/ELako_Nv");

async function createTestData() {
  try {
    // Create a test MSME
    const testMSME = new MSME({
      id: "sweetdelights-001",
      username: "sweetdelights",
      email: "sweetdelights@example.com",
      password: "hashedpassword123",
      businessName: "Sweet Delights Bakery",
      businessDescription: "Premium cakes and desserts made with love",
      category: "food",
      status: "approved",
      address: "Cebu City, Philippines",
      specialties: ["cakes", "desserts", "pastries"],
    });

    const savedMSME = await testMSME.save();
    console.log(`Created test MSME: ${savedMSME.businessName}`);

    // Define test products with hashtags
    const testProducts = [
      {
        productName: "Chocolate Cake",
        price: 350,
        description: "Rich chocolate cake with buttercream frosting",
        hashtags: ["cake", "chocolate", "dessert", "sweet"],
        category: "Desserts",
        msmeId: savedMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Vanilla Cupcakes",
        price: 45,
        description: "Fluffy vanilla cupcakes with colorful frosting",
        hashtags: ["cake", "vanilla", "cupcake", "dessert"],
        category: "Desserts",
        msmeId: savedMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Red Velvet Cake",
        price: 400,
        description: "Classic red velvet cake with cream cheese frosting",
        hashtags: ["cake", "redvelvet", "dessert", "special"],
        category: "Desserts",
        msmeId: savedMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Birthday Cake",
        price: 500,
        description: "Custom birthday cake with personalized decorations",
        hashtags: ["cake", "birthday", "custom", "celebration"],
        category: "Desserts",
        msmeId: savedMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Chocolate Brownies",
        price: 25,
        description: "Fudgy chocolate brownies with nuts",
        hashtags: ["chocolate", "brownies", "dessert", "nuts"],
        category: "Desserts",
        msmeId: savedMSME._id,
        availability: true,
        visible: true,
      },
    ];

    // Add test products
    const createdProducts = await Product.insertMany(testProducts);

    console.log(
      `\nSuccessfully added ${createdProducts.length} test products with hashtags:`
    );
    createdProducts.forEach((product) => {
      console.log(`- ${product.productName}: #${product.hashtags.join(" #")}`);
    });

    console.log("\nNow you can test hashtag search with:");
    console.log("- #cake (should show all cake products)");
    console.log("- #chocolate (should show chocolate cake and brownies)");
    console.log("- #dessert (should show all dessert products)");
  } catch (error) {
    console.error("Error creating test data:", error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData();
