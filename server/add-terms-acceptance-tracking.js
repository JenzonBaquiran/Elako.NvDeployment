const mongoose = require("mongoose");
const Customer = require("./models/customer.model");
const MSME = require("./models/msme.model");

async function addTermsAcceptanceToExistingUsers() {
  try {
    await mongoose.connect("mongodb://localhost:27017/ElakoNv");
    console.log("🔍 ADDING TERMS ACCEPTANCE TO EXISTING USERS\n");

    // Update existing customers without termsAcceptedAt
    const customersWithoutTerms = await Customer.find({
      termsAcceptedAt: { $exists: false },
    });

    console.log(
      `📋 Found ${customersWithoutTerms.length} customers without terms acceptance date`
    );

    for (let customer of customersWithoutTerms) {
      // Set termsAcceptedAt to their original createdAt date (when they first signed up)
      customer.termsAcceptedAt = customer.createdAt;
      await customer.save();
      console.log(
        `✅ Updated customer: ${
          customer.username
        } - Terms accepted: ${customer.termsAcceptedAt.toLocaleDateString()}`
      );
    }

    // Update existing MSMEs without termsAcceptedAt
    const msmesWithoutTerms = await MSME.find({
      termsAcceptedAt: { $exists: false },
    });

    console.log(
      `\n📋 Found ${msmesWithoutTerms.length} MSMEs without terms acceptance date`
    );

    for (let msme of msmesWithoutTerms) {
      // Set termsAcceptedAt to their original createdAt date (when they first signed up)
      msme.termsAcceptedAt = msme.createdAt;
      await msme.save();
      console.log(
        `✅ Updated MSME: ${
          msme.businessName
        } - Terms accepted: ${msme.termsAcceptedAt.toLocaleDateString()}`
      );
    }

    // Show summary of all users with their terms acceptance dates
    console.log("\n📊 TERMS ACCEPTANCE SUMMARY:");
    console.log("=".repeat(60));

    const allCustomers = await Customer.find({}).select(
      "username firstname lastname termsAcceptedAt createdAt"
    );
    console.log("\n👥 CUSTOMERS:");
    allCustomers.forEach((customer, index) => {
      const name = `${customer.firstname} ${customer.lastname}`;
      const acceptanceDate = customer.termsAcceptedAt
        ? customer.termsAcceptedAt.toLocaleDateString()
        : "Not set";
      console.log(
        `${index + 1}. ${name} (@${
          customer.username
        }) - Terms accepted: ${acceptanceDate}`
      );
    });

    const allMSMEs = await MSME.find({}).select(
      "businessName username termsAcceptedAt createdAt"
    );
    console.log("\n🏢 MSMEs:");
    allMSMEs.forEach((msme, index) => {
      const acceptanceDate = msme.termsAcceptedAt
        ? msme.termsAcceptedAt.toLocaleDateString()
        : "Not set";
      console.log(
        `${index + 1}. ${msme.businessName} (@${
          msme.username
        }) - Terms accepted: ${acceptanceDate}`
      );
    });

    console.log("\n✅ Terms acceptance tracking is now active for all users!");
    console.log(
      "📝 New signups will automatically record terms acceptance date."
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

addTermsAcceptanceToExistingUsers();
