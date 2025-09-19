import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useNotification } from '../components/NotificationProvider';
import { useAuth } from '../contexts/AuthContext';
import '../css/CustomerSidebar.css'; // Import the CSS file for styling
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CustomerSidebar = ({ onSidebarToggle }) => {
  const { showSuccess } = useNotification();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start with sidebar open
  const [isMobileView, setIsMobileView] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // Initialize navigate

  // Get customer data from AuthContext
  useEffect(() => {
    if (user) {
      setCustomerUser(user);
    }
  }, [user]);

  // Detect screen size and update state
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
      if (isMobile) {
        setIsSidebarOpen(false); // Start collapsed on mobile
      } else {
        setIsSidebarOpen(true); // Start expanded on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify parent component when sidebar state changes - use ref to prevent infinite loops
  const previousStateRef = useRef();
  
  useEffect(() => {
    const currentState = {
      isOpen: isSidebarOpen,
      isMobile: isMobileView,
      isCollapsed: !isSidebarOpen && !isMobileView
    };
    
    // Only notify if state actually changed
    if (onSidebarToggle && 
        (!previousStateRef.current || 
         previousStateRef.current.isOpen !== currentState.isOpen ||
         previousStateRef.current.isMobile !== currentState.isMobile ||
         previousStateRef.current.isCollapsed !== currentState.isCollapsed)) {
      
      previousStateRef.current = currentState;
      onSidebarToggle(currentState);
    }
  }, [isSidebarOpen, isMobileView, onSidebarToggle]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle icon click to expand sidebar when collapsed
  const handleIconClick = (e) => {
    if (!isMobileView && !isSidebarOpen) {
      e.preventDefault(); // Prevent navigation
      setIsSidebarOpen(true); // Expand sidebar
    }
    // If sidebar is open or on mobile, let normal navigation happen
  };

  // Handle logout with sidebar expansion check
  const handleLogoutClick = (e) => {
    if (!isMobileView && !isSidebarOpen) {
      e.preventDefault();
      setIsSidebarOpen(true);
    } else {
      handleLogout();
    }
  };

  // Handle logout
  const handleLogout = () => {
    const logoutSuccess = logout();
    if (logoutSuccess) {
      showSuccess("You have been logged out successfully", "Goodbye!");
      // Use window.location to bypass ProtectedRoute redirect
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Burger Menu for Mobile */}
      {isMobileView && !isSidebarOpen && (
        <button className="customer-sidebar-burger-menu" onClick={toggleSidebar}>
          <MenuIcon />
        </button>
      )}

      {/* Sidebar */}
      <div className={`customer-sidebar ${isMobileView ? 'customer-sidebar--mobile' : 'customer-sidebar--desktop'} ${isSidebarOpen ? 'customer-sidebar--open' : 'customer-sidebar--closed'} ${!isSidebarOpen && !isMobileView ? 'customer-sidebar--collapsed' : ''}`}>
        <div className="customer-sidebar__header">
          {isMobileView && isSidebarOpen && (
            <button className="customer-sidebar__back-arrow" onClick={toggleSidebar}>
              <ChevronLeftIcon />
            </button>
          )}
          {/* Hide desktop toggle when collapsed */}
          {!isMobileView && isSidebarOpen && (
            <button className="customer-sidebar__desktop-toggle" onClick={toggleSidebar}>
              <ChevronLeftIcon />
            </button>
          )}
          {(!isMobileView || isSidebarOpen) && (
            <div className="customer-sidebar__title">
              {customerUser ? (
                <div className="customer-sidebar__user-info">
                  <h2>{`${customerUser.firstname} ${customerUser.lastname}`}</h2>
                  <p className="customer-sidebar__username">@{customerUser.username}</p>
                </div>
              ) : (
                <h2>Customer Panel</h2>
              )}
            </div>
          )}
        </div>
        <nav className="customer-sidebar__nav">
          <ul className="customer-sidebar__nav-list">
            <li className="customer-sidebar__nav-item">
              <Link to="/" className={`customer-sidebar__nav-link ${location.pathname === '/' ? 'customer-sidebar__nav-link--active' : ''}`} title="Home" onClick={handleIconClick}>
                <HomeIcon className="customer-sidebar__icon" />
                <span className="customer-sidebar__text">Home</span>
              </Link>
            </li>
            <li className="customer-sidebar__nav-item">
              <Link to="/customer-dashboard" className={`customer-sidebar__nav-link ${location.pathname === '/customer-dashboard' ? 'customer-sidebar__nav-link--active' : ''}`} title="Dashboard" onClick={handleIconClick}>
                <DashboardIcon className="customer-sidebar__icon" />
                <span className="customer-sidebar__text">Browse Products</span>
              </Link>
            </li>
            <li className="customer-sidebar__nav-item">
              <Link to="/customer-favorites" className={`customer-sidebar__nav-link ${location.pathname === '/customer-favorites' ? 'customer-sidebar__nav-link--active' : ''}`} title="Favorites" onClick={handleIconClick}>
                <ShoppingCartIcon className="customer-sidebar__icon" />
                <span className="customer-sidebar__text">Favorites</span>
              </Link>
            </li>
            <li className="customer-sidebar__nav-item">
              <Link to="/customer-reviews" className={`customer-sidebar__nav-link ${location.pathname === '/customer-wishlist' ? 'customer-sidebar__nav-link--active' : ''}`} title="Wishlist" onClick={handleIconClick}>
                <FavoriteIcon className="customer-sidebar__icon" />
                <span className="customer-sidebar__text">My Reviews</span>
              </Link>
            </li>
            <li className="customer-sidebar__nav-item">
              <Link to="/customer-message" className={`customer-sidebar__nav-link ${location.pathname === '/customer-orders' ? 'customer-sidebar__nav-link--active' : ''}`} title="Order History" onClick={handleIconClick}>
                <HistoryIcon className="customer-sidebar__icon" />
                <span className="customer-sidebar__text">Messages</span>
              </Link>
            </li>
            <li className="customer-sidebar__nav-item">
              <Link to="/customer-profile" className={`customer-sidebar__nav-link ${location.pathname === '/customer-profile' ? 'customer-sidebar__nav-link--active' : ''}`} title="Profile" onClick={handleIconClick}>
                <SettingsIcon className="customer-sidebar__icon" />
                <span className="customer-sidebar__text">Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
        {(!isMobileView || isSidebarOpen) && (
          <div className="customer-sidebar__footer">
            <button className="customer-sidebar__logout-button" onClick={handleLogoutClick}>
              <LogoutIcon className="customer-sidebar__icon" /> 
              <span className="customer-sidebar__text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerSidebar;