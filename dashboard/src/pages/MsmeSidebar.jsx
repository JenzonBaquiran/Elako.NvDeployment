import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useNotification } from '../components/NotificationProvider';
import { useAuth } from '../contexts/AuthContext';
import '../css/MsmeSidebar.css'; // Import the CSS file for styling
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RateReviewIcon from '@mui/icons-material/RateReview';

const MsmeSidebar = ({ onSidebarToggle }) => {
  const { showSuccess } = useNotification();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start with sidebar open
  const [isMobileView, setIsMobileView] = useState(false);
  const [msmeUser, setMsmeUser] = useState(null);
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // Initialize navigate

  // Get MSME data from AuthContext
  useEffect(() => {
    if (user) {
      setMsmeUser(user);
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
        <button className="msme-sidebar-burger-menu" onClick={toggleSidebar}>
          <MenuIcon />
        </button>
      )}

      {/* Sidebar */}
      <div className={`msme-sidebar ${isMobileView ? 'msme-sidebar--mobile' : 'msme-sidebar--desktop'} ${isSidebarOpen ? 'msme-sidebar--open' : 'msme-sidebar--closed'} ${!isSidebarOpen && !isMobileView ? 'msme-sidebar--collapsed' : ''}`}>
        <div className="msme-sidebar__header">
          {isMobileView && isSidebarOpen && (
            <button className="msme-sidebar__back-arrow" onClick={toggleSidebar}>
              <ChevronLeftIcon />
            </button>
          )}
          {/* Hide desktop toggle when collapsed */}
          {!isMobileView && isSidebarOpen && (
            <button className="msme-sidebar__desktop-toggle" onClick={toggleSidebar}>
              <ChevronLeftIcon />
            </button>
          )}
          {(!isMobileView || isSidebarOpen) && (
            <div className="msme-sidebar__title">
              {msmeUser ? (
                <div className="msme-sidebar__user-info">
                  <h2>{msmeUser.businessName}</h2>
                  <p className="msme-sidebar__username">@{msmeUser.username}</p>
                </div>
              ) : (
                <h2>MSME Panel</h2>
              )}
            </div>
          )}
        </div>
        <nav className="msme-sidebar__nav">
          <ul className="msme-sidebar__nav-list">
            <li className="msme-sidebar__nav-item">
              <Link to="/" className={`msme-sidebar__nav-link ${location.pathname === '/' ? 'msme-sidebar__nav-link--active' : ''}`} title="Home" onClick={handleIconClick}>
                <HomeIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Home</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-dashboard" className={`msme-sidebar__nav-link ${location.pathname === '/msme-dashboard' ? 'msme-sidebar__nav-link--active' : ''}`} title="Dashboard" onClick={handleIconClick}>
                <DashboardIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Dashboard</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-manage-product" className={`msme-sidebar__nav-link ${location.pathname === '/msme-manage-product' ? 'msme-sidebar__nav-link--active' : ''}`} title="Inventory" onClick={handleIconClick}>
                <InventoryIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Manage Product</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-reviews" className={`msme-sidebar__nav-link ${location.pathname === '/msme-reviews' ? 'msme-sidebar__nav-link--active' : ''}`} title="Reviews & Ratings" onClick={handleIconClick}>
                <RateReviewIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Reviews & Ratings</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-analytics" className={`msme-sidebar__nav-link ${location.pathname === '/msme-analytics' ? 'msme-sidebar__nav-link--active' : ''}`} title="Business" onClick={handleIconClick}>
                <ApartmentIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Growth & Analytics</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-messages" className={`msme-sidebar__nav-link ${location.pathname === '/msme-messages' ? 'msme-sidebar__nav-link--active' : ''}`} title="Messages" onClick={handleIconClick}>
                <AnalyticsIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Messages</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-profile" className={`msme-sidebar__nav-link ${location.pathname === '/msme-profile' ? 'msme-sidebar__nav-link--active' : ''}`} title="Settings" onClick={handleIconClick}>
                <SettingsIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
        {(!isMobileView || isSidebarOpen) && (
          <div className="msme-sidebar__footer">
            <button className="msme-sidebar__logout-button" onClick={handleLogoutClick}>
              <LogoutIcon className="msme-sidebar__icon" /> 
              <span className="msme-sidebar__text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MsmeSidebar;