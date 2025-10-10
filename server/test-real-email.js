const { sendWelcomeEmail } = require("./services/emailService");

// Quick test with a real email to verify name appears correctly
async function testRealEmail() {
  console.log("🧪 Testing Welcome Email with Real Email Address...\n");

  try {
    // Test with a real email (replace with your actual email to test)
    const result = await sendWelcomeEmail(
      "elakonv@gmail.com", // Using the system's own email for testing
      "Test User Customer",
      "customer"
    );

    if (result.success) {
      console.log("✅ Welcome email sent successfully!");
      console.log(`   Message ID: ${result.messageId}`);
      console.log("   Check your email to verify the name appears correctly!");
    } else {
      console.log("❌ Welcome email failed:");
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log("❌ Welcome email error:");
    console.log(`   Error: ${error.message}`);
  }
}

// Run the test
testRealEmail()
  .then(() => {
    console.log("\n✨ Real email test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test failed with error:", error);
    process.exit(1);
  });
