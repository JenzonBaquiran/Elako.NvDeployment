const API_BASE_URL = "http://localhost:1337/api";

class NotificationService {
  // Get customer notifications
  async getCustomerNotifications(customerId, page = 1, limit = 20) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/${customerId}/notifications?page=${page}&limit=${limit}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      return data;
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      throw error;
    }
  }

  // Get MSME notifications
  async getMsmeNotifications(msmeId, page = 1, limit = 20) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/msme/${msmeId}/notifications?page=${page}&limit=${limit}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      return data;
    } catch (error) {
      console.error("Error fetching MSME notifications:", error);
      throw error;
    }
  }

  // Mark customer notification as read
  async markCustomerNotificationAsRead(customerId, notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/${customerId}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark notification as read");
      }

      return data;
    } catch (error) {
      console.error("Error marking customer notification as read:", error);
      throw error;
    }
  }

  // Mark MSME notification as read
  async markMsmeNotificationAsRead(msmeId, notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/msme/${msmeId}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark notification as read");
      }

      return data;
    } catch (error) {
      console.error("Error marking MSME notification as read:", error);
      throw error;
    }
  }

  // Mark all customer notifications as read
  async markAllCustomerNotificationsAsRead(customerId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/${customerId}/notifications/mark-all-read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark all notifications as read"
        );
      }

      return data;
    } catch (error) {
      console.error("Error marking all customer notifications as read:", error);
      throw error;
    }
  }

  // Mark all MSME notifications as read
  async markAllMsmeNotificationsAsRead(msmeId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/msme/${msmeId}/notifications/mark-all-read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark all notifications as read"
        );
      }

      return data;
    } catch (error) {
      console.error("Error marking all MSME notifications as read:", error);
      throw error;
    }
  }

  // Get notification icon based on type
  getNotificationIcon(type) {
    switch (type) {
      case "new_message":
        return "💬";
      case "new_product":
        return "🛍️";
      case "price_drop":
        return "💰";
      case "store_follow":
        return "👥";
      case "product_favorite":
        return "❤️";
      case "store_promotion":
        return "🎉";
      case "order_status":
        return "📦";
      default:
        return "🔔";
    }
  }

  // Format notification time
  formatNotificationTime(timestamp) {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMilliseconds = now - notificationTime;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
