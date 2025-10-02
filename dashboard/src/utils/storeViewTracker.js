// Store View Tracking Utility
// This utility ensures that store views are recorded only once per session
// when a user visits a store, regardless of the entry point

export const recordStoreView = async (storeId, userId, navigate) => {
  // Only record page view for authenticated customers
  if (!userId) {
    console.log("User not authenticated, skipping view recording");
    navigate(`/customer/store/${storeId}`);
    return;
  }

  // Check if this store has already been viewed in this session
  const sessionKey = `store_viewed_${storeId}_${userId}`;
  const hasViewedInSession = sessionStorage.getItem(sessionKey);

  if (hasViewedInSession) {
    console.log(
      "Store already viewed in this session, skipping view recording"
    );
    navigate(`/customer/store/${storeId}`);
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:1337/api/stores/${storeId}/view`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: userId,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Mark this store as viewed in this session (include userId for better tracking)
      sessionStorage.setItem(sessionKey, Date.now().toString());
      console.log("Store view recorded successfully");
    } else {
      console.warn("Failed to record store view:", data.error);
    }
  } catch (error) {
    console.error("Error recording page view:", error);
  }

  // Navigate to the store page regardless of whether view recording succeeded
  navigate(`/customer/store/${storeId}`);
};

// Utility to check if a store has been viewed in the current session
export const hasViewedStoreInSession = (storeId, userId = null) => {
  if (userId) {
    const sessionKey = `store_viewed_${storeId}_${userId}`;
    return !!sessionStorage.getItem(sessionKey);
  }

  // Fallback: check for any view of this store (backwards compatibility)
  const sessionKey = `store_viewed_${storeId}`;
  return !!sessionStorage.getItem(sessionKey);
};

// Utility to clear session view tracking (useful for testing or user logout)
export const clearViewSession = (userId = null) => {
  const keys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("store_viewed_")) {
      // If userId is provided, only clear keys for that user
      if (userId) {
        if (key.endsWith(`_${userId}`)) {
          keys.push(key);
        }
      } else {
        // Clear all store view tracking keys
        keys.push(key);
      }
    }
  }
  keys.forEach((key) => sessionStorage.removeItem(key));

  if (keys.length > 0) {
    console.log(`Cleared ${keys.length} store view session entries`);
  }
};

// Auto-setup: Listen for user status changes to clear session tracking on logout
if (typeof window !== "undefined") {
  window.addEventListener("userStatusChanged", () => {
    // Small delay to ensure state has updated
    setTimeout(() => {
      const currentUser =
        localStorage.getItem("customerUser") ||
        localStorage.getItem("msmeUser") ||
        localStorage.getItem("adminUser");
      if (!currentUser) {
        // User logged out, clear all view tracking
        clearViewSession();
      }
    }, 100);
  });
}
