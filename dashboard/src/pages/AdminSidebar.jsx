import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useNotification } from '../components/NotificationProvider';
import { useAuth } from '../contexts/AuthContext';
import '../css/AdminSidebar.css'; // Import the CSS file for styling
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
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';

const AdminSidebar = ({ onSidebarToggle }) => {
  const { showSuccess } = useNotification();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start with sidebar open
  const [isMobileView, setIsMobileView] = useState(false);
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // Initialize navigate

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
        <button className="admin-sidebar-burger-menu" onClick={toggleSidebar}>
          <MenuIcon />
        </button>
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${isMobileView ? 'admin-sidebar--mobile' : 'admin-sidebar--desktop'} ${isSidebarOpen ? 'admin-sidebar--open' : 'admin-sidebar--closed'} ${!isSidebarOpen && !isMobileView ? 'admin-sidebar--collapsed' : ''}`}>
        <div className="admin-sidebar__header">
          {isMobileView && isSidebarOpen && (
            <button className="admin-sidebar__back-arrow" onClick={toggleSidebar}>
              <ChevronLeftIcon />
            </button>
          )}
          {/* Hide desktop toggle when collapsed */}
          {!isMobileView && isSidebarOpen && (
            <button className="admin-sidebar__desktop-toggle" onClick={toggleSidebar}>
              <ChevronLeftIcon />
            </button>
          )}
          {(!isMobileView || isSidebarOpen) && (
            <div className="admin-sidebar__title">
              <h2>Admin Panel</h2>
            </div>
          )}
        </div>
        <nav className="admin-sidebar__nav">
          <ul className="admin-sidebar__nav-list">
            <li className="admin-sidebar__nav-item">
              <Link to="/" className={`admin-sidebar__nav-link ${location.pathname === '/' ? 'admin-sidebar__nav-link--active' : ''}`} title="Home" onClick={handleIconClick}>
                <HomeIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Home</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-overview" className={`admin-sidebar__nav-link ${location.pathname === '/admin-overview' ? 'admin-sidebar__nav-link--active' : ''}`} title="Overview" onClick={handleIconClick}>
                <DashboardIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Overview</span>
              </Link>
            </li>
            
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-user-management" className={`admin-sidebar__nav-link ${location.pathname === '/admin-user-management' ? 'admin-sidebar__nav-link--active' : ''}`} title="User Management" onClick={handleIconClick}>
                <InventoryIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">User Management</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-blog-management" className={`admin-sidebar__nav-link ${location.pathname === '/admin-blog-management' ? 'admin-sidebar__nav-link--active' : ''}`} title="Blog Management" onClick={handleIconClick}>
                <ArticleIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Blog Management</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-msme-oversight" className={`admin-sidebar__nav-link ${location.pathname === '/admin-msme-oversight' ? 'admin-sidebar__nav-link--active' : ''}`} title="MSME Oversight" onClick={handleIconClick}>
                <ApartmentIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">MSME Oversight</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-analytics" className={`admin-sidebar__nav-link ${location.pathname === '/admin-analytics' ? 'admin-sidebar__nav-link--active' : ''}`} title="Platform Analytics" onClick={handleIconClick}>
                <AnalyticsIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">MSME Analytics</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-settings" className={`admin-sidebar__nav-link ${location.pathname === '/settings' ? 'admin-sidebar__nav-link--active' : ''}`} title="Settings" onClick={handleIconClick}>
                <SettingsIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Settings</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-audit-logs" className={`admin-sidebar__nav-link ${location.pathname === '/admin-audit-logs' ? 'admin-sidebar__nav-link--active' : ''}`} title="Audit Logs" onClick={handleIconClick}>
                <AssignmentIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Audit Logs</span>
              </Link>
            </li>
          </ul>
        </nav>
        {(!isMobileView || isSidebarOpen) && (
          <div className="admin-sidebar__footer">
            <button className="admin-sidebar__logout-button" onClick={handleLogoutClick}>
              <LogoutIcon className="admin-sidebar__icon" /> 
              <span className="admin-sidebar__text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;