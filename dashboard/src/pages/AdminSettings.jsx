import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from "./AdminSidebar";
import Notification from "../components/Notification";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import "../css/AdminSettings.css";

const AdminSettings = () => {
  const { user } = useAuth();
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: '',
    showConfirmButtons: false,
    onConfirm: () => {},
    onCancel: () => {}
  });
  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    firstname: "",
    lastname: "",
    email: ""
  });

  useEffect(() => {
    if (user && user.id) {
      fetchAdminProfile();
    }
  }, [user]);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      
      // Check if it's the hardcoded admin first
      if (user.id === 'admin') {
        setProfileData({
          fullName: "Super Admin",
          username: "admin",
          firstname: "Super",
          lastname: "Admin",
          email: "admin@elako.com"
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:1337/api/admin/${user.id}/profile`);
      const data = await response.json();

      if (data.success) {
        setProfileData({
          fullName: data.profile.fullName,
          username: data.profile.username,
          firstname: data.profile.firstname,
          lastname: data.profile.lastname,
          email: data.profile.email
        });
      } else {
        console.error('Failed to fetch admin profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showNotification('error', 'Validation Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'Validation Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showNotification('error', 'Validation Error', 'Password must be at least 8 characters long');
      return;
    }

    // Check for password strength requirements
    const hasLowercase = /[a-z]/.test(passwordData.newPassword);
    const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword);

    if (!hasLowercase || !hasUppercase || !hasNumbers || !hasSymbols) {
      showNotification('error', 'Weak Password', 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showNotification('error', 'Validation Error', 'New password must be different from current password');
      return;
    }

    try {
      setPasswordLoading(true);
      
      const response = await fetch(`http://localhost:1337/api/admin/${user.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Success', 'Password changed successfully');
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification('error', 'Error', data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('error', 'Error', 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    showNotification(
      'confirm',
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      true,
      confirmDeleteAccount,
      () => {}
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/admin/${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Success', 'Account deleted successfully');
        // Logout and redirect after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        showNotification('error', 'Error', data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification('error', 'Error', 'Failed to delete account. Please try again.');
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showNotification = (type, title, message, showConfirmButtons = false, onConfirm = () => {}, onCancel = () => {}) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message,
      showConfirmButtons,
      onConfirm,
      onCancel
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
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
            {loading ? (
              <div className="admin-settings__loading">Loading profile...</div>
            ) : (
              <div className="admin-settings__profile-info">
                <div className="admin-settings__profile-avatar">
                  <div className="admin-settings__avatar">
                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="admin-settings__profile-title">
                    <h3>{profileData.fullName || 'Admin User'}</h3>
                    <p>{profileData.email || 'Not provided'}</p>
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
                    <p>{profileData.fullName || 'Not provided'}</p>
                  )}
                </div>
                <div className="admin-settings__info-item">
                  <label>Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="admin-settings__edit-input"
                    />
                  ) : (
                    <p>{profileData.username || 'Not provided'}</p>
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
                    <p>{profileData.email || 'Not provided'}</p>
                  )}
                </div>
              </div>
              </div>
            )}
          </section>

          <section className="admin-settings__section">
            <h2>Account Settings</h2>
            <div className="admin-settings__account-options">
              <button 
                className="admin-settings__settings-btn"
                onClick={() => setShowChangePasswordModal(true)}
              >
                Change Password
              </button>
              <button 
                className="admin-settings__settings-btn admin-settings__settings-btn--delete"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="admin-settings__modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
          <div className="admin-settings__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-settings__modal-header">
              <h3>Change Password</h3>
              <button 
                className="admin-settings__modal-close"
                onClick={() => setShowChangePasswordModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="admin-settings__modal-form">
              <div className="admin-settings__form-field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  required
                />
              </div>
              <div className="admin-settings__form-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  minLength="8"
                  required
                />
                <PasswordStrengthIndicator password={passwordData.newPassword} />
              </div>
              <div className="admin-settings__form-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  minLength="6"
                  required
                />
              </div>
              <div className="admin-settings__modal-actions">
                <button
                  type="button"
                  className="admin-settings__modal-btn admin-settings__modal-btn--cancel"
                  onClick={() => setShowChangePasswordModal(false)}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-settings__modal-btn admin-settings__modal-btn--primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Component */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        showConfirmButtons={notification.showConfirmButtons}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        duration={4000}
      />
    </div>
  );
};

export default AdminSettings;
