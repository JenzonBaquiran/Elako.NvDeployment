import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiCall } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // Check for different user types in localStorage
      const adminUser = localStorage.getItem('adminUser');
      const customerUser = localStorage.getItem('customerUser');
      const msmeUser = localStorage.getItem('msmeUser');

      if (adminUser) {
        const userData = JSON.parse(adminUser);
        setUser(userData);
        setUserType('admin');
        setIsAuthenticated(true);
      } else if (customerUser) {
        const userData = JSON.parse(customerUser);
        setUser(userData);
        setUserType('customer');
        setIsAuthenticated(true);
      } else if (msmeUser) {
        const userData = JSON.parse(msmeUser);
        setUser(userData);
        setUserType('msme');
        setIsAuthenticated(true);
      } else {
        // No user found
        setUser(null);
        setUserType(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear corrupted data
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData, type) => {
    try {
      // Clear any existing user data first
      clearAuthData();

      // Store new user data
      const storageKey = `${type}User`;
      localStorage.setItem(storageKey, JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setUserType(type);
      setIsAuthenticated(true);
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('userStatusChanged'));
      
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Log admin logout if user is admin
      if (userType === 'admin' && user) {
        try {
          const loginTime = sessionStorage.getItem('adminLoginTime');
          const sessionDuration = loginTime ? Date.now() - parseInt(loginTime) : null;
          
          console.log('Logging admin logout:', {
            adminId: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            sessionDuration: sessionDuration
          });
          
          const response = await apiCall('/api/admin/logout', {
            method: 'POST',
            body: JSON.stringify({
              adminId: user.id,
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              sessionDuration: sessionDuration
            }),
          });
          
          const result = await response.json();
          console.log('Logout audit log result:', result);
          
          sessionStorage.removeItem('adminLoginTime');
        } catch (auditError) {
          console.error('Error logging admin logout:', auditError);
          // Continue with logout even if audit logging fails
        }
      }
      
      // Clear all localStorage data
      clearAuthData();
      
      // Reset state
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('userStatusChanged'));
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('msmeUser');
    localStorage.removeItem('user'); // Legacy key
  };

  const updateUser = (updatedUserData) => {
    try {
      if (!userType) return false;
      
      const storageKey = `${userType}User`;
      localStorage.setItem(storageKey, JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  // Listen for storage changes (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    const handleUserStatusChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStatusChanged', handleUserStatusChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStatusChanged', handleUserStatusChange);
    };
  }, []);

  const contextValue = {
    user,
    userType,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
