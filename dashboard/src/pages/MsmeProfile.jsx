import React, { useState } from 'react';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeProfile.css';
import profileImg from '../assets/pic.jpg';

const MsmeProfile = () => {
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });

  const handleSidebarToggle = (stateOrIsOpen, isMobile = false) => {
    // Handle both object parameter (from MsmeSidebar) and separate parameters
    if (typeof stateOrIsOpen === 'object') {
      setSidebarState({ 
        isOpen: stateOrIsOpen.isOpen, 
        isMobile: stateOrIsOpen.isMobile 
      });
    } else {
      setSidebarState({ isOpen: stateOrIsOpen, isMobile });
    }
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'msme-profile__content msme-profile__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'msme-profile__content msme-profile__content--sidebar-open' 
      : 'msme-profile__content msme-profile__content--sidebar-collapsed';
  };

  return (
    <div className="msme-profile">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-profile__header">
          <div className="msme-profile__header-content">
            <div className="msme-profile__header-text">
              <h1>Profile Settings</h1>
              <p>Manage your business profile and account settings.</p>
            </div>
            <div className="msme-profile__actions">
              <button className="msme-profile__save-btn">Save Changes</button>
              <button className="msme-profile__preview-btn">Preview Profile</button>
            </div>
          </div>
        </div>

        <div className="msme-profile__stats">
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">2,847</div>
            <div className="msme-profile__stat-label">Profile Views</div>
          </div>
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">456</div>
            <div className="msme-profile__stat-label">Followers</div>
          </div>
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">4.8</div>
            <div className="msme-profile__stat-label">Rating</div>
          </div>
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">89%</div>
            <div className="msme-profile__stat-label">Profile Complete</div>
          </div>
        </div>

        <div className="msme-profile__content-grid">
          <div className="msme-profile__card msme-profile__personal-info">
            <div className="msme-profile__card-header">
              <h3>Personal Information</h3>
              <button className="msme-profile__edit-btn">Edit</button>
            </div>
            <div className="msme-profile__info-content">
              <div className="msme-profile__avatar-section">
                <div className="msme-profile__avatar">
                  <img src={profileImg} alt="Profile" />
                </div>
                <button className="msme-profile__upload-btn">Upload Photo</button>
              </div>
              <div className="msme-profile__info-fields">
                <div className="msme-profile__field">
                  <label>Business Name</label>
                  <span>Maria's MSME</span>
                </div>
                <div className="msme-profile__field">
                  <label>Email Address</label>
                  <span>maria@msme.com</span>
                </div>
                <div className="msme-profile__field">
                  <label>Phone Number</label>
                  <span>+63 912 345 6789</span>
                </div>
                <div className="msme-profile__field">
                  <label>Business Address</label>
                  <span>123 Main Street, Makati City, Philippines</span>
                </div>
                <div className="msme-profile__field msme-profile__field--full">
                  <label>Business Description</label>
                  <span>Passionate about creating quality handmade products and supporting local communities. We specialize in traditional Filipino desserts and artisanal food products.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="msme-profile__card msme-profile__business-info">
            <div className="msme-profile__card-header">
              <h3>Business Information</h3>
              <button className="msme-profile__edit-btn">Edit</button>
            </div>
            <div className="msme-profile__business-content">
              <div className="msme-profile__field">
                <label>Business Category</label>
                <span>Food & Beverage</span>
              </div>
              <div className="msme-profile__field">
                <label>Established</label>
                <span>2018</span>
              </div>
              <div className="msme-profile__field">
                <label>Operating Hours</label>
                <span>Mon-Sat: 8:00 AM - 6:00 PM</span>
              </div>
              <div className="msme-profile__field">
                <label>Website</label>
                <span>www.mariamsme.com</span>
              </div>
              <div className="msme-profile__field msme-profile__field--full">
                <label>Specialties</label>
                <div className="msme-profile__tags">
                  <span className="msme-profile__tag">Buko Pie</span>
                  <span className="msme-profile__tag">Coffee Beans</span>
                  <span className="msme-profile__tag">Banana Chips</span>
                  <span className="msme-profile__tag">Traditional Desserts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="msme-profile__account-settings">
          <div className="msme-profile__card">
            <div className="msme-profile__card-header">
              <h3>Account Settings</h3>
            </div>
            <div className="msme-profile__settings-grid">
              <button className="msme-profile__setting-btn msme-profile__setting-btn--primary">
                <span className="msme-profile__setting-icon">🔒</span>
                <span className="msme-profile__setting-text">Change Password</span>
              </button>
              <button className="msme-profile__setting-btn msme-profile__setting-btn--secondary">
                <span className="msme-profile__setting-icon">🔔</span>
                <span className="msme-profile__setting-text">Notification Preferences</span>
              </button>
              <button className="msme-profile__setting-btn msme-profile__setting-btn--info">
                <span className="msme-profile__setting-icon">🛡️</span>
                <span className="msme-profile__setting-text">Privacy Settings</span>
              </button>
              <button className="msme-profile__setting-btn msme-profile__setting-btn--danger">
                <span className="msme-profile__setting-icon">⚠️</span>
                <span className="msme-profile__setting-text">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmeProfile;
