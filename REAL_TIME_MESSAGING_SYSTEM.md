# 🚀 ELako.Nv Real-time Messaging System

A complete real-time messaging system built with Node.js, Express, MongoDB, Socket.IO, and React that enables customers and MSME stores to communicate in real-time, even when one party is offline.

## ✨ Features

### Real-time Communication

- **Instant messaging** between customers and MSME stores
- **Real-time delivery** of messages using Socket.IO
- **Typing indicators** to show when someone is typing
- **Message read receipts** (✓✓ when read)
- **Online/offline status** indicators
- **Automatic reconnection** if connection is lost

### Offline Support

- **Message persistence** in MongoDB database
- **Offline message delivery** - messages are stored and delivered when user comes online
- **Message history** - all previous conversations are preserved
- **Conversation management** - organize messages by conversation threads

### User Experience

- **Message alignment** - sent messages on right, received on left
- **Timestamps** for all messages
- **Auto-scroll** to latest message
- **Connection status** indicators
- **Responsive design** for mobile and desktop
- **Loading states** and error handling

## 🏗️ Architecture

### Backend Components

#### 1. Database Models

- **Message Model** (`server/models/message.model.js`)

  - Stores individual messages with sender/receiver info
  - Includes read status, timestamps, and message content
  - Supports different message types (text, image, file)

- **Conversation Model** (`server/models/conversation.model.js`)
  - Manages conversation threads between participants
  - Tracks last message and activity timestamps
  - Handles participant management and conversation state

#### 2. Socket.IO Server (`server/index.js`)

```javascript
// Real-time events handled:
- 'join_user_room' - User joins their personal notification room
- 'join_conversation' - User joins specific conversation room
- 'send_message' - Send a message to conversation participants
- 'typing' / 'stop_typing' - Typing indicator events
- 'mark_messages_read' - Mark messages as read
```

#### 3. REST API Endpoints

```javascript
POST   /api/conversations                    // Create or get conversation
GET    /api/users/:userId/conversations      // Get user's conversations
GET    /api/conversations/:id/messages       // Get conversation messages
POST   /api/conversations/:id/messages       // Send message (HTTP fallback)
PATCH  /api/conversations/:id/read           // Mark messages as read
GET    /api/users/:userId/unread-count       // Get unread message count
```

### Frontend Components

#### 1. Socket Service (`dashboard/src/utils/socketService.js`)

- Manages Socket.IO connection lifecycle
- Handles connection/disconnection events
- Provides methods for sending messages and joining rooms
- Singleton pattern for consistent connection state

#### 2. Message Service (`dashboard/src/utils/messageService.js`)

- HTTP API calls for message operations
- Conversation management
- Fallback for when Socket.IO is unavailable
- Error handling and retry logic

#### 3. React Components

- **MsmeMessage.jsx** - MSME store messaging interface
- **CustomerMessage.jsx** - Customer messaging interface
- Real-time state management with React hooks
- Optimistic UI updates for better user experience

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Installation

1. **Clone and navigate to the project**

```bash
cd ELako.Nv
```

2. **Install backend dependencies**

```bash
cd server
npm install
```

3. **Install frontend dependencies**

```bash
cd ../dashboard
npm install
```

### Running the Application

1. **Start MongoDB** (make sure it's running on default port 27017)

2. **Start the backend server with Socket.IO**

```bash
cd server
node index.js
```

You should see:

```
🚀 Server running at http://localhost:1337
🔌 Socket.IO enabled for real-time messaging
✅ Connected to MongoDB
```

3. **Start the frontend development server**

```bash
cd dashboard
npm run dev  # or npm start
```

4. **Test the messaging system**
   Open `messaging-test.html` in your browser to test the real-time messaging functionality.

## 🧪 Testing the System

### Using the Test Page

1. Open `messaging-test.html` in multiple browser tabs
2. Set different User IDs and user types (customer/msme)
3. Connect and create test conversations
4. Send messages between tabs to see real-time communication

### Key Test Scenarios

- **Real-time delivery**: Send messages between tabs instantly
- **Offline messages**: Close one tab, send messages, reopen to see delivery
- **Typing indicators**: Type in one tab to see indicator in another
- **Connection handling**: Refresh page to test reconnection
- **Message persistence**: All messages are saved in MongoDB

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ElakoNv
PORT=1337
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Socket.IO Configuration

```javascript
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

## 📱 Usage Examples

### Customer Starting a Conversation

```javascript
// Create conversation with a store
const conversation = await messageService.createOrGetConversation(
  customerId,
  "Customer",
  storeId,
  "MSME"
);

// Send a message
socketService.sendMessage({
  conversationId: conversation._id,
  senderId: customerId,
  senderModel: "Customer",
  receiverId: storeId,
  receiverModel: "MSME",
  message: "Hi! I'm interested in your products.",
  tempId: Date.now().toString(),
});
```

### MSME Store Responding

```javascript
// Join conversation room for real-time updates
socketService.joinConversation(conversationId);

// Send response
socketService.sendMessage({
  conversationId,
  senderId: storeId,
  senderModel: "MSME",
  receiverId: customerId,
  receiverModel: "Customer",
  message: "Hello! Thanks for your interest. How can I help you?",
  tempId: Date.now().toString(),
});
```

## 🎨 Customization

### Styling

- Modify CSS files in `dashboard/src/css/`
- **MsmeMessage.css** - MSME store interface styles
- **CustomerMessage.css** - Customer interface styles
- Responsive design with mobile-first approach

### Message Types

Extend the system to support different message types:

```javascript
// In message model
messageType: {
  type: String,
  enum: ['text', 'image', 'file', 'product', 'order'],
  default: 'text'
}
```

### Notifications

Add push notifications or email alerts:

```javascript
// Listen for new messages when user is offline
socket.on("new_message_notification", (data) => {
  if (!document.hasFocus()) {
    new Notification(`New message from ${data.sender.name}`, {
      body: data.message,
      icon: "/favicon.ico",
    });
  }
});
```

## 🔒 Security Considerations

### Authentication

- Implement JWT tokens for user authentication
- Validate user permissions before joining conversations
- Rate limiting for message sending

### Data Validation

- Sanitize message content to prevent XSS
- Validate conversation participants
- Implement message length limits

### Privacy

- Encrypt sensitive messages
- Implement message deletion/archiving
- User blocking functionality

## 📊 Performance Optimization

### Database Indexing

```javascript
// Optimized indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
conversationSchema.index({ "participants.userId": 1, lastActivity: -1 });
```

### Caching

- Implement Redis for active conversations
- Cache user online status
- Store recent messages in memory

### Scaling

- Use Socket.IO Redis adapter for multiple server instances
- Implement message queuing for high volume
- Database sharding for large message volumes

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**

- Check if MongoDB is running
- Verify server is running on correct port
- Check CORS configuration

**Messages Not Delivered**

- Confirm Socket.IO connection is established
- Check browser console for errors
- Verify conversation participants are valid

**Database Errors**

- Ensure MongoDB connection string is correct
- Check database permissions
- Verify model schemas are properly defined

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB for data persistence
- React for the user interface
- Express.js for the REST API
- The MSME community for inspiration

---

**Built with ❤️ for the MSME community in the Philippines**
