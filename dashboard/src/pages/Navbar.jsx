import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SearchIcon from "@mui/icons-material/Search"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import MenuIcon from "@mui/icons-material/Menu"
import logo from "../logos/Icon on dark with text.png"
import "../css/Navbar.css"
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "../contexts/AuthContext";
import NotificationIcon from "../components/NotificationIcon";
import CustomerNotificationIcon from "../components/CustomerNotificationIcon";
import NavbarNotificationPanel from "../components/NavbarNotificationPanel";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, userType, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { showSuccess } = useNotification()

  // No need for useEffect to check localStorage since AuthContext handles it

  const handleLogout = () => {
    const logoutSuccess = logout()
    if (logoutSuccess) {
      showSuccess("You have been logged out successfully", "Goodbye!")
      navigate("/")
    }
  }

  const handleUserGreetingClick = () => {
    if (!user || !userType) return
    
    switch (userType) {
      case "customer":
        navigate("/customer-favorites")
        break
      case "admin":
        navigate("/admin-overview")
        break
      case "msme":
        navigate("/msme-dashboard")
        break
      default:
        break
    }
  }



  const getUserGreeting = () => {
    if (!user) return null
    
    let firstName = ""
    if (userType === "admin") {
      firstName = "Admin"
    } else if (userType === "customer") {
      firstName = user.firstname || user.name?.split(" ")[0] || "User"
    } else if (userType === "msme") {
      firstName = user.firstname || user.businessName?.split(" ")[0] || "Business"
    }
    
    return `Hi, ${firstName}`
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo-section">
            <img
              src={logo}
              alt="MarketHub Logo"
              className="logo-img"
              style={{ height: "2.5rem", cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for services, products, or stores..."
                className="search-input"
              />
              <button className="search-button">
                <SearchIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <div className="nav-section" style={{ left: '1.5rem' }}>
            {user ? (
              <>
                <button className="user-greeting" onClick={handleUserGreetingClick}>
                  <AccountCircleIcon fontSize="medium" style={{ marginRight: '8px' }} />
                  {getUserGreeting()}
                </button>
                <button className="nav-button nav-button-primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-button nav-button-outline" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="nav-button nav-button-primary" onClick={() => navigate('/signup')}>
                  Register
                </button>
              </>
            )}
            
            {/* Show integrated notification panel for MSME and Customer users */}
            {userType === 'msme' && user ? (
              <div className="nav-notification-wrapper">
                <NotificationIcon storeId={user._id} />
              </div>
            ) : userType === 'customer' && user ? (
              <div className="nav-notification-wrapper">
                <CustomerNotificationIcon />
              </div>
            ) : (
              <button className="nav-button nav-button-ghost">
                {/* <NotificationsIcon fontSize="medium" /> */}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon fontSize="medium" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="mobile-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
            <button className="search-button">
              <SearchIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-content">
            {/* Show notification icon for MSME and Customer users */}
            {userType === 'msme' && user ? (
              <div className="mobile-notification-wrapper">
                <NotificationIcon storeId={user._id} />
                <span className="mobile-notification-text">Notifications</span>
              </div>
            ) : userType === 'customer' && user ? (
              <div className="mobile-notification-wrapper">
                <CustomerNotificationIcon />
                <span className="mobile-notification-text">Notifications</span>
              </div>
            ) : (
              <button className="nav-button nav-button-ghost mobile-menu-button">
                <NotificationsIcon fontSize="small" />
                Notifications
              </button>
            )}


           
            {user ? (
              <>
                <button className="mobile-user-greeting" onClick={handleUserGreetingClick}>
                  <AccountCircleIcon fontSize="medium" style={{ marginRight: '8px' }} />
                  {getUserGreeting()}
                </button>
                <button className="nav-button nav-button-primary mobile-menu-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-button nav-button-outline mobile-menu-button" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="nav-button nav-button-primary mobile-menu-button" onClick={() => navigate('/signup')}>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
