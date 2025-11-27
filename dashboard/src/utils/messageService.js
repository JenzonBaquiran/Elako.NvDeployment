const API_BASE_URL = "http://localhost:1337/api";

class MessageService {
  // Create or get conversation between two users
  async createOrGetConversation(userId, userModel, targetId, targetModel) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userModel,
          targetId,
          targetModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create conversation");
      }

      return data.conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  // Get user's conversations
  async getUserConversations(userId, userModel) {
    try {
      console.log(
        `[MessageService] Fetching conversations for userId: ${userId}, userModel: ${userModel}`
      );

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/conversations?userModel=${userModel}`
      );

      const data = await response.json();

      console.log(
        `[MessageService] Response status: ${response.status}, data:`,
        data
      );

      if (!response.ok) {
        console.error(
          `[MessageService] API error: ${response.status} - ${
            data.message || data.error
          }`
        );
        throw new Error(
          data.message || data.error || "Failed to fetch conversations"
        );
      }

      console.log(
        `[MessageService] Successfully fetched ${
          data.conversations?.length || 0
        } conversations`
      );
      return data.conversations || [];
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      return {
        messages: data.messages,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  // Send a message (HTTP fallback)
  async sendMessage(conversationId, messageData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      return data.message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark messages as read");
      }

      return data;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/unread-count`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch unread count");
      }

      return data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete conversation");
      }

      return data;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }
}

// Create singleton instance
const messageService = new MessageService();

export default messageService;
