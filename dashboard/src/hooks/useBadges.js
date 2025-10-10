import { useState, useEffect } from "react";

const useBadges = (userId, userType) => {
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState(null);

  // Fetch active badge
  const fetchBadge = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        userType === "store"
          ? `/api/badges/store/${userId}`
          : `/api/badges/customer/${userId}`;

      const response = await fetch(`http://localhost:1337${endpoint}`);
      const data = await response.json();

      if (data.success) {
        setBadge(data.badge);
      } else {
        setBadge(null);
      }
    } catch (error) {
      console.error("Error fetching badge:", error);
      setError("Failed to load badge");
      setBadge(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate/update badge
  const calculateBadge = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        userType === "store"
          ? `/api/badges/store/${userId}/calculate`
          : `/api/badges/customer/${userId}/calculate`;

      const response = await fetch(`http://localhost:1337${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setBadge(data.badge);

        // Show celebration if it's a new badge that hasn't been celebrated
        if (data.isNewBadge) {
          setShowCelebration(true);
        }
      } else {
        setError(data.message || "Failed to calculate badge");
      }
    } catch (error) {
      console.error("Error calculating badge:", error);
      setError("Failed to calculate badge");
    } finally {
      setLoading(false);
    }
  };

  // Mark celebration as shown
  const markCelebrationShown = async () => {
    if (!badge || !badge._id) return;

    try {
      const response = await fetch(
        "http://localhost:1337/api/badges/celebration-shown",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            badgeType: userType,
            badgeId: badge._id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setBadge((prev) => ({ ...prev, celebrationShown: true }));
        setShowCelebration(false);
      }
    } catch (error) {
      console.error("Error marking celebration as shown:", error);
    }
  };

  // Handle celebration close
  const closeCelebration = () => {
    setShowCelebration(false);
    markCelebrationShown();
  };

  // Auto-fetch badge when component mounts or userId changes
  useEffect(() => {
    fetchBadge();
  }, [userId, userType]);

  // Auto-calculate badge on page load (can be disabled for performance)
  const autoCalculateBadge = async () => {
    // Only auto-calculate once per session to avoid excessive API calls
    const sessionKey = `badge_calculated_${userType}_${userId}`;
    if (!sessionStorage.getItem(sessionKey)) {
      await calculateBadge();
      sessionStorage.setItem(sessionKey, "true");
    }
  };

  useEffect(() => {
    if (userId) {
      // Delay auto-calculation to avoid blocking initial render
      const timer = setTimeout(() => {
        autoCalculateBadge();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userId, userType]);

  return {
    badge,
    loading,
    error,
    showCelebration,
    fetchBadge,
    calculateBadge,
    closeCelebration,
    refreshBadge: fetchBadge,
    hasBadge: badge && badge.isActive,
    isNewBadge: badge && badge.isActive && !badge.celebrationShown,
  };
};

export default useBadges;
