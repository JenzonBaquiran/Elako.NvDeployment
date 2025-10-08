/**
 * Test script for Store Activity Email Notifications
 * This script demonstrates and tests the email notification functionality
 */

const StoreActivityNotificationService = require("./services/storeActivityNotificationService");
const { sendStoreActivityEmail } = require("./services/emailService");

// Test data
const testCustomer = {
  email: "test.customer@example.com", // Replace with your test email
  name: "John Doe",
};

const testStore = {
  businessName: "Mama's Kitchen",
  businessDescription:
    "Authentic Filipino home-cooked meals and traditional delicacies",
};

const testActivityData = {
  new_product: {
    type: "NEW_PRODUCT",
    productName: "Chicken Adobo Special",
    price: 150.0,
    description:
      "Traditional Filipino chicken adobo with steamed rice and vegetables",
    productImage: "1757534233219-611443760.jpg", // Example product image from uploads
    productUrl: "http://localhost:5173/product/test123",
  },
  price_decrease: {
    type: "PRICE_DECREASE",
    productName: "Beef Caldereta",
    oldPrice: 200.0,
    newPrice: 180.0,
    productImage: "1757534274597-100574296.jpg", // Example product image
    productUrl: "http://localhost:5173/product/test456",
  },
  price_increase: {
    type: "PRICE_INCREASE",
    productName: "Lechon Kawali",
    oldPrice: 250.0,
    newPrice: 280.0,
    productImage: "1757534290805-123508049.jpg", // Example product image
    productUrl: "http://localhost:5173/product/test789",
  },
  product_available: {
    type: "PRODUCT_AVAILABLE",
    productName: "Halo-Halo Supreme",
    price: 120.0,
    productImage: "1757534316490-717009985.jpg", // Example product image
    productUrl: "http://localhost:5173/product/test101",
  },
  new_blog_post: {
    type: "NEW_BLOG_POST",
    title: "The Secret to Perfect Adobo",
    subtitle: "Family recipe passed down through generations",
    description:
      "Discover the authentic way to cook chicken adobo that has been in our family for over 50 years. This traditional recipe uses the perfect balance of soy sauce, vinegar, and secret spices...",
    category: "TUTORIALS",
    mediaUrl: "1757534581284-89385538.jpg", // Example blog image
    mediaType: "image",
    blogUrl: "http://localhost:5173/blog/test202",
  },
  // Additional test cases for different media types
  new_blog_post_video: {
    type: "NEW_BLOG_POST",
    title: "How to Make Perfect Lumpia",
    subtitle: "Step-by-step video tutorial",
    description:
      "Watch how we make our famous lumpia from scratch. This video shows every step of the process, from preparing the filling to the perfect wrapping technique...",
    category: "TUTORIALS",
    mediaUrl: "sample-cooking-video.mp4", // Example video file
    mediaType: "video",
    blogUrl: "http://localhost:5173/blog/test203",
  },
  new_blog_post_youtube: {
    type: "NEW_BLOG_POST",
    title: "Behind the Scenes: Our Kitchen Story",
    subtitle: "Meet the team behind your favorite dishes",
    description:
      "Take a look behind the scenes of our kitchen and meet the passionate chefs who create your favorite Filipino dishes every day...",
    category: "BEHIND THE SCENES",
    mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example YouTube URL
    mediaType: "youtube",
    blogUrl: "http://localhost:5173/blog/test204",
  },
};

/**
 * Test individual email types
 */
async function testEmailTypes() {
  console.log("🧪 Testing Email Notification Types\n");

  for (const [type, activityData] of Object.entries(testActivityData)) {
    try {
      console.log(`📧 Testing ${type.toUpperCase()} email...`);

      const result = await sendStoreActivityEmail(
        testCustomer.email,
        testCustomer.name,
        testStore,
        activityData
      );

      if (result.success) {
        console.log(`✅ ${type.toUpperCase()} email sent successfully!`);
        console.log(`   Message ID: ${result.messageId}\n`);
      } else {
        console.log(`❌ ${type.toUpperCase()} email failed:`, result.error);
        console.log("");
      }

      // Wait 2 seconds between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(
        `❌ Error testing ${type.toUpperCase()} email:`,
        error.message
      );
      console.log("");
    }
  }
}

/**
 * Test email template rendering (without sending)
 */
function testEmailTemplates() {
  console.log("🎨 Testing Email Template Generation\n");

  for (const [type, activityData] of Object.entries(testActivityData)) {
    console.log(`📋 ${type.toUpperCase()} Template:`);
    console.log(
      `   Subject: ${getEmailSubject(
        testStore.businessName,
        activityData.type
      )}`
    );
    console.log(`   Activity Type: ${activityData.type}`);
    console.log(
      `   Contains Product/Content: ${
        activityData.productName || activityData.title || "N/A"
      }`
    );
    console.log("");
  }
}

/**
 * Helper function to get email subject (mimics email service logic)
 */
function getEmailSubject(storeName, activityType) {
  switch (activityType) {
    case "NEW_PRODUCT":
      return `🆕 New Product from ${storeName}!`;
    case "PRICE_INCREASE":
      return `📈 Price Update from ${storeName}`;
    case "PRICE_DECREASE":
      return `🎉 Great Deal from ${storeName}!`;
    case "PRODUCT_AVAILABLE":
      return `✅ Product Back in Stock at ${storeName}!`;
    case "NEW_BLOG_POST":
      return `📝 New Update from ${storeName}!`;
    default:
      return `Update from ${storeName}`;
  }
}

/**
 * Display test configuration
 */
function showTestConfig() {
  console.log("🔧 Test Configuration");
  console.log("=====================");
  console.log(`Test Email: ${testCustomer.email}`);
  console.log(`Test Store: ${testStore.businessName}`);
  console.log(`Test Scenarios: ${Object.keys(testActivityData).length}`);
  console.log("");

  console.log("⚠️  IMPORTANT:");
  console.log(
    "- Make sure to update testCustomer.email with your actual email address"
  );
  console.log(
    "- Ensure email service is properly configured in emailService.js"
  );
  console.log("- Check that Gmail app password is set correctly");
  console.log("");
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("🚀 Store Activity Email Notification Tests");
  console.log("==========================================\n");

  showTestConfig();

  // Test template generation (no emails sent)
  testEmailTemplates();

  // Ask user if they want to send actual emails
  console.log("📤 Ready to send test emails?");
  console.log(
    "   This will send actual emails to the configured test address."
  );
  console.log("   Make sure the email address is correct before proceeding.");
  console.log("");

  // In a real scenario, you might want to add user confirmation here
  // For now, we'll proceed with the test

  await testEmailTypes();

  console.log("🎉 Email notification tests completed!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Check your email inbox for test messages");
  console.log("2. Verify email formatting and content");
  console.log("3. Test with actual product/blog data in your application");
  console.log("4. Monitor server logs for notification activity");
}

// Export for external testing
module.exports = {
  testEmailTypes,
  testEmailTemplates,
  runTests,
  testActivityData,
  testStore,
  testCustomer,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
