import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import '../css/CustomerProfile.css';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const CustomerProfile = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'John Customer',
    email: 'loaejohnpersonal@gmail.com',
    phoneNumber: '+63 912 345 6789',
    address: '123 Main Street, Makati City',
    bio: 'Love discovering unique products from local MSMEs!'
  });
  const navigate = useNavigate();

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'customer-profile__content customer-profile__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'customer-profile__content customer-profile__content--sidebar-open' 
      : 'customer-profile__content customer-profile__content--sidebar-collapsed';
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Handle save profile logic here
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Navigate to change password or show modal
    console.log('Change password');
  };

  const handlePrivacySettings = () => {
    // Navigate to privacy settings
    console.log('Privacy settings');
  };

  const handleNotificationSettings = () => {
    // Navigate to notification settings
    console.log('Notification preferences');
  };

  const handleDeleteAccount = () => {
    // Handle account deletion with confirmation
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Delete account');
    }
  };

  const statsData = [
    { label: 'Reviews Given', value: '18' },
    { label: 'Favorite MSMEs', value: '7' },
    { label: 'Orders Placed', value: '25' },
    { label: 'Member Since', value: '2024' }
  ];

  const accountSettings = [
    { 
      title: 'Change Password', 
      icon: <SecurityIcon />, 
      action: handleChangePassword,
      color: '#01a477'
    },
    { 
      title: 'Privacy Settings', 
      icon: <PrivacyTipIcon />, 
      action: handlePrivacySettings,
      color: '#01a477'
    },
    { 
      title: 'Notification Preferences', 
      icon: <NotificationsIcon />, 
      action: handleNotificationSettings,
      color: '#01a477'
    },
    { 
      title: 'Delete Account', 
      icon: <DeleteIcon />, 
      action: handleDeleteAccount,
      color: '#dc3545'
    }
  ];

  return (
    <div className="customer-profile">
      <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="customer-profile__header">
          <div className="customer-profile__header-content">
            <div className="customer-profile__header-text">
  
            </div>
            <button 
              className={`customer-profile__edit-btn ${isEditing ? 'customer-profile__edit-btn--active' : ''}`}
              onClick={handleEditProfile}
            >
              <EditIcon />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="customer-profile__content-section">
          {/* Personal Information Section */}
          <div className="customer-profile__section customer-profile__section--personal-info">
            <div className="customer-profile__section-header">
              <h2 className="customer-profile__section-title">Personal Information</h2>
            </div>
            
            <div className="customer-profile__card">
              <div className="customer-profile__avatar-section">
                <div className="customer-profile__avatar">
                  <PersonIcon className="customer-profile__avatar-icon" />
                </div>
                <div className="customer-profile__basic-info">
                  <h3 className="customer-profile__name">{profileData.fullName}</h3>
                  <p className="customer-profile__email">{profileData.email}</p>
                  <span className="customer-profile__user-type">Customer</span>
                </div>
              </div>

              <div className="customer-profile__details">
                <div className="customer-profile__detail-row">
                  <label className="customer-profile__label">
                    <PersonIcon className="customer-profile__field-icon" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="customer-profile__edit-input"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.fullName}</span>
                  )}
                </div>

                <div className="customer-profile__detail-row">
                  <label className="customer-profile__label">
                    <EmailIcon className="customer-profile__field-icon" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="customer-profile__edit-input"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.email}</span>
                  )}
                </div>

                <div className="customer-profile__detail-row">
                  <label className="customer-profile__label">
                    <PhoneIcon className="customer-profile__field-icon" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="customer-profile__edit-input"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.phoneNumber}</span>
                  )}
                </div>

                <div className="customer-profile__detail-row">
                  <label className="customer-profile__label">
                    <LocationOnIcon className="customer-profile__field-icon" />
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="customer-profile__edit-input"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.address}</span>
                  )}
                </div>

                <div className="customer-profile__detail-row">
                  <label className="customer-profile__label">
                    <InfoIcon className="customer-profile__field-icon" />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="customer-profile__edit-textarea"
                      rows="3"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.bio}</span>
                  )}
                </div>

                {isEditing && (
                  <div className="customer-profile__edit-actions">
                    <button 
                      className="customer-profile__save-btn"
                      onClick={handleSaveProfile}
                    >
                      <SaveIcon />
                      Save Changes
                    </button>
                    <button 
                      className="customer-profile__cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      <CancelIcon />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="customer-profile__section customer-profile__section--statistics">
            <div className="customer-profile__section-header">
              <h2 className="customer-profile__section-title">Statistics</h2>
            </div>
            <div className="customer-profile__stats-grid">
              {statsData.map((stat, index) => (
                <div key={index} className="customer-profile__stat-card">
                  <div className="customer-profile__stat-value">{stat.value}</div>
                  <div className="customer-profile__stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="customer-profile__section customer-profile__section--account-settings">
            <div className="customer-profile__section-header">
              <h2 className="customer-profile__section-title">Account Settings</h2>
            </div>
            <div className="customer-profile__settings-grid">
              {accountSettings.map((setting, index) => (
                <div 
                  key={index} 
                  className={`customer-profile__setting-card ${setting.color === '#dc3545' ? 'customer-profile__setting-card--danger' : ''}`}
                  onClick={setting.action}
                >
                  <div 
                    className="customer-profile__setting-icon" 
                    style={{ color: setting.color }}
                  >
                    {setting.icon}
                  </div>
                  <div className="customer-profile__setting-title">{setting.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
