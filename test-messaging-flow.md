# 🧪 Messaging Flow Test Guide

## Test Scenario: Customer Messages Store from Product Page

### Steps to Test:

1. **Login as Customer**

   - Go to `/login`
   - Login with customer credentials

2. **Browse Products**

   - Navigate to any product page `/product/:productId`
   - Verify the product has an associated MSME store

3. **Start Conversation**

   - Click the "💬 Chat with Store" button
   - Verify navigation to `/customer-message/:storeId`
   - Check console logs for MSME store ID

4. **Verify Conversation Creation**
   - Check if conversation appears in the conversations list
   - Verify store name is displayed correctly
   - Send a test message

### Expected Console Logs:

```
🏪 Auto-creating conversation with MSME store ID: [STORE_ID]
👤 Customer details: { id: [CUSTOMER_ID], type: "Customer", name: "[NAME]" }
Creating conversation with store: [STORE_ID] user: [CUSTOMER_ID]
✅ Conversation created/found: [CONVERSATION_OBJECT]
✅ Ready to chat with [STORE_NAME]!
```

### Server-Side Logs:

```
💬 Creating/Getting conversation: {
  userId: [CUSTOMER_ID],
  userModel: "Customer",
  targetId: [STORE_ID],
  targetModel: "MSME",
  customerToStore: true
}
✅ Conversation created/found: {
  conversationId: [CONVERSATION_ID],
  participants: 2,
  storeId: [STORE_ID],
  customerId: [CUSTOMER_ID]
}
```

## Test Scenario: Customer Messages Store from Store Page

### Steps to Test:

1. **Visit Store Page**

   - Navigate to `/customer/store/:storeId`
   - Verify store details are loaded

2. **Start Conversation**
   - Click the "CHAT" button
   - Verify navigation and conversation creation

### What to Verify:

✅ MSME Store ID is correctly fetched from:

- Product details: `product.msmeId._id`
- Store page: URL parameter `storeId`

✅ Conversation is created between:

- Customer (userModel: "Customer")
- MSME Store (userModel: "MSME")

✅ Real-time messaging works:

- Messages send/receive properly
- Socket.IO connection established
- Typing indicators work

✅ Store information displays:

- Store name in conversation list
- Store avatar/icon
- Last message preview
