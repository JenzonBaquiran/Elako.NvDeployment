import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomerSidebar from './CustomerSidebar';
import TopFanCongratulations from '../components/TopFanCongratulations';
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
import MoreVertIcon from '@mui/icons-material/MoreVert';

const CustomerProfile = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // TOP FAN Badge System State
  const [showTopFanCongratulations, setShowTopFanCongratulations] = useState(false);
  const [topFanBadgeData, setTopFanBadgeData] = useState(null);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    fullName: '',
    firstname: '',
    lastname: '',
    email: '',
    contactNumber: '',
    address: '',
    bio: '',
    username: '',
    termsAcceptedAt: null
  });
  const [statsData, setStatsData] = useState([
    { label: 'Reviews Given', value: '0' },
    { label: 'Followed Stores', value: '0' },
    { label: 'Favorite Products', value: '0' },
    { label: 'Member Since', value: '2024' }
  ]);
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  // Fetch customer profile on component mount
  useEffect(() => {
    if (user && userType === 'customer') {
      fetchCustomerProfile();
      // Check for TOP FAN badge after a short delay (simulating login flow)
      setTimeout(() => {
        checkTopFanStatus();
      }, 2000);
    }
  }, [user, userType]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.customer-profile__menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const fetchCustomerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:1337/api/customers/${user.id}/profile`);
      const data = await response.json();

      if (data.success) {
        setProfileData({
          id: data.profile.id,
          fullName: data.profile.fullName,
          firstname: data.profile.firstname,
          lastname: data.profile.lastname,
          email: data.profile.email,
          contactNumber: data.profile.contactNumber,
          address: data.profile.address,
          bio: data.profile.bio,
          username: data.profile.username,
          termsAcceptedAt: data.profile.termsAcceptedAt
        });

        // Update stats data
        const termsAcceptedDate = data.profile.termsAcceptedAt 
          ? new Date(data.profile.termsAcceptedAt).toLocaleDateString()
          : 'Not available';
        
        setStatsData([
          { label: 'Reviews Given', value: data.profile.stats.reviewsGiven.toString() },
          { label: 'Followed Stores', value: data.profile.stats.followedStores.toString() },
          { label: 'Favorite Products', value: data.profile.stats.favoriteProducts.toString() },
          { label: 'Member Since', value: data.profile.stats.memberSince.toString() },
          { label: 'Terms Accepted', value: termsAcceptedDate }
        ]);
      } else {
        console.error('Failed to fetch profile:', data.error);
        // Handle error - maybe show toast notification
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      // Handle error - maybe show toast notification
    } finally {
      setLoading(false);
    }
  };

  // Utility function to fetch detailed favorite products (for future use)
  const fetchFavoriteProducts = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/customers/${user.id}/favorite-products`);
      const data = await response.json();
      
      if (data.success) {
        return data.favoriteProducts;
      } else {
        console.error('Failed to fetch favorite products:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching favorite products:', error);
      return [];
    }
  };

  // Utility function to fetch detailed followed stores (for future use)
  const fetchFollowedStores = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/customers/${user.id}/followed-stores`);
      const data = await response.json();
      
      if (data.success) {
        return data.followedStores;
      } else {
        console.error('Failed to fetch followed stores:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching followed stores:', error);
      return [];
    }
  };

  // Utility function to fetch detailed review statistics (for future use)
  const fetchReviewStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/customers/${user.id}/review-stats`);
      const data = await response.json();
      
      if (data.success) {
        return data.reviewStats;
      } else {
        console.error('Failed to fetch review statistics:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching review statistics:', error);
      return null;
    }
  };

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
    setShowMenu(false); // Close menu when edit is clicked
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`http://localhost:1337/api/customers/${profileData.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          email: profileData.email,
          contactNumber: profileData.contactNumber,
          address: profileData.address,
          bio: profileData.bio
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update profile data with response
        setProfileData(prev => ({
          ...prev,
          fullName: data.profile.fullName,
          firstname: data.profile.firstname,
          lastname: data.profile.lastname,
          email: data.profile.email,
          contactNumber: data.profile.contactNumber,
          address: data.profile.address,
          bio: data.profile.bio
        }));
        
        setIsEditing(false);
        // You can add a success toast notification here
        console.log('Profile updated successfully');
      } else {
        // Handle error - show error message
        console.error('Failed to update profile:', data.error);
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    // Navigate to change password or show modal
    console.log('Change password');
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

  // TOP FAN Badge System Functions
  const checkTopFanStatus = async () => {
    if (!user?.id) return;

    try {
      setBadgeLoading(true);
      
      // First calculate/update the badge
      const calculateResponse = await fetch(`http://localhost:1337/api/badges/customer/${user.id}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const calculateData = await calculateResponse.json();
      console.log('Customer Badge Calculation Result:', calculateData);

      if (calculateData.success && calculateData.badge) {
        setTopFanBadgeData(calculateData.badge);

        // Check if we should show congratulations (new badge and not shown before)
        if (calculateData.isNewBadge && calculateData.badge.isActive) {
          // Check localStorage to prevent showing multiple times per day
          const lastShown = localStorage.getItem(`topfan-congratulations-${user.id}`);
          const today = new Date().toDateString();
          
          if (lastShown !== today) {
            console.log('Showing TOP FAN congratulations popup');
            setShowTopFanCongratulations(true);
            localStorage.setItem(`topfan-congratulations-${user.id}`, today);
          } else {
            console.log('TOP FAN congratulations already shown today');
          }
        }
      }
    } catch (error) {
      console.error('Error checking TOP FAN status:', error);
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleTopFanCongratulationsClose = () => {
    setShowTopFanCongratulations(false);
    if (topFanBadgeData?._id) {
      markCelebrationShown();
    }
  };

  const markCelebrationShown = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/badges/celebration-shown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badgeType: 'customer',
          badgeId: topFanBadgeData._id,
        }),
      });

      if (response.ok) {
        console.log('TOP FAN celebration marked as shown');
      }
    } catch (error) {
      console.error('Error marking TOP FAN celebration as shown:', error);
    }
  };

  const handleTestTopFanPopup = async () => {
    console.log('Testing TOP FAN popup...');
    setBadgeLoading(true);
    
    try {
      // Force recalculate badge
      await checkTopFanStatus();
      
      // Force show popup for testing (bypass localStorage check)
      setTimeout(() => {
        if (topFanBadgeData?.isActive) {
          console.log('Forcing TOP FAN congratulations popup for testing');
          setShowTopFanCongratulations(true);
        } else {
          alert('No active TOP FAN badge found. Customer needs to meet criteria first.');
        }
      }, 1000);
    } catch (error) {
      console.error('Error testing TOP FAN popup:', error);
      alert('Error testing TOP FAN popup. Check console for details.');
    } finally {
      setBadgeLoading(false);
    }
  };



  const accountSettings = [
    { 
      title: 'Change Password', 
      icon: <SecurityIcon />, 
      action: handleChangePassword,
      color: '#7ed957'
    },
    { 
      title: 'Notification Preferences', 
      icon: <NotificationsIcon />, 
      action: handleNotificationSettings,
      color: '#7ed957'
    },
    { 
      title: 'Test TOP FAN Badge', 
      icon: <span>👑</span>, 
      action: handleTestTopFanPopup,
      color: '#ffd700',
      loading: badgeLoading
    },
    { 
      title: 'Delete Account', 
      icon: <DeleteIcon />, 
      action: handleDeleteAccount,
      color: '#dc3545'
    }
  ];

  if (loading) {
    return (
      <div className="customer-profile">
        <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
        <div className={getContentClass()}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '18px',
            color: '#666'
          }}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-profile">
      <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="customer-profile__header">
          <div className="customer-profile__header-content">
            <div className="customer-profile__header-text">
  
            </div>
          </div>
        </div>

        <div className="customer-profile__content-section">
          {/* Personal Information Section */}
          <div className="customer-profile__section customer-profile__section--personal-info">
            <div className="customer-profile__section-header">
              <h2 className="customer-profile__section-title">Personal Information</h2>
              <div className="customer-profile__menu-container">
                <button 
                  className="customer-profile__menu-button"
                  onClick={toggleMenu}
                >
                  <MoreVertIcon className="customer-profile__menu-icon" />
                </button>
                {showMenu && (
                  <div className="customer-profile__dropdown-menu">
                    <button 
                      className="customer-profile__dropdown-item"
                      onClick={handleEditProfile}
                    >
                      <EditIcon className="customer-profile__dropdown-icon" />
                      {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="customer-profile__card">
              <div className="customer-profile__avatar-section">
                <div className="customer-profile__avatar">
                  <PersonIcon className="customer-profile__avatar-icon" />
                </div>
                <div className="customer-profile__basic-info">
                  <h3 className="customer-profile__name">
                    {profileData.fullName}
                    {topFanBadgeData?.isActive && (
                      <span 
                        className="customer-profile__badge-indicator"
                        title={`${topFanBadgeData.badgeType === 'suki' ? 'SUKI' : 'TOP FAN'} Badge - Active until ${new Date(topFanBadgeData.expiresAt).toLocaleDateString()}`}
                      >
                        {topFanBadgeData.badgeType === 'suki' ? '💝' : '👑'}
                      </span>
                    )}
                  </h3>
                  <p className="customer-profile__email">{profileData.email}</p>
                  <span className="customer-profile__user-type">
                    Customer
                    {topFanBadgeData?.isActive && (
                      <span className="customer-profile__badge-text">
                        • {topFanBadgeData.badgeType === 'suki' ? 'SUKI Member' : 'TOP FAN'}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="customer-profile__details">
                <div className="customer-profile__detail-row">
                  <label className="customer-profile__label">
                    <PersonIcon className="customer-profile__field-icon" />
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstname}
                      onChange={(e) => {
                        handleInputChange('firstname', e.target.value);
                        // Update full name when first name changes
                        handleInputChange('fullName', `${e.target.value} ${profileData.lastname}`.trim());
                      }}
                      className="customer-profile__edit-input"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.firstname}</span>
                  )}
                </div>

                <div className="customer-profile__detail-row">
                  <label className="customer-profile__label">
                    <PersonIcon className="customer-profile__field-icon" />
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastname}
                      onChange={(e) => {
                        handleInputChange('lastname', e.target.value);
                        // Update full name when last name changes
                        handleInputChange('fullName', `${profileData.firstname} ${e.target.value}`.trim());
                      }}
                      className="customer-profile__edit-input"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.lastname}</span>
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
                      value={profileData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      className="customer-profile__edit-input"
                    />
                  ) : (
                    <span className="customer-profile__value">{profileData.contactNumber}</span>
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
                      disabled={saving}
                    >
                      <SaveIcon />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className="customer-profile__cancel-btn"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
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
                  className={`customer-profile__setting-card ${setting.color === '#dc3545' ? 'customer-profile__setting-card--danger' : ''} ${setting.loading ? 'customer-profile__setting-card--loading' : ''}`}
                  onClick={setting.loading ? null : setting.action}
                  style={{ 
                    cursor: setting.loading ? 'not-allowed' : 'pointer',
                    opacity: setting.loading ? 0.6 : 1
                  }}
                >
                  <div 
                    className="customer-profile__setting-icon" 
                    style={{ color: setting.color }}
                  >
                    {setting.loading ? '⏳' : setting.icon}
                  </div>
                  <div className="customer-profile__setting-title">
                    {setting.loading ? 'Loading...' : setting.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP FAN Congratulations Modal */}
        <TopFanCongratulations
          isVisible={showTopFanCongratulations}
          onClose={handleTopFanCongratulationsClose}
          badgeData={topFanBadgeData}
          onMarkCelebrationShown={markCelebrationShown}
        />
      </div>
    </div>
  );
};

export default CustomerProfile;
