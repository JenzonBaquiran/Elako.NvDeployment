const CustomerNotification = require('../models/customerNotification.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const MSME = require('../models/msme.model');

class CustomerNotificationService {
  
  /**
   * Notify all followers of a store when a new product is added
   * @param {string} storeId - MSME store ID
   * @param {string} productId - Product ID
   */
  static async notifyFollowersOfNewProduct(storeId, productId) {
    try {
      // Get the store information
      const store = await MSME.findById(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      // Get the product information
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Find all customers following this store
      const followers = await Customer.find({ 
        following: storeId 
      }).select('_id');

      if (followers.length === 0) {
        console.log(`No followers found for store ${store.businessName}`);
        return;
      }

      // Create notifications for all followers
      const notifications = followers.map(customer => ({
        customerId: customer._id,
        storeId: storeId,
        productId: productId,
        type: 'new_product',
        title: 'New Product Available!',
        message: `${store.businessName} has added a new product: ${product.productName}`
      }));

      // Bulk insert notifications
      const result = await CustomerNotification.insertMany(notifications);
      
      console.log(`Created ${result.length} notifications for new product: ${product.productName} from ${store.businessName}`);
      return result;

    } catch (error) {
      console.error('Error notifying followers of new product:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific customer
   * @param {string} customerId - Customer ID
   * @param {number} limit - Number of notifications to fetch
   * @param {number} skip - Number of notifications to skip
   */
  static async getCustomerNotifications(customerId, limit = 20, skip = 0) {
    try {
      const notifications = await CustomerNotification.find({ customerId })
        .populate('storeId', 'businessname logo')
        .populate('productId', 'productName picture price')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      return notifications;
    } catch (error) {
      console.error('Error fetching customer notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a customer
   * @param {string} customerId - Customer ID
   */
  static async getUnreadCount(customerId) {
    try {
      const count = await CustomerNotification.countDocuments({ 
        customerId, 
        isRead: false 
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} customerId - Customer ID
   */
  static async markAsRead(notificationId, customerId) {
    try {
      const notification = await CustomerNotification.findOneAndUpdate(
        { _id: notificationId, customerId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found or does not belong to customer');
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a customer
   * @param {string} customerId - Customer ID
   */
  static async markAllAsRead(customerId) {
    try {
      const result = await CustomerNotification.updateMany(
        { customerId, isRead: false },
        { isRead: true }
      );

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup)
   * @param {number} daysOld - Delete notifications older than this many days
   */
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await CustomerNotification.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      console.log(`Cleaned up ${result.deletedCount} old customer notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old customer notifications:', error);
      throw error;
    }
  }

  /**
   * Delete a specific notification
   * @param {string} notificationId - Notification ID
   * @param {string} customerId - Customer ID
   */
  static async deleteNotification(notificationId, customerId) {
    try {
      const result = await CustomerNotification.findOneAndDelete({
        _id: notificationId,
        customerId
      });

      if (!result) {
        throw new Error('Notification not found or does not belong to customer');
      }

      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = CustomerNotificationService;