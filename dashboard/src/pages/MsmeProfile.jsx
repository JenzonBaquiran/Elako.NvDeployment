import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeProfile.css';
import profileImg from '../assets/pic.jpg';

const MsmeProfile = () => {
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    businessName: '',
    email: '',
    contactNumber: '',
    address: '',
    businessDescription: '',
    category: '',
    operatingHours: '',
    website: '',
    specialties: [],
    established: '',
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

  const handleSpecialtiesChange = (value) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setProfileData(prev => ({
      ...prev,
      specialties
    }));
  };

  const handleSavePersonal = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`http://localhost:1337/api/msme/${user.id}/profile/personal`, {
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

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({ ...prev, ...data.profile }));
        setIsEditingPersonal(false);
        console.log('Personal information updated successfully');
      } else {
        console.error('Failed to update personal information:', data.error);
        alert(data.error || 'Failed to update personal information');
      }
    } catch (error) {
      console.error('Error updating personal information:', error);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`http://localhost:1337/api/msme/${user.id}/profile/business`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: profileData.category,
          established: profileData.established,
          operatingHours: profileData.operatingHours,
          website: profileData.website,
          specialties: profileData.specialties
        })
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({ ...prev, ...data.profile }));
        setIsEditingBusiness(false);
        console.log('Business information updated successfully');
      } else {
        console.error('Failed to update business information:', data.error);
        alert(data.error || 'Failed to update business information');
      }
    } catch (error) {
      console.error('Error updating business information:', error);
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

        <div className="msme-profile__content-grid">
          <div className="msme-profile__card msme-profile__personal-info">
            <div className="msme-profile__card-header">
              <h3>Personal Information</h3>
              <button 
                className="msme-profile__edit-btn"
                onClick={() => setIsEditingPersonal(!isEditingPersonal)}
              >
                {isEditingPersonal ? 'Cancel' : 'Edit'}
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
                  {isEditingPersonal ? (
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
                  {isEditingPersonal ? (
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
                  {isEditingPersonal ? (
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
                  {isEditingPersonal ? (
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
                <div className="msme-profile__field msme-profile__field--full">
                  <label>Business Description</label>
                  {isEditingPersonal ? (
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
                {isEditingPersonal && (
                  <div className="msme-profile__edit-actions">
                    <button 
                      className="msme-profile__save-btn"
                      onClick={handleSavePersonal}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="msme-profile__card msme-profile__business-info">
            <div className="msme-profile__card-header">
              <h3>Business Information</h3>
              <button 
                className="msme-profile__edit-btn"
                onClick={() => setIsEditingBusiness(!isEditingBusiness)}
              >
                {isEditingBusiness ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="msme-profile__business-content">
              <div className="msme-profile__field">
                <label>Business Category</label>
                {isEditingBusiness ? (
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
                <label>Established</label>
                {isEditingBusiness ? (
                  <input
                    type="number"
                    value={profileData.established}
                    onChange={(e) => handleInputChange('established', e.target.value)}
                    className="msme-profile__edit-input"
                    placeholder="Year established"
                  />
                ) : (
                  <span>{profileData.established || 'Not provided'}</span>
                )}
              </div>
              <div className="msme-profile__field">
                <label>Operating Hours</label>
                {isEditingBusiness ? (
                  <input
                    type="text"
                    value={profileData.operatingHours}
                    onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                    className="msme-profile__edit-input"
                    placeholder="e.g., Mon-Sat: 8:00 AM - 6:00 PM"
                  />
                ) : (
                  <span>{profileData.operatingHours || 'Not provided'}</span>
                )}
              </div>
              <div className="msme-profile__field">
                <label>Website</label>
                {isEditingBusiness ? (
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
                <label>Specialties</label>
                {isEditingBusiness ? (
                  <input
                    type="text"
                    value={profileData.specialties ? profileData.specialties.join(', ') : ''}
                    onChange={(e) => handleSpecialtiesChange(e.target.value)}
                    className="msme-profile__edit-input"
                    placeholder="Enter specialties separated by commas"
                  />
                ) : (
                  <div className="msme-profile__tags">
                    {profileData.specialties && profileData.specialties.length > 0 ? (
                      profileData.specialties.map((specialty, index) => (
                        <span key={index} className="msme-profile__tag">{specialty}</span>
                      ))
                    ) : (
                      <span>Not provided</span>
                    )}
                  </div>
                )}
              </div>
              {isEditingBusiness && (
                <div className="msme-profile__edit-actions msme-profile__field--full">
                  <button 
                    className="msme-profile__save-btn"
                    onClick={handleSaveBusiness}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
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
                Change Password
              </button>
              <button className="msme-profile__setting-btn msme-profile__setting-btn--secondary">
                Privacy Settings
              </button>
              <button className="msme-profile__setting-btn msme-profile__setting-btn--info">
                Notification Preferences
              </button>
              <button className="msme-profile__setting-btn msme-profile__setting-btn--danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmeProfile;
