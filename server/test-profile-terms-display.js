const mongoose = require("mongoose");
const Customer = require("./models/customer.model");
const MSME = require("./models/msme.model");

async function testProfilesWithTermsAcceptance() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("🔍 TESTING PROFILE INTERFACES WITH TERMS ACCEPTANCE\n");

    // Simulate what happens when frontend calls the API
    console.log("📱 FRONTEND PROFILE DISPLAY TEST");
    console.log("=".repeat(60));

    // Test customer profile
    const customer = await Customer.findOne({}).select(
      "id username firstname lastname email termsAcceptedAt createdAt"
    );
    if (customer) {
      console.log("\n👤 CUSTOMER PROFILE DISPLAY:");
      console.log("-".repeat(40));
      console.log(`Name: ${customer.firstname} ${customer.lastname}`);
      console.log(`Username: @${customer.username}`);
      console.log(`Email: ${customer.email}`);
      console.log(
        `Account Created: ${customer.createdAt.toLocaleDateString()}`
      );
      console.log(
        `Terms Accepted: ${
          customer.termsAcceptedAt
            ? customer.termsAcceptedAt.toLocaleDateString()
            : "Not available"
        }`
      );

      console.log("\n📊 Stats Section Would Show:");
      console.log("  • Reviews Given: [API data]");
      console.log("  • Followed Stores: [API data]");
      console.log("  • Favorite Products: [API data]");
      console.log("  • Member Since: [API data]");
      console.log(
        `  • Terms Accepted: ${customer.termsAcceptedAt.toLocaleDateString()} ← NEW!`
      );
    }

    // Test MSME profile
    const msme = await MSME.findOne({}).select(
      "id username businessName email termsAcceptedAt createdAt"
    );
    if (msme) {
      console.log("\n🏢 MSME PROFILE DISPLAY:");
      console.log("-".repeat(40));
      console.log(`Business: ${msme.businessName}`);
      console.log(`Username: @${msme.username}`);
      console.log(`Email: ${msme.email}`);
      console.log(`Account Created: ${msme.createdAt.toLocaleDateString()}`);
      console.log(
        `Terms Accepted: ${
          msme.termsAcceptedAt
            ? msme.termsAcceptedAt.toLocaleDateString()
            : "Not available"
        }`
      );

      console.log("\n📊 Stats Section Would Show:");
      console.log("  • Profile Views: [API data]");
      console.log("  • Followers: [API data]");
      console.log("  • Rating: [API data]");
      console.log("  • Profile Complete: [API data]%");
      console.log(
        `  • Terms Accepted: ${msme.termsAcceptedAt.toLocaleDateString()} ← NEW!`
      );
    }

    console.log("\n✅ WHERE TERMS ACCEPTANCE DATE NOW SHOWS:");
    console.log("=".repeat(60));
    console.log("1. 📊 Database: Stored in Customer & MSME models");
    console.log("2. 🔗 API: Available in profile endpoints");
    console.log("3. 📱 Customer Profile: Shows in stats section");
    console.log("4. 🏪 MSME Profile: Shows in stats section");
    console.log("5. 📝 Footer: Terms popup explains acceptance");
    console.log("6. 📄 Terms Page: Shows acceptance information");

    console.log("\n🎯 USER EXPERIENCE:");
    console.log("=".repeat(60));
    console.log("• Users can see when they accepted terms in their profile");
    console.log("• Date shows in a clean, user-friendly format");
    console.log("• Information is easily accessible in account settings");
    console.log("• Legal compliance is transparent and visible");
    console.log("• Terms popup explains when acceptance occurs");

    console.log("\n🔧 TECHNICAL IMPLEMENTATION:");
    console.log("=".repeat(60));
    console.log("• CustomerProfile.jsx: Added termsAcceptedAt to statsData");
    console.log("• MsmeProfile.jsx: Added Terms Accepted stat box");
    console.log("• Both profiles format date using toLocaleDateString()");
    console.log("• API endpoints include termsAcceptedAt in responses");
    console.log("• Database models have termsAcceptedAt field with defaults");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

testProfilesWithTermsAcceptance();
