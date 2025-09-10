import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "../css/AdminSettings.css";

const AdminSettings = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'admin-settings__content admin-settings__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'admin-settings__content admin-settings__content--sidebar-open' 
      : 'admin-settings__content admin-settings__content--sidebar-collapsed';
  };

  return (
    <div className="admin-settings">
      <AdminSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="admin-settings__header">
          <h1>Profile Settings</h1>
          <button className="admin-settings__edit-btn">Edit Profile</button>
        </div>

        <div className="admin-settings__layout">
          <section className="admin-settings__section">
            <h2>Personal Information</h2>
            <div className="admin-settings__profile-info">
              <div className="admin-settings__profile-avatar">
                <div className="admin-settings__avatar">A</div>
                <div className="admin-settings__profile-title">
                  <h3>Admin User</h3>
                  <p>baquiranjenzon@gmail.com</p>
                  <span className="admin-settings__role-badge">Admin</span>
                </div>
              </div>

              <div className="admin-settings__info-grid">
                <div className="admin-settings__info-item">
                  <label>Full Name</label>
                  <p>Admin User</p>
                </div>
                <div className="admin-settings__info-item">
                  <label>Email</label>
                  <p>baquiranjenzon@gmail.com</p>
                </div>
                <div className="admin-settings__info-item">
                  <label>Phone Number</label>
                  <p>+63 912 345 6789</p>
                </div>
                <div className="admin-settings__info-item">
                  <label>Address</label>
                  <p>123 Main Street, Makati City</p>
                </div>
              </div>

              <div className="admin-settings__bio-section">
                <label>Bio</label>
                <p>Dedicated to helping MSMEs grow and succeed on our platform.</p>
              </div>
            </div>
          </section>

          <section className="admin-settings__section">
            <h2>Statistics</h2>
            <div className="admin-settings__stats-grid">
              <div className="admin-settings__stat-item">
                <label>Total Users</label>
                <p>1,247</p>
              </div>
              <div className="admin-settings__stat-item">
                <label>Active MSMEs</label>
                <p>156</p>
              </div>
              <div className="admin-settings__stat-item">
                <label>Platform Rating</label>
                <p>4.6/5</p>
              </div>
            </div>
          </section>

          <section className="admin-settings__section">
            <h2>Account Settings</h2>
            <div className="admin-settings__account-options">
              <button className="admin-settings__settings-btn">Change Password</button>
              <button className="admin-settings__settings-btn">Privacy Settings</button>
              <button className="admin-settings__settings-btn">Notification Preferences</button>
              <button className="admin-settings__settings-btn admin-settings__settings-btn--delete">Delete Account</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
