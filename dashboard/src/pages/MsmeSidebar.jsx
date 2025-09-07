import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/MsmeSidebar.css'; // Import the CSS file for styling
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const MsmeSidebar = ({ onSidebarToggle }) => {
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
          {!isMobileView && (
            <button className="msme-sidebar__desktop-toggle" onClick={toggleSidebar}>
              {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
          )}
          {(!isMobileView || isSidebarOpen) && (
            <div className="msme-sidebar__title">
              <h2>MSME Panel</h2>
            </div>
          )}
        </div>
        <nav className="msme-sidebar__nav">
          <ul className="msme-sidebar__nav-list">
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-dashboard" className={`msme-sidebar__nav-link ${location.pathname === '/msme-dashboard' ? 'msme-sidebar__nav-link--active' : ''}`} title="Dashboard">
                <DashboardIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Dashboard</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-inventory" className={`msme-sidebar__nav-link ${location.pathname === '/msme-inventory' ? 'msme-sidebar__nav-link--active' : ''}`} title="Inventory">
                <InventoryIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Manage Product</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-business" className={`msme-sidebar__nav-link ${location.pathname === '/msme-business' ? 'msme-sidebar__nav-link--active' : ''}`} title="Business">
                <ApartmentIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Growth & Analytics</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-analytics" className={`msme-sidebar__nav-link ${location.pathname === '/msme-analytics' ? 'msme-sidebar__nav-link--active' : ''}`} title="Analytics">
                <AnalyticsIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Messages</span>
              </Link>
            </li>
            <li className="msme-sidebar__nav-item">
              <Link to="/msme-settings" className={`msme-sidebar__nav-link ${location.pathname === '/msme-settings' ? 'msme-sidebar__nav-link--active' : ''}`} title="Settings">
                <SettingsIcon className="msme-sidebar__icon" />
                <span className="msme-sidebar__text">Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
        {(!isMobileView || isSidebarOpen) && (
          <div className="msme-sidebar__footer">
            <button className="msme-sidebar__logout-button" onClick={handleLogout}>
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