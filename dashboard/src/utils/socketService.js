import { io } from "socket.io-client";

// Socket configuration
const SOCKET_URL = "http://localhost:1337";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect(userData) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to server");
      this.isConnected = true;

      // Join user's personal room
      if (userData) {
        this.socket.emit("join_user_room", userData);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join_conversation", conversationId);
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("send_message", messageData);
    }
  }

  // Send typing indicator
  sendTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing", data);
    }
  }

  // Stop typing indicator
  stopTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit("stop_typing", data);
    }
  }

  // Mark messages as read
  markMessagesRead(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit("mark_messages_read", data);
    }
  }

  // Listen for events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
