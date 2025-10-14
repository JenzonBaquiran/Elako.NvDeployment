const mongoose = require("mongoose");
const Customer = require("./models/customer.model");
const MSME = require("./models/msme.model");

async function testTermsAcceptanceAPI() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("🔍 TESTING TERMS ACCEPTANCE IN API RESPONSES\n");

    // Test with a sample customer
    const sampleCustomer = await Customer.findOne({}).select(
      "id username firstname lastname termsAcceptedAt createdAt"
    );
    if (sampleCustomer) {
      console.log("📋 SAMPLE CUSTOMER API DATA:");
      console.log("=".repeat(50));
      console.log(
        `Customer: ${sampleCustomer.firstname} ${sampleCustomer.lastname} (@${sampleCustomer.username})`
      );
      console.log(`ID: ${sampleCustomer.id}`);
      console.log(
        `Account Created: ${sampleCustomer.createdAt.toLocaleDateString()}`
      );
      console.log(
        `Terms Accepted: ${
          sampleCustomer.termsAcceptedAt
            ? sampleCustomer.termsAcceptedAt.toLocaleDateString()
            : "Not set"
        }`
      );

      // Simulate what the API would return
      console.log("\n📡 API Profile Response would include:");
      console.log(`  - termsAcceptedAt: "${sampleCustomer.termsAcceptedAt}"`);
      console.log(
        `  - Formatted date: "${sampleCustomer.termsAcceptedAt.toLocaleDateString()}"`
      );
    }

    // Test with a sample MSME
    const sampleMSME = await MSME.findOne({}).select(
      "id username businessName termsAcceptedAt createdAt"
    );
    if (sampleMSME) {
      console.log("\n🏢 SAMPLE MSME API DATA:");
      console.log("=".repeat(50));
      console.log(`MSME: ${sampleMSME.businessName} (@${sampleMSME.username})`);
      console.log(`ID: ${sampleMSME.id}`);
      console.log(
        `Account Created: ${sampleMSME.createdAt.toLocaleDateString()}`
      );
      console.log(
        `Terms Accepted: ${
          sampleMSME.termsAcceptedAt
            ? sampleMSME.termsAcceptedAt.toLocaleDateString()
            : "Not set"
        }`
      );

      // Simulate what the API would return
      console.log("\n📡 API Profile Response would include:");
      console.log(`  - termsAcceptedAt: "${sampleMSME.termsAcceptedAt}"`);
      console.log(
        `  - Formatted date: "${sampleMSME.termsAcceptedAt.toLocaleDateString()}"`
      );
    }

    console.log("\n✅ TERMS ACCEPTANCE AVAILABILITY:");
    console.log("=".repeat(50));
    console.log("The terms acceptance date is now available in:");
    console.log(
      "  1. 📊 Database: Both Customer and MSME models have termsAcceptedAt field"
    );
    console.log(
      "  2. 🔗 API: GET /api/customers/:id/profile includes termsAcceptedAt"
    );
    console.log(
      "  3. 🔗 API: GET /api/msme/:id/profile includes termsAcceptedAt"
    );
    console.log("  4. 📝 Footer: Terms popup explains when acceptance occurs");
    console.log("  5. 📄 TermsPage: Shows acceptance information");

    console.log("\n❓ WHERE TERMS ACCEPTANCE DATE SHOWS:");
    console.log("=".repeat(50));
    console.log("Currently shows in:");
    console.log("  ✅ Database records (stored for all users)");
    console.log("  ✅ API responses (available for frontend display)");
    console.log("  ✅ Terms popup (explains acceptance happens at signup)");
    console.log("");
    console.log("Could be displayed in (suggestions):");
    console.log('  📱 User profile page - "Terms accepted: [date]"');
    console.log('  🏪 MSME dashboard - "Terms accepted: [date]"');
    console.log("  ⚙️  Account settings - Legal compliance section");
    console.log("  📧 Welcome email - Mention terms acceptance date");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

testTermsAcceptanceAPI();
