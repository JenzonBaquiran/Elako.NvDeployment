const mongoose = require("mongoose");
const StoreBadge = require("./models/storeBadge.model");
const MSME = require("./models/msme.model");

async function createNextWeekBadges() {
  try {
    console.log("🏆 Creating badges for NEXT WEEK...\n");

    await mongoose.connect("mongodb://127.0.0.1:27017/ElakoNv");
    console.log("✅ Connected to MongoDB\n");

    // Clear all current active badges first
    console.log("🧹 Clearing all existing active badges...");
    await StoreBadge.updateMany({}, { isActive: false });

    // Get the top stores
    const topStoreIds = [
      "68ded9143255b574542dacdd", // Mercancia Barata
      "68bdd2b9f6471b6d7433e524", // Florevo
    ];

    // Calculate next week dates
    const now = new Date();
    const nextWeekStart = new Date(now);
    nextWeekStart.setDate(now.getDate() + (7 - now.getDay())); // Start of next week (Sunday)
    nextWeekStart.setHours(0, 0, 0, 0);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6); // End of next week (Saturday)
    nextWeekEnd.setHours(23, 59, 59, 999);

    // Badge expires 1 week after the week ends (so it lasts for the full week)
    const expiresAt = new Date(nextWeekEnd);
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log(
      `📅 Next week: ${nextWeekStart.toLocaleDateString()} - ${nextWeekEnd.toLocaleDateString()}`
    );
    console.log(`⏰ Badge expires: ${expiresAt.toLocaleString()}`);
    console.log(
      `⏳ Days until expiry: ${Math.ceil(
        (expiresAt - now) / (1000 * 60 * 60 * 24)
      )} days\n`
    );

    const weekNumber = Math.ceil(
      ((nextWeekStart - new Date(nextWeekStart.getFullYear(), 0, 1)) /
        86400000 +
        1) /
        7
    );

    let badgesCreated = 0;

    for (const storeId of topStoreIds) {
      const store = await MSME.findById(storeId);

      if (!store) {
        console.log(`❌ Store not found: ${storeId}`);
        continue;
      }

      const newBadge = new StoreBadge({
        storeId: storeId,
        weekStart: nextWeekStart,
        weekEnd: nextWeekEnd,
        weekNumber: weekNumber,
        isActive: true,
        awardedAt: now,
        expiresAt: expiresAt,
        criteria: {
          storeRating: {
            required: 4.0,
            current: 4.75, // Sample rating
          },
          profileViews: {
            required: 25,
            current: 30, // Sample views
          },
          blogViews: {
            required: 10,
            current: 0,
          },
        },
        celebrationShown: false,
      });

      await newBadge.save();
      badgesCreated++;

      console.log(`✅ Badge created for: ${store.businessName}`);
      console.log(`   - Badge ID: ${newBadge._id}`);
      console.log(`   - Store ID: ${storeId}`);
      console.log(`   - Is Active: ${newBadge.isActive}`);
      console.log(
        `   - Expires: ${new Date(newBadge.expiresAt).toLocaleString()}`
      );
      console.log(
        `   - Week: ${new Date(
          newBadge.weekStart
        ).toLocaleDateString()} - ${new Date(
          newBadge.weekEnd
        ).toLocaleDateString()}\n`
      );
    }

    console.log(
      `🎉 Successfully created ${badgesCreated} badges for next week!`
    );
    console.log("These badges will be active and visible in the frontend.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📝 Database disconnected");
  }
}

createNextWeekBadges();
