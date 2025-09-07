import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SearchIcon from "@mui/icons-material/Search"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import MenuIcon from "@mui/icons-material/Menu"
import logo from "../logos/Icon on dark with text.png"
import "../css/Navbar.css"
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import { useNotification } from "../components/NotificationProvider";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const navigate = useNavigate()
  const { showSuccess } = useNotification()

  useEffect(() => {
    // Check for logged in user in localStorage
    const checkUserStatus = () => {
      const adminUser = localStorage.getItem("adminUser")
      const customerUser = localStorage.getItem("customerUser")
      const msmeUser = localStorage.getItem("msmeUser")

      if (adminUser) {
        setUser(JSON.parse(adminUser))
        setUserType("admin")
      } else if (customerUser) {
        setUser(JSON.parse(customerUser))
        setUserType("customer")
      } else if (msmeUser) {
        setUser(JSON.parse(msmeUser))
        setUserType("msme")
      } else {
        setUser(null)
        setUserType(null)
      }
    }

    // Initial check
    checkUserStatus()

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkUserStatus)
    
    // Listen for custom event (when user logs in/out in same tab)
    window.addEventListener('userStatusChanged', checkUserStatus)

    return () => {
      window.removeEventListener('storage', checkUserStatus)
      window.removeEventListener('userStatusChanged', checkUserStatus)
    }
  }, [])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("adminUser")
    localStorage.removeItem("customerUser")
    localStorage.removeItem("msmeUser")
    
    // Reset state
    setUser(null)
    setUserType(null)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userStatusChanged'))
    
    // Show success message and redirect
    showSuccess("You have been logged out successfully", "Goodbye!")
    navigate("/")
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
              style={{ height: "2.5rem" }}
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
            <button className="nav-button nav-button-ghost">
              <NotificationsIcon fontSize="medium" />
            </button>
        
            {user ? (
              <>
                <span className="user-greeting">{getUserGreeting()}</span>
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
            <button className="nav-button nav-button-ghost mobile-menu-button">
              <NotificationsIcon fontSize="small" />
              Notifications
            </button>
           
            {user ? (
              <>
                <div className="mobile-user-greeting">{getUserGreeting()}</div>
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
