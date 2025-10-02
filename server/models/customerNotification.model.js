const mongoose = require("mongoose");

const customerNotificationSchema = new mongoose.Schema(
  {
    // Customer who receives the notification
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Store that triggered the notification
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MSME",
      required: true,
    },

    // Product related to the notification
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: function () {
        return ["new_product", "price_drop", "stock_alert"].includes(this.type);
      },
    },

    // Additional data for different notification types
    actionUrl: {
      type: String, // Custom URL to navigate to
      required: false,
    },

    // Action type for routing
    actionType: {
      type: String,
      enum: ["product_detail", "store_detail", "custom_url", "none"],
      default: "product_detail",
    },

    // Additional metadata for notifications
    metadata: {
      oldPrice: Number, // For price drop notifications
      newPrice: Number, // For price drop notifications
      discountPercentage: Number, // For promotion notifications
      stockLevel: Number, // For stock alerts
      orderStatus: String, // For order status updates
    },

    // Type of notification
    type: {
      type: String,
      enum: [
        "new_product",
        "price_drop",
        "stock_alert",
        "store_promotion",
        "order_status",
      ],
      required: true,
    },

    // Notification title
    title: {
      type: String,
      required: true,
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

// Indexes for efficient querying
customerNotificationSchema.index({ customerId: 1, createdAt: -1 });
customerNotificationSchema.index({ customerId: 1, isRead: 1 });
customerNotificationSchema.index({ storeId: 1 });
customerNotificationSchema.index({ productId: 1 });

// Static method to create new product notification
customerNotificationSchema.statics.createNewProductNotification =
  async function (customerId, storeId, productId, storeName, productName) {
    return this.create({
      customerId,
      storeId,
      productId,
      type: "new_product",
      title: "New Product Available!",
      message: `${storeName} has added a new product: ${productName}`,
    });
  };

// Static method to get notifications for a customer
customerNotificationSchema.statics.getCustomerNotifications = function (
  customerId,
  limit = 20,
  skip = 0
) {
  return this.find({ customerId })
    .populate("storeId", "businessname")
    .populate("productId", "productName picture price")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to mark notification as read
customerNotificationSchema.statics.markAsRead = function (
  notificationId,
  customerId
) {
  return this.findOneAndUpdate(
    { _id: notificationId, customerId },
    { isRead: true },
    { new: true }
  );
};

// Static method to mark all notifications as read for a customer
customerNotificationSchema.statics.markAllAsRead = function (customerId) {
  return this.updateMany({ customerId, isRead: false }, { isRead: true });
};

// Static method to get unread count
customerNotificationSchema.statics.getUnreadCount = function (customerId) {
  return this.countDocuments({ customerId, isRead: false });
};

module.exports = mongoose.model(
  "CustomerNotification",
  customerNotificationSchema
);
