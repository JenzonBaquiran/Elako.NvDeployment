const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const Customer = require("./models/customer.model");

async function checkFlorevo() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Check Florevo store details
    const florevo = await MSME.findOne({ businessName: /florevo/i });

    if (florevo) {
      console.log("\n=== FLOREVO STORE DETAILS ===");
      console.log("ID:", florevo._id);
      console.log("Business Name:", florevo.businessName);
      console.log("Status:", florevo.status);
      console.log("Is Visible:", florevo.isVisible);
      console.log("Average Rating:", florevo.averageRating);
      console.log("Created At:", florevo.createdAt);
      console.log("Category:", florevo.category);
    } else {
      console.log("Florevo store not found");
    }

    // Check rocel's following status to see if he's following Florevo
    const rocel = await Customer.findOne({ email: /rocel/i }).select(
      "following email"
    );

    if (rocel) {
      console.log("\n=== ROCEL'S FOLLOWING STATUS ===");
      console.log("Customer ID:", rocel._id);
      console.log("Email:", rocel.email);
      console.log("Following:", rocel.following?.length || 0, "stores");

      if (florevo && rocel.following) {
        const isFollowingFlorevo = rocel.following.some(
          (id) => id.toString() === florevo._id.toString()
        );
        console.log("Is following Florevo:", isFollowingFlorevo);
      }
    } else {
      console.log("Rocel customer not found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkFlorevo();
