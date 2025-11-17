const mongoose = require("mongoose");
const BadgeService = require("./services/badgeService");
const CustomerBadge = require("./models/customerBadge.model");
const StoreBadge = require("./models/storeBadge.model");
const Customer = require("./models/customer.model");
const MSME = require("./models/msme.model");
const PageView = require("./models/pageview.model");
const Product = require("./models/product.model");

async function testBadgeSystem() {
  try {
    console.log("🧪 Starting comprehensive badge system test...\n");

    // Connect to database
    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv", {});
    console.log("✅ Database connected\n");

    // Test 1: Check existing badges
    console.log("📊 Test 1: Current Badge Status");
    console.log("===============================");

    const activeCustomerBadges = await CustomerBadge.countDocuments({
      isActive: true,
    });
    const activeStoreBadges = await StoreBadge.countDocuments({
      isActive: true,
    });
    const totalCustomers = await Customer.countDocuments({});
    const totalStores = await MSME.countDocuments({});

    console.log(
      `🎖️ Active Customer Badges: ${activeCustomerBadges}/${totalCustomers} (${(
        (activeCustomerBadges / totalCustomers) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `🏆 Active Store Badges: ${activeStoreBadges}/${totalStores} (${(
        (activeStoreBadges / totalStores) *
        100
      ).toFixed(1)}%)`
    );

    // Get some examples
    const exampleCustomerBadges = await CustomerBadge.find({ isActive: true })
      .populate("customerId", "firstname lastname")
      .limit(3);

    const exampleStoreBadges = await StoreBadge.find({ isActive: true })
      .populate("storeId", "businessName")
      .limit(3);

    if (exampleCustomerBadges.length > 0) {
      console.log("\n🎖️ Example Active Customer Badges:");
      exampleCustomerBadges.forEach((badge) => {
        console.log(
          `  - ${badge.customerId.firstname} ${badge.customerId.lastname}: ${badge.badgeType}`
        );
      });
    }

    if (exampleStoreBadges.length > 0) {
      console.log("\n🏆 Example Active Store Badges:");
      exampleStoreBadges.forEach((badge) => {
        console.log(`  - ${badge.storeId.businessName}: Top Store`);
      });
    }
    console.log("");

    // Test 2: Test badge calculation for specific users
    console.log("🔍 Test 2: Individual Badge Calculations");
    console.log("========================================");

    // Test customer badge calculation
    const customers = await Customer.find({}).limit(3);
    for (const customer of customers) {
      console.log(
        `Testing customer: ${customer.firstname} ${customer.lastname} (${customer._id})`
      );

      try {
        await BadgeService.calculateCustomerBadge(customer._id);
        const badge = await BadgeService.getActiveCustomerBadge(customer._id);
        console.log(
          `  Result: ${
            badge ? `✅ Has ${badge.badgeType} badge` : "❌ No badge"
          }`
        );
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }

    // Test store badge calculation
    const stores = await MSME.find({}).limit(3);
    for (const store of stores) {
      console.log(`Testing store: ${store.businessName} (${store._id})`);

      try {
        await BadgeService.calculateStoreBadge(store._id);
        const badge = await BadgeService.getActiveStoreBadge(store._id);
        console.log(
          `  Result: ${badge ? "✅ Has Top Store badge" : "❌ No badge"}`
        );
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    console.log("");

    // Test 3: Data availability check
    console.log("📊 Test 3: Data Availability Check");
    console.log("==================================");

    const totalPageViews = await PageView.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const recentPageViews = await PageView.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    console.log(`📄 Total Page Views: ${totalPageViews}`);
    console.log(`📦 Total Products: ${totalProducts}`);
    console.log(`📊 Recent Page Views (7 days): ${recentPageViews}`);
    console.log("");

    // Test 4: Process all badges
    console.log("🔄 Test 4: Process All Badges");
    console.log("=============================");

    console.log("Running badge processing for all users...");
    await BadgeService.processAllBadges();
    console.log("✅ Badge processing completed");

    // Check results
    const finalCustomerBadges = await CustomerBadge.countDocuments({
      isActive: true,
    });
    const finalStoreBadges = await StoreBadge.countDocuments({
      isActive: true,
    });

    console.log(
      `🎖️ Final Customer Badges: ${finalCustomerBadges} (change: ${
        finalCustomerBadges - activeCustomerBadges
      })`
    );
    console.log(
      `🏆 Final Store Badges: ${finalStoreBadges} (change: ${
        finalStoreBadges - activeStoreBadges
      })`
    );
    console.log("");

    // Test 5: Clean up expired badges
    console.log("🧹 Test 5: Clean Up Expired Badges");
    console.log("==================================");

    await BadgeService.cleanupExpiredBadges();
    console.log("✅ Expired badges cleaned up");
    console.log("");

    console.log("🎉 Badge system test completed successfully!");
    console.log("===========================================");
    console.log("Summary:");
    console.log(`✅ Customers tested: ${customers.length}`);
    console.log(`✅ Stores tested: ${stores.length}`);
    console.log(`🎖️ Final customer badges: ${finalCustomerBadges}`);
    console.log(`🏆 Final store badges: ${finalStoreBadges}`);
    console.log("");
    console.log(
      "🔧 You can now test the frontend buttons to see live calculations!"
    );
    console.log("📱 Use the 'Test Customer Badge' button in Customer Profile");
    console.log("🏪 Use the 'Test Store Badge' button in MSME Dashboard");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📝 Database disconnected");
  }
}

// Run the test
testBadgeSystem();
