const { sendWelcomeEmail } = require("./services/emailService");

// Test function to send welcome emails
async function testWelcomeEmails() {
  console.log("🧪 Testing Welcome Email Functionality...\n");

  // Test Customer Welcome Email
  console.log("📧 Testing Customer Welcome Email...");
  try {
    const customerResult = await sendWelcomeEmail(
      "test.customer@example.com",
      "John Doe",
      "customer"
    );

    if (customerResult.success) {
      console.log("✅ Customer welcome email sent successfully!");
      console.log(`   Message ID: ${customerResult.messageId}\n`);
    } else {
      console.log("❌ Customer welcome email failed:");
      console.log(`   Error: ${customerResult.error}\n`);
    }
  } catch (error) {
    console.log("❌ Customer welcome email error:");
    console.log(`   Error: ${error.message}\n`);
  }

  // Test MSME Welcome Email
  console.log("📧 Testing MSME Welcome Email...");
  try {
    const msmeResult = await sendWelcomeEmail(
      "test.msme@example.com",
      "Sample Business Store",
      "msme"
    );

    if (msmeResult.success) {
      console.log("✅ MSME welcome email sent successfully!");
      console.log(`   Message ID: ${msmeResult.messageId}\n`);
    } else {
      console.log("❌ MSME welcome email failed:");
      console.log(`   Error: ${msmeResult.error}\n`);
    }
  } catch (error) {
    console.log("❌ MSME welcome email error:");
    console.log(`   Error: ${error.message}\n`);
  }

  console.log(
    "🔍 Test completed! Check the email addresses above for the welcome messages."
  );
  console.log("\n📝 Note: Make sure to:");
  console.log("   1. Check your Gmail app password is correctly configured");
  console.log("   2. Verify that 2FA is enabled on your Gmail account");
  console.log("   3. Check spam/junk folder if emails are not in inbox");
  console.log(
    "   4. Replace test email addresses with real ones for actual testing"
  );
}

// Run the test
testWelcomeEmails()
  .then(() => {
    console.log("\n✨ Welcome email test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test failed with error:", error);
    process.exit(1);
  });
