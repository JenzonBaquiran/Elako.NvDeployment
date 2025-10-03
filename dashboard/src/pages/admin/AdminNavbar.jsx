import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../css/AdminNavbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <div className="admin-navbar-brand">
          <h2>ELAKO Admin</h2>
        </div>
        
        <div className="admin-navbar-links">
          <button 
            className="admin-nav-link"
            onClick={() => navigate('/admin-overview')}
          >
            Overview
          </button>
          <button 
            className="admin-nav-link"
            onClick={() => navigate('/admin-user-management')}
          >
            User Management
          </button>
          <button 
            className="admin-nav-link"
            onClick={() => navigate('/admin-blog-management')}
          >
            Blog Management
          </button>
          <button 
            className="admin-nav-link"
            onClick={() => navigate('/admin-msme-oversight')}
          >
            MSME Oversight
          </button>
          <button 
            className="admin-nav-link"
            onClick={() => navigate('/admin-analytics')}
          >
            Analytics
          </button>
          <button 
            className="admin-nav-link"
            onClick={() => navigate('/admin-settings')}
          >
            Settings
          </button>
        </div>

        <div className="admin-navbar-user">
          <span className="admin-user-name">
            Hi, {user?.firstname || 'Admin'}
          </span>
          <button 
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;