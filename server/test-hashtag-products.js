const mongoose = require("mongoose");
const Product = require("./models/product.model");
const MSME = require("./models/msme.model");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/elako_nv", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addTestProducts() {
  try {
    // Find an existing MSME to associate products with
    const testMSME = await MSME.findOne({ status: "approved" });

    if (!testMSME) {
      console.log(
        "No approved MSME found. Please ensure you have at least one approved store."
      );
      return;
    }

    // Define test products with hashtags
    const testProducts = [
      {
        productName: "Chocolate Cake",
        price: 350,
        description: "Rich chocolate cake with buttercream frosting",
        hashtags: ["cake", "chocolate", "dessert", "sweet"],
        category: "Desserts",
        msmeId: testMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Vanilla Cupcakes",
        price: 45,
        description: "Fluffy vanilla cupcakes with colorful frosting",
        hashtags: ["cake", "vanilla", "cupcake", "dessert"],
        category: "Desserts",
        msmeId: testMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Red Velvet Cake",
        price: 400,
        description: "Classic red velvet cake with cream cheese frosting",
        hashtags: ["cake", "redvelvet", "dessert", "special"],
        category: "Desserts",
        msmeId: testMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Birthday Cake",
        price: 500,
        description: "Custom birthday cake with personalized decorations",
        hashtags: ["cake", "birthday", "custom", "celebration"],
        category: "Desserts",
        msmeId: testMSME._id,
        availability: true,
        visible: true,
      },
      {
        productName: "Chocolate Brownies",
        price: 25,
        description: "Fudgy chocolate brownies with nuts",
        hashtags: ["chocolate", "brownies", "dessert", "nuts"],
        category: "Desserts",
        msmeId: testMSME._id,
        availability: true,
        visible: true,
      },
    ];

    // Clear existing test products (optional)
    await Product.deleteMany({
      productName: {
        $in: testProducts.map((p) => p.productName),
      },
    });

    // Add new test products
    const createdProducts = await Product.insertMany(testProducts);

    console.log(
      `Successfully added ${createdProducts.length} test products with hashtags:`
    );
    createdProducts.forEach((product) => {
      console.log(`- ${product.productName}: #${product.hashtags.join(" #")}`);
    });
  } catch (error) {
    console.error("Error adding test products:", error);
  } finally {
    mongoose.connection.close();
  }
}

addTestProducts();
