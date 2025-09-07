import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/AdminSidebar.css'; // Import the CSS file for styling
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const AdminSidebar = ({ onSidebarToggle }) => {
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

  // Memoize the callback to prevent infinite re-renders
  const notifyParent = useCallback(() => {
    if (onSidebarToggle) {
      onSidebarToggle({
        isOpen: isSidebarOpen,
        isMobile: isMobileView,
        isCollapsed: !isSidebarOpen && !isMobileView
      });
    }
  }, [isSidebarOpen, isMobileView, onSidebarToggle]);

  // Notify parent component when sidebar state changes
  useEffect(() => {
    notifyParent();
  }, [notifyParent]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // You can add additional logout logic here (e.g., clear localStorage, sessionStorage, etc.)
    navigate('/');
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
          {!isMobileView && (
            <button className="admin-sidebar__desktop-toggle" onClick={toggleSidebar}>
              {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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
              <Link to="/admin-dashboard" className={`admin-sidebar__nav-link ${location.pathname === '/admin-dashboard' ? 'admin-sidebar__nav-link--active' : ''}`} title="Overview">
                <DashboardIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Overview</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/admin-user-management" className={`admin-sidebar__nav-link ${location.pathname === '/admin-user-management' ? 'admin-sidebar__nav-link--active' : ''}`} title="User Management">
                <InventoryIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">User Management</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/msme-oversight" className={`admin-sidebar__nav-link ${location.pathname === '/msme-oversight' ? 'admin-sidebar__nav-link--active' : ''}`} title="MSME Oversight">
                <ApartmentIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">MSME Oversight</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/platform-analytics" className={`admin-sidebar__nav-link ${location.pathname === '/platform-analytics' ? 'admin-sidebar__nav-link--active' : ''}`} title="Platform Analytics">
                <AnalyticsIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Platform Analytics</span>
              </Link>
            </li>
            <li className="admin-sidebar__nav-item">
              <Link to="/settings" className={`admin-sidebar__nav-link ${location.pathname === '/settings' ? 'admin-sidebar__nav-link--active' : ''}`} title="Settings">
                <SettingsIcon className="admin-sidebar__icon" />
                <span className="admin-sidebar__text">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        {(!isMobileView || isSidebarOpen) && (
          <div className="admin-sidebar__footer">
            <button className="admin-sidebar__logout-button" onClick={handleLogout}>
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