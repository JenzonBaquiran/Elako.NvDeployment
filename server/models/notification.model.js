const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Store that receives the notification
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Msme',
    required: true
  },
  
  // Customer who performed the action
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  // Type of notification
  type: {
    type: String,
    enum: ['store_follow', 'product_favorite'],
    required: true
  },
  
  // Product ID if it's a product favorite notification
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.type === 'product_favorite'; }
  },
  
  // Notification message
  message: {
    type: String,
    required: true
  },
  
  // Whether the notification has been read
  isRead: {
    type: Boolean,
    default: false
  },
  
  // When the notification was created
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ storeId: 1, createdAt: -1 });
notificationSchema.index({ storeId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);