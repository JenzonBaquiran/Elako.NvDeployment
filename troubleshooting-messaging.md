# 🚨 Messaging System Troubleshooting Guide

## Problem: "Store ID: Not set" & "Customer ID: Not logged in"

### Step 1: Check User Authentication

1. **Open Browser Developer Console** (F12)
2. **Go to Application Tab** → **Local Storage** → **Check for 'user' key**
3. **Verify user data structure** should look like:
   ```json
   {
     "_id": "customer_id_here",
     "userType": "customer",
     "firstname": "John",
     "lastname": "Doe",
     "username": "johndoe"
   }
   ```

### Step 2: Test Navigation Flow

1. **Login as a customer** first at `/login`
2. **Navigate to a store page**: `/customer/store/[STORE_ID]`
3. **Click the CHAT button**
4. **Check console logs** for:
   ```
   🔍 Chat button clicked - Debug info:
   🔍 URL Debug - CustomerMessage:
   🔍 Checking user authentication...
   ```

### Step 3: Test Direct URL Access

Try accessing the message page directly with a store ID:

```
http://localhost:5174/customer-message/[ACTUAL_STORE_ID]
```

Replace `[ACTUAL_STORE_ID]` with a real store ID from your database.

### Step 4: Check Server Connection

1. **Verify backend server is running** on port 1337
2. **Test API endpoint directly**:
   ```
   GET http://localhost:1337/api/stores
   ```
3. **Check browser network tab** for failed API calls

### Step 5: Debug Socket Connection

Look for these console messages:

- `✅ Connected to messaging server`
- `❌ Disconnected from messaging server`

### Step 6: Manual Testing Commands

Open browser console and run:

```javascript
// Check if user is in localStorage
console.log("User data:", localStorage.getItem("user"));

// Check current URL parameters
console.log("URL params:", window.location.pathname, window.location.search);

// Check if socket service is loaded
console.log("Socket service:", window.socketService);
```

### Step 7: Common Fixes

**Fix 1: Clear Browser Data**

- Clear localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R

**Fix 2: Check Route Configuration**
Verify App.jsx has this route:

```jsx
<Route
  path="/customer-message/:storeId"
  element={
    <ProtectedRoute allowedUserTypes={["customer"]}>
      <CustomerMessage />
    </ProtectedRoute>
  }
/>
```

**Fix 3: Database Store ID Check**
Make sure the store ID in the URL actually exists in your database.

## Expected Working Flow

1. **Login** → Customer data saved to localStorage
2. **Visit Store** → Store data loaded, storeId captured
3. **Click Chat** → Navigate to `/customer-message/:storeId`
4. **Auto-create Conversation** → API call to create/get conversation
5. **Connect Socket** → Real-time messaging enabled
6. **Ready to Chat** → UI shows conversation interface

## Debug Output You Should See

```
🔍 Chat button clicked - Debug info: { user: true, storeId: "...", storeName: "..." }
🔍 URL Debug - CustomerMessage: { storeId: "...", pathname: "/customer-message/..." }
✅ Setting current user: { id: "...", userType: "Customer" }
🏪 Auto-creating conversation with MSME store ID: ...
✅ Conversation created/found: { _id: "..." }
✅ Connected to messaging server
```

## If Still Not Working

1. **Share console logs** - Copy all console output and error messages
2. **Check network tab** - Look for failed API requests
3. **Verify database data** - Ensure stores and customers exist
4. **Test with sample data** - Create a test customer and store

## Test Store IDs

You can get actual store IDs by:

1. Going to `http://localhost:1337/api/stores` in browser
2. Or check your MongoDB/database directly
3. Use one of those IDs in the URL: `/customer-message/[STORE_ID]`
