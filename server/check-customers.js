const mongoose = require("mongoose");
const MSME = require("./models/msme.model");
const Customer = require("./models/customer.model");

async function checkCustomers() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("Connected to MongoDB");

    // Find all customers to see who might be logged in
    const customers = await Customer.find({}).select(
      "email username following"
    );

    console.log("\n=== ALL CUSTOMERS ===");
    customers.forEach((customer) => {
      console.log(
        `Customer: ${customer.email || customer.username}, ID: ${
          customer._id
        }, Following: ${customer.following?.length || 0} stores`
      );
    });

    // Check Florevo store details again
    const florevo = await MSME.findOne({ businessName: /florevo/i });

    if (florevo && customers.length > 0) {
      console.log("\n=== CHECKING IF ANYONE IS FOLLOWING FLOREVO ===");
      customers.forEach((customer) => {
        if (customer.following && customer.following.length > 0) {
          const isFollowingFlorevo = customer.following.some(
            (id) => id.toString() === florevo._id.toString()
          );
          if (isFollowingFlorevo) {
            console.log(
              `${customer.email || customer.username} is following Florevo`
            );
          }
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCustomers();
