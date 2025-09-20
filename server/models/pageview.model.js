const mongoose = require('mongoose');

const PageViewSchema = new mongoose.Schema(
  {
    storeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MSME', 
      required: true 
    },
    customerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Customer', 
      required: true 
    },
    viewDate: { 
      type: Date, 
      required: true,
      default: Date.now
    },
    // Store the date as a string for easy daily grouping (YYYY-MM-DD format)
    dateString: { 
      type: String, 
      required: true 
    },
    ipAddress: { 
      type: String 
    },
    userAgent: { 
      type: String 
    }
  },
  { 
    collection: 'pageviews',
    timestamps: true
  }
);

// Create compound index to ensure one view per customer per store per day
PageViewSchema.index({ storeId: 1, customerId: 1, dateString: 1 }, { unique: true });

// Index for efficient querying
PageViewSchema.index({ storeId: 1, viewDate: -1 });
PageViewSchema.index({ dateString: 1 });

// Static method to record a page view
PageViewSchema.statics.recordView = async function(storeId, customerId, ipAddress = null, userAgent = null) {
  try {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Try to create a new page view record
    // If it already exists (same store, customer, date), it will be ignored due to unique index
    const pageView = new this({
      storeId,
      customerId,
      viewDate: today,
      dateString,
      ipAddress,
      userAgent
    });
    
    await pageView.save();
    return { success: true, message: 'Page view recorded' };
  } catch (error) {
    // If duplicate key error (customer already viewed this store today), that's fine
    if (error.code === 11000) {
      return { success: true, message: 'Page view already recorded for today' };
    }
    throw error;
  }
};

// Static method to get page view statistics for a store
PageViewSchema.statics.getStoreStats = async function(storeId) {
  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Get today's views
    const todayViews = await this.countDocuments({
      storeId,
      dateString: todayString
    });
    
    // Get last 7 days views
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyViews = await this.countDocuments({
      storeId,
      viewDate: { $gte: sevenDaysAgo }
    });
    
    // Get last 30 days views
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyViews = await this.countDocuments({
      storeId,
      viewDate: { $gte: thirtyDaysAgo }
    });
    
    // Get total views
    const totalViews = await this.countDocuments({ storeId });
    
    // Get daily views for the last 7 days
    const dailyViews = await this.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
          viewDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$dateString',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    return {
      today: todayViews,
      weekly: weeklyViews,
      monthly: monthlyViews,
      total: totalViews,
      dailyBreakdown: dailyViews
    };
  } catch (error) {
    throw error;
  }
};

// Static method to get unique viewers count
PageViewSchema.statics.getUniqueViewers = async function(storeId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const uniqueViewers = await this.distinct('customerId', {
      storeId,
      viewDate: { $gte: startDate }
    });
    
    return uniqueViewers.length;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('PageView', PageViewSchema);