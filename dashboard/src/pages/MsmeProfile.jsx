import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeProfile.css';
import profileImg from '../assets/pic.jpg';

const MsmeProfile = () => {
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    id: '',
    businessName: '',
    email: '',
    contactNumber: '',
    address: '',
    businessDescription: '',
    category: '',
    website: '',
    storeLogo: null
  });
  const [stats, setStats] = useState({
    profileViews: 0,
    followers: 0,
    rating: 0,
    profileComplete: 0
  });
  const { user, userType } = useAuth();

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

  // Fetch MSME profile data
  useEffect(() => {
    if (user && userType === 'msme') {
      fetchMsmeProfile();
    }
  }, [user, userType]);

  const fetchMsmeProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:1337/api/msme/${user.id}/profile`);
      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.profile);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch MSME profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching MSME profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update personal information
      const personalResponse = await fetch(`http://localhost:1337/api/msme/${user.id}/profile/personal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: profileData.businessName,
          email: profileData.email,
          contactNumber: profileData.contactNumber,
          address: profileData.address,
          businessDescription: profileData.businessDescription
        })
      });

      const personalData = await personalResponse.json();

      // Update business information (only category and website)
      const businessResponse = await fetch(`http://localhost:1337/api/msme/${user.id}/profile/business`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: profileData.category,
          website: profileData.website
        })
      });

      const businessData = await businessResponse.json();

      if (personalData.success && businessData.success) {
        setProfileData(prev => ({ 
          ...prev, 
          ...personalData.profile,
          ...businessData.profile
        }));
        setIsEditing(false);
        console.log('Business information updated successfully');
      } else {
        const error = personalData.error || businessData.error || 'Failed to update information';
        console.error('Failed to update information:', error);
        alert(error);
      }
    } catch (error) {
      console.error('Error updating information:', error);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append('storeLogo', file);

      const response = await fetch(`http://localhost:1337/api/msme/${user.id}/profile/storeLogo`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          storeLogo: data.storeLogo
        }));
        console.log('Store logo updated successfully');
        alert('Store logo updated successfully!');
      } else {
        console.error('Failed to update store logo:', data.error);
        alert(data.error || 'Failed to update store logo');
      }
    } catch (error) {
      console.error('Error uploading store logo:', error);
      alert('Network error. Please try again.');
    } finally {
      setUploadingLogo(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      alert('New password must be different from current password');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`http://localhost:1337/api/msme/${user.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Password changed successfully!');
        setShowChangePasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt('Please type "DELETE" to confirm account deletion:');
    
    if (confirmText !== 'DELETE') {
      alert('Account deletion cancelled. You must type "DELETE" exactly.');
      return;
    }

    const finalConfirm = window.confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone. All your data, products, and business information will be permanently deleted.'
    );

    if (!finalConfirm) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`http://localhost:1337/api/msme/${user.id}/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Account deleted successfully. You will be redirected to the login page.');
        // Redirect to login or handle logout
        window.location.href = '/login';
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
      setShowDeleteAccountModal(false);
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

  if (loading) {
    return (
      <div className="msme-profile">
        <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
        <div className={getContentClass()}>
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

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
          </div>
        </div>

        <div className="msme-profile__stats">
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">{stats.profileViews.toLocaleString()}</div>
            <div className="msme-profile__stat-label">Profile Views</div>
          </div>
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">{stats.followers}</div>
            <div className="msme-profile__stat-label">Followers</div>
          </div>
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">{stats.rating}</div>
            <div className="msme-profile__stat-label">Rating</div>
          </div>
          <div className="msme-profile__stat-box">
            <div className="msme-profile__stat-value">{stats.profileComplete}%</div>
            <div className="msme-profile__stat-label">Profile Complete</div>
          </div>
        </div>

        <div className="msme-profile__content-single">
          <div className="msme-profile__card msme-profile__business-info">
            <div className="msme-profile__card-header">
              <h3>Business Information</h3>
              <button 
                className="msme-profile__edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="msme-profile__info-content">
              <div className="msme-profile__avatar-section">
                <div className="msme-profile__avatar">
                  <img 
                    src={profileData.storeLogo ? `http://localhost:1337/uploads/${profileData.storeLogo}` : profileImg} 
                    alt="Store Logo" 
                    onError={(e) => {
                      e.target.src = profileImg;
                    }}
                  />
                </div>
                <input
                  type="file"
                  id="storeLogo"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  className="msme-profile__upload-btn"
                  onClick={() => document.getElementById('storeLogo').click()}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
              <div className="msme-profile__info-fields">
                <div className="msme-profile__field">
                  <label>Business Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="msme-profile__edit-input"
                    />
                  ) : (
                    <span>{profileData.businessName || 'Not provided'}</span>
                  )}
                </div>
                <div className="msme-profile__field">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="msme-profile__edit-input"
                    />
                  ) : (
                    <span>{profileData.email || 'Not provided'}</span>
                  )}
                </div>
                <div className="msme-profile__field">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      className="msme-profile__edit-input"
                    />
                  ) : (
                    <span>{profileData.contactNumber || 'Not provided'}</span>
                  )}
                </div>
                <div className="msme-profile__field">
                  <label>Business Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="msme-profile__edit-input"
                    />
                  ) : (
                    <span>{profileData.address || 'Not provided'}</span>
                  )}
                </div>
                <div className="msme-profile__field">
                  <label>Business Category</label>
                  {isEditing ? (
                    <select
                      value={profileData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="msme-profile__edit-input"
                    >
                      <option value="">Select Category</option>
                      <option value="food">Food & Beverage</option>
                      <option value="artisan">Artisan</option>
                    </select>
                  ) : (
                    <span>{profileData.category === 'food' ? 'Food & Beverage' : profileData.category === 'artisan' ? 'Artisan' : 'Not provided'}</span>
                  )}
                </div>
                <div className="msme-profile__field">
                  <label>Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="msme-profile__edit-input"
                      placeholder="https://your-website.com"
                    />
                  ) : (
                    <span>{profileData.website || 'Not provided'}</span>
                  )}
                </div>
                <div className="msme-profile__field msme-profile__field--full">
                  <label>Business Description</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.businessDescription}
                      onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                      className="msme-profile__edit-textarea"
                      rows="3"
                    />
                  ) : (
                    <span>{profileData.businessDescription || 'Not provided'}</span>
                  )}
                </div>
                {isEditing && (
                  <div className="msme-profile__edit-actions msme-profile__field--full">
                    <button 
                      className="msme-profile__save-btn"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
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
              <button 
                className="msme-profile__setting-btn msme-profile__setting-btn--primary"
                onClick={() => setShowChangePasswordModal(true)}
              >
                Change Password
              </button>
              <button 
                className="msme-profile__setting-btn msme-profile__setting-btn--danger"
                onClick={() => setShowDeleteAccountModal(true)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="msme-profile__modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
            <div className="msme-profile__modal" onClick={(e) => e.stopPropagation()}>
              <div className="msme-profile__modal-header">
                <h3>Change Password</h3>
                <button 
                  className="msme-profile__modal-close"
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="msme-profile__modal-content">
                <div className="msme-profile__field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                    className="msme-profile__edit-input"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="msme-profile__field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                    className="msme-profile__edit-input"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>
                <div className="msme-profile__field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                    className="msme-profile__edit-input"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="msme-profile__modal-actions">
                <button 
                  className="msme-profile__modal-btn msme-profile__modal-btn--secondary"
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="msme-profile__modal-btn msme-profile__modal-btn--primary"
                  onClick={handleChangePassword}
                  disabled={saving}
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteAccountModal && (
          <div className="msme-profile__modal-overlay" onClick={() => setShowDeleteAccountModal(false)}>
            <div className="msme-profile__modal msme-profile__modal--danger" onClick={(e) => e.stopPropagation()}>
              <div className="msme-profile__modal-header">
                <h3>Delete Account</h3>
                <button 
                  className="msme-profile__modal-close"
                  onClick={() => setShowDeleteAccountModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="msme-profile__modal-content">
                <div className="msme-profile__danger-warning">
                  <h4>⚠️ Warning: This action cannot be undone!</h4>
                  <p>Deleting your account will permanently remove:</p>
                  <ul>
                    <li>All your business information and profile data</li>
                    <li>All products and product images</li>
                    <li>All customer reviews and ratings</li>
                    <li>All messages and conversations</li>
                    <li>All analytics and performance data</li>
                  </ul>
                  <p><strong>This action is irreversible and cannot be undone.</strong></p>
                </div>
              </div>
              <div className="msme-profile__modal-actions">
                <button 
                  className="msme-profile__modal-btn msme-profile__modal-btn--secondary"
                  onClick={() => setShowDeleteAccountModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="msme-profile__modal-btn msme-profile__modal-btn--danger"
                  onClick={handleDeleteAccount}
                  disabled={saving}
                >
                  {saving ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MsmeProfile;
