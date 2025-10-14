const mongoose = require("mongoose");
const MSME = require("./models/msme.model");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/elako", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkCurrentUser() {
  try {
    console.log("=== CHECKING USER ===");

    // Find MSMEs that might match "Mercancia Barata"
    const msmes = await MSME.find({});
    console.log("All MSMEs in database:");

    msmes.forEach((msme, index) => {
      console.log(`${index + 1}. ID: ${msme._id}`);
      console.log(`   Business Name: ${msme.businessName}`);
      console.log(`   Username: ${msme.username}`);
      console.log(`   Email: ${msme.email}`);
      console.log("   ---");
    });

    // Check if there's an MSME with "Mercancia Barata" business name
    const mercancia = await MSME.findOne({ businessName: "Mercancia Barata" });
    if (mercancia) {
      console.log("Found 'Mercancia Barata' MSME:", mercancia._id);
    } else {
      console.log("No MSME with business name 'Mercancia Barata' found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkCurrentUser();
