const mongoose = require("mongoose");
const Conversation = require("./models/conversation.model");

async function cleanupOrphanedConversations() {
  try {
    console.log("🔍 Starting cleanup of orphaned conversations...");

    // Find conversations with null participants after population
    const conversations = await Conversation.find({ isActive: true }).populate([
      {
        path: "participants.userId",
        select: "firstname lastname businessName username email",
      },
    ]);

    console.log(`📊 Total conversations found: ${conversations.length}`);

    const orphanedConversations = [];
    const validConversations = [];

    for (const conversation of conversations) {
      const hasValidParticipants = conversation.participants.some(
        (p) => p.userId && p.userId._id
      );

      if (!hasValidParticipants) {
        orphanedConversations.push(conversation);
      } else {
        validConversations.push(conversation);
      }
    }

    console.log(
      `❌ Orphaned conversations found: ${orphanedConversations.length}`
    );
    console.log(`✅ Valid conversations: ${validConversations.length}`);

    if (orphanedConversations.length > 0) {
      console.log("\n📋 Orphaned conversations details:");
      orphanedConversations.forEach((conv, index) => {
        console.log(
          `${index + 1}. ID: ${conv._id}, Participants:`,
          conv.participants.map((p) => ({
            userId: p.userId,
            userModel: p.userModel,
          }))
        );
      });

      console.log("\n🗑️ Marking orphaned conversations as inactive...");

      const orphanedIds = orphanedConversations.map((c) => c._id);
      const result = await Conversation.updateMany(
        { _id: { $in: orphanedIds } },
        { isActive: false }
      );

      console.log(
        `✅ Updated ${result.modifiedCount} conversations to inactive status`
      );
    }

    console.log("🎉 Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}

// Connect to MongoDB and run cleanup
mongoose
  .connect("mongodb://localhost:27017/elako")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    return cleanupOrphanedConversations();
  })
  .then(() => {
    mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
