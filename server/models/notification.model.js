const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Store that receives the notification
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Msme",
      required: true,
    },

    // Customer who performed the action
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Type of notification
    type: {
      type: String,
      enum: ["store_follow", "product_favorite", "new_message"],
      required: true,
    },

    // Product ID if it's a product favorite notification
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: function () {
        return this.type === "product_favorite";
      },
    },

    // Message ID for message notifications
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: function () {
        return this.type === "new_message";
      },
    },

    // Conversation ID for message notifications
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: function () {
        return this.type === "new_message";
      },
    },

    // Notification message
    message: {
      type: String,
      required: true,
    },

    // Whether the notification has been read
    isRead: {
      type: Boolean,
      default: false,
    },

    // When the notification was created
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ storeId: 1, createdAt: -1 });
notificationSchema.index({ storeId: 1, isRead: 1 });

// Static method to create new message notification for MSME
notificationSchema.statics.createNewMessageNotification = async function (
  storeId,
  customerId,
  messageId,
  conversationId,
  customerName,
  messageText
) {
  const messagePreview =
    messageText.length > 50
      ? messageText.substring(0, 50) + "..."
      : messageText;

  return this.create({
    storeId,
    customerId,
    messageId,
    conversationId,
    type: "new_message",
    message: `${customerName} sent you a message: ${messagePreview}`,
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
