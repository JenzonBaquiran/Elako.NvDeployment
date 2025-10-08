import { useState, useEffect } from "react";

const useAdminSession = () => {
  const [loginTime, setLoginTime] = useState(null);

  useEffect(() => {
    // Track login time when component mounts
    const currentTime = Date.now();
    setLoginTime(currentTime);

    // Store login time in sessionStorage for persistence
    sessionStorage.setItem("adminLoginTime", currentTime.toString());

    return () => {
      // Cleanup function - this will run when component unmounts
      handleLogout();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const storedLoginTime = sessionStorage.getItem("adminLoginTime");
      const currentTime = Date.now();
      const sessionDuration = storedLoginTime
        ? currentTime - parseInt(storedLoginTime)
        : null;

      // Get admin data from localStorage or context
      const adminData = JSON.parse(localStorage.getItem("user") || "{}");

      if (adminData.username) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminId: adminData.id,
            username: adminData.username,
            firstname: adminData.firstname,
            lastname: adminData.lastname,
            sessionDuration: sessionDuration,
          }),
        });
      }

      // Clear session data
      sessionStorage.removeItem("adminLoginTime");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
    } catch (error) {
      console.error("Error during logout audit logging:", error);
    }
  };

  const logout = () => {
    handleLogout();
    // Redirect to login page
    window.location.href = "/login";
  };

  return {
    logout,
    loginTime,
    sessionDuration: loginTime ? Date.now() - loginTime : 0,
  };
};

export default useAdminSession;
