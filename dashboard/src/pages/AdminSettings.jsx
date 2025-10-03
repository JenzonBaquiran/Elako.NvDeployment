import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "../css/AdminSettings.css";

const AdminSettings = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Admin User",
    email: "baquiranjenzon@gmail.com",
    phoneNumber: "+63 912 345 6789",
    address: "123 Main Street, Makati City",
    bio: "Dedicated to helping MSMEs grow and succeed on our platform."
  });

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // Here you would typically make an API call to save the profile data
      // await fetch('/api/admin/profile', { method: 'PUT', body: JSON.stringify(profileData) });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
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
          {!isEditing ? (
            <button className="admin-settings__edit-btn" onClick={handleEditToggle}>
              Edit Profile
            </button>
          ) : (
            <div className="admin-settings__edit-actions">
              <button 
                className="admin-settings__save-btn" 
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="admin-settings__cancel-btn" 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="admin-settings__layout">
          <section className="admin-settings__section">
            <h2>Personal Information</h2>
            <div className="admin-settings__profile-info">
              <div className="admin-settings__profile-avatar">
                <div className="admin-settings__avatar">
                  {profileData.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="admin-settings__profile-title">
                  <h3>{profileData.fullName}</h3>
                  <p>{profileData.email}</p>
                  <span className="admin-settings__role-badge">Admin</span>
                </div>
              </div>

              <div className="admin-settings__info-grid">
                <div className="admin-settings__info-item">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="admin-settings__edit-input"
                    />
                  ) : (
                    <p>{profileData.fullName}</p>
                  )}
                </div>
                <div className="admin-settings__info-item">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="admin-settings__edit-input"
                    />
                  ) : (
                    <p>{profileData.email}</p>
                  )}
                </div>
                <div className="admin-settings__info-item">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="admin-settings__edit-input"
                    />
                  ) : (
                    <p>{profileData.phoneNumber}</p>
                  )}
                </div>
                <div className="admin-settings__info-item">
                  <label>Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="admin-settings__edit-input"
                    />
                  ) : (
                    <p>{profileData.address}</p>
                  )}
                </div>
              </div>

              <div className="admin-settings__bio-section">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="admin-settings__edit-textarea"
                    rows="3"
                  />
                ) : (
                  <p>{profileData.bio}</p>
                )}
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
