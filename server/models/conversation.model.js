const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "participants.userModel",
        },
        userModel: {
          type: String,
          required: true,
          enum: ["Customer", "MSME"],
        },
        lastSeen: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Store conversation type for easier queries
    conversationType: {
      type: String,
      enum: ["customer_to_msme", "msme_to_customer"],
      default: "customer_to_msme",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ "participants.userId": 1, lastActivity: -1 });

// Static method to find or create conversation
conversationSchema.statics.findOrCreateConversation = async function (
  userId,
  userModel,
  targetId,
  targetModel
) {
  try {
    // Check if conversation already exists
    let conversation = await this.findOne({
      participants: {
        $all: [
          { $elemMatch: { userId: userId, userModel: userModel } },
          { $elemMatch: { userId: targetId, userModel: targetModel } },
        ],
      },
    }).populate([
      {
        path: "participants.userId",
        select: "firstname lastname businessName username email",
      },
      { path: "lastMessage" },
    ]);

    if (!conversation) {
      // Create new conversation
      conversation = new this({
        participants: [
          { userId: userId, userModel: userModel },
          { userId: targetId, userModel: targetModel },
        ],
        conversationType:
          userModel === "Customer" ? "customer_to_msme" : "msme_to_customer",
      });

      await conversation.save();

      // Populate after save
      conversation = await this.findById(conversation._id).populate([
        {
          path: "participants.userId",
          select: "firstname lastname businessName username email",
        },
        { path: "lastMessage" },
      ]);
    }

    return conversation;
  } catch (error) {
    throw new Error("Error finding or creating conversation: " + error.message);
  }
};

module.exports = mongoose.model("Conversation", conversationSchema);
