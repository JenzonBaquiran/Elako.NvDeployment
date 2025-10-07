import React, { useState, useEffect } from 'react';
import MsmeSidebar from './MsmeSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import '../css/MsmeCustomizeDashboard.css';

const MsmeCustomizeDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  // Dashboard customization state
  const [dashboardData, setDashboardData] = useState({
    coverPhoto: null,
    storeLogo: null,
    businessName: '',
    description: '',
    contactNumber: '',
    location: '',
    googleMapsUrl: '',
    coordinates: { lat: null, lng: null },
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      website: ''
    },
    ecommercePlatforms: {
      shopee: { enabled: false, url: '' },
      lazada: { enabled: false, url: '' },
      tiktok: { enabled: false, url: '' }
    },
    governmentApprovals: {
      dole: false,
      dost: false,
      fda: false,
      dti: false,
      others: false,
      otherAgencies: []
    },
    rating: 0,
    isPublic: true
  });

  const [previewUrls, setPreviewUrls] = useState({
    coverPhoto: null,
    storeLogo: null
  });

  const [editMode, setEditMode] = useState(false);

  // Fetch dashboard data and products on component mount
  useEffect(() => {
    if (user && user._id) {
      fetchDashboardData();
      fetchProducts();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`http://localhost:1337/api/msme/${user._id}/dashboard`);
      const data = await response.json();
      
      if (data.success) {
        // Ensure new fields have default values if not present in the data
        const dashboardWithDefaults = {
          ...data.dashboard,
          ecommercePlatforms: data.dashboard.ecommercePlatforms || {
            shopee: { enabled: false, url: '' },
            lazada: { enabled: false, url: '' },
            tiktok: { enabled: false, url: '' }
          },
          governmentApprovals: data.dashboard.governmentApprovals || {
            dole: false,
            dost: false,
            fda: false,
            others: false
          },
          googleMapsUrl: data.dashboard.googleMapsUrl || '',
          coordinates: data.dashboard.coordinates || { lat: null, lng: null }
        };
        setDashboardData(dashboardWithDefaults);
        // Set preview URLs for existing images
        if (data.dashboard.coverPhoto) {
          setPreviewUrls(prev => ({
            ...prev,
            coverPhoto: `http://localhost:1337/uploads/${data.dashboard.coverPhoto}`
          }));
        }
        if (data.dashboard.storeLogo) {
          setPreviewUrls(prev => ({
            ...prev,
            storeLogo: `http://localhost:1337/uploads/${data.dashboard.storeLogo}`
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchProducts = async () => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`http://localhost:1337/api/msme/${user._id}/products?visible=true`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSidebarToggle = (stateOrIsOpen, isMobile = false) => {
    if (typeof stateOrIsOpen === 'object') {
      setSidebarState({ 
        isOpen: stateOrIsOpen.isOpen, 
        isMobile: stateOrIsOpen.isMobile 
      });
    } else {
      setSidebarState({ isOpen: stateOrIsOpen, isMobile });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setDashboardData(prev => {
          const newData = {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: type === 'checkbox' ? checked : value
            }
          };
          
          // Initialize otherAgencies array when "others" is checked for the first time
          if (name === 'governmentApprovals.others' && checked && (!prev.governmentApprovals.otherAgencies || prev.governmentApprovals.otherAgencies.length === 0)) {
            newData.governmentApprovals.otherAgencies = [''];
          }
          
          return newData;
        });
      } else if (parts.length === 3) {
        const [parent, child, subchild] = parts;
        setDashboardData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subchild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      }
    } else {
      setDashboardData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handler functions for managing other agencies
  const handleOtherAgencyChange = (index, value) => {
    setDashboardData(prev => {
      const newOtherAgencies = [...(prev.governmentApprovals.otherAgencies || [])];
      newOtherAgencies[index] = value;
      return {
        ...prev,
        governmentApprovals: {
          ...prev.governmentApprovals,
          otherAgencies: newOtherAgencies
        }
      };
    });
  };

  const addOtherAgency = () => {
    setDashboardData(prev => ({
      ...prev,
      governmentApprovals: {
        ...prev.governmentApprovals,
        otherAgencies: [...(prev.governmentApprovals.otherAgencies || []), '']
      }
    }));
  };

  const removeOtherAgency = (index) => {
    setDashboardData(prev => {
      const newOtherAgencies = [...(prev.governmentApprovals.otherAgencies || [])];
      newOtherAgencies.splice(index, 1);
      return {
        ...prev,
        governmentApprovals: {
          ...prev.governmentApprovals,
          otherAgencies: newOtherAgencies
        }
      };
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setDashboardData(prev => ({
        ...prev,
        [type]: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrls(prev => ({
          ...prev,
          [type]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('businessName', dashboardData.businessName);
      formData.append('description', dashboardData.description);
      formData.append('contactNumber', dashboardData.contactNumber);
      formData.append('location', dashboardData.location);
      formData.append('googleMapsUrl', dashboardData.googleMapsUrl);
      formData.append('coordinates', JSON.stringify(dashboardData.coordinates));
      formData.append('socialLinks', JSON.stringify(dashboardData.socialLinks));
      formData.append('ecommercePlatforms', JSON.stringify(dashboardData.ecommercePlatforms));
      formData.append('governmentApprovals', JSON.stringify(dashboardData.governmentApprovals));
      formData.append('isPublic', dashboardData.isPublic);
      formData.append('msmeId', user._id);
      
      // Add files if they're new uploads
      if (dashboardData.coverPhoto instanceof File) {
        formData.append('coverPhoto', dashboardData.coverPhoto);
      }
      if (dashboardData.storeLogo instanceof File) {
        formData.append('storeLogo', dashboardData.storeLogo);
      }

      const response = await fetch('http://localhost:1337/api/msme/dashboard', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess("Dashboard updated successfully!", "Success");
        setEditMode(false);
        fetchDashboardData(); // Refresh data
      } else {
        showError(data.error || "Failed to update dashboard", "Error");
      }
    } catch (error) {
      console.error("Error updating dashboard:", error);
      showError("Failed to update dashboard", "Error");
    } finally {
      setLoading(false);
    }
  };

  const getProductImageUrl = (product) => {
    if (product.picture) {
      return `http://localhost:1337/uploads/${product.picture}`;
    }
    return '/default-product.jpg';
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'msme-customize-dashboard-content msme-customize-dashboard-content--mobile';
    }
    return sidebarState.isOpen 
      ? 'msme-customize-dashboard-content sidebar-open' 
      : 'msme-customize-dashboard-content sidebar-closed';
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="msme-customize-dashboard-container">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-customize-dashboard-header">
          <div className="msme-customize-dashboard-header-content">
            <div className="msme-customize-dashboard-header-text">
              <h1>Customize Store Dashboard</h1>
              <p>Create your public store profile that customers will see.</p>
            </div>
            <div className="msme-customize-dashboard-actions">
              {!editMode ? (
                <button 
                  className="msme-customize-dashboard-edit-button"
                  onClick={() => setEditMode(true)}
                >
                  Edit Dashboard
                </button>
              ) : (
                <div className="edit-mode-actions">
                  <button 
                    className="msme-customize-dashboard-cancel-button"
                    onClick={() => {
                      setEditMode(false);
                      fetchDashboardData(); // Reset data
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="msme-customize-dashboard-save-button"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview/Edit Dashboard */}
        <div className="dashboard-preview-container">
          {/* Cover Photo Section */}
          <div className="cover-photo-section">
            {editMode ? (
              <div className="cover-photo-upload">
                <input
                  type="file"
                  id="coverPhoto"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'coverPhoto')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="coverPhoto" className="cover-photo-upload-label">
                  {previewUrls.coverPhoto ? (
                    <img src={previewUrls.coverPhoto} alt="Cover" className="cover-photo-preview" />
                  ) : (
                    <div className="cover-photo-placeholder">
                      <span>Click to upload cover photo</span>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="cover-photo-display">
                {previewUrls.coverPhoto ? (
                  <img src={previewUrls.coverPhoto} alt="Store Cover" className="cover-photo" />
                ) : (
                  <div className="cover-photo-default">
                    <span>No cover photo uploaded</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Store Info Section */}
          <div className="store-info-section">
            <div className="store-logo-container">
              {editMode ? (
                <div className="store-logo-upload">
                  <input
                    type="file"
                    id="storeLogo"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'storeLogo')}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="storeLogo" className="store-logo-upload-label">
                    {previewUrls.storeLogo ? (
                      <img src={previewUrls.storeLogo} alt="Logo" className="store-logo-preview" />
                    ) : (
                      <div className="store-logo-placeholder">
                        <span>Logo</span>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div className="store-logo-display">
                  {previewUrls.storeLogo ? (
                    <img src={previewUrls.storeLogo} alt="Store Logo" className="store-logo" />
                  ) : (
                    <div className="store-logo-default">
                      <span>No Logo</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="store-details">
              {editMode ? (
                <div className="store-details-edit">
                  <input
                    type="text"
                    name="businessName"
                    value={dashboardData.businessName}
                    onChange={handleInputChange}
                    placeholder="Business Name"
                    className="business-name-input"
                  />
                  <textarea
                    name="description"
                    value={dashboardData.description}
                    onChange={handleInputChange}
                    placeholder="Store Description"
                    className="description-input"
                    rows="3"
                  />
                </div>
              ) : (
                <div className="store-details-display">
                  <h2 className="business-name">{dashboardData.businessName || 'Business Name'}</h2>
                  <p className="store-description">{dashboardData.description || 'Store description will appear here.'}</p>
                </div>
              )}

              {/* Rating Display */}
              <div className="store-rating">
                <div className="rating-stars">
                  {renderStars(dashboardData.rating || 4)}
                </div>
                <span className="rating-text">({dashboardData.rating || 4.0}/5.0)</span>
              </div>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="contact-section">
            <div className="contact-grid">
              <div className="contact-item">
                <h4>Contact Number</h4>
                {editMode ? (
                  <input
                    type="tel"
                    name="contactNumber"
                    value={dashboardData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Contact Number"
                    className="contact-input"
                  />
                ) : (
                  <p>{dashboardData.contactNumber || 'No contact number provided'}</p>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="location-enhanced-section">
              <h4>Location</h4>
              {editMode ? (
                <div className="location-input-group">
                  <input
                    type="url"
                    name="googleMapsUrl"
                    value={dashboardData.googleMapsUrl || ''}
                    onChange={handleInputChange}
                    placeholder="Paste your Google Maps link here (e.g., https://maps.google.com/...)"
                    className="specific-address-input"
                  />
                  <div className="location-help-text">
                    <small>💡 Go to Google Maps, search your location, click "Share" and paste the link here</small>
                  </div>
                </div>
              ) : (
                <div className="location-display">
                  {dashboardData.googleMapsUrl ? (
                    <div className="address-with-map">
                      <button
                        onClick={() => {
                          window.open(dashboardData.googleMapsUrl, '_blank');
                        }}
                        className="view-on-maps-btn"
                      >
                         View Location on Google Maps
                      </button>
                    </div>
                  ) : (
                    <p className="no-address">No location provided</p>
                  )}
                </div>
              )}
            </div>
          </div>



          {/* Government Approvals Section */}
          <div className={`government-approvals-section ${!editMode ? 'readonly' : 'editable'}`}>
            <h3>Government Approvals & Assistance</h3>
            <p className="section-description">Select the government agencies that have approved or assisted your business:</p>
            <div className="dti-notice">
              <strong>Note:</strong> All MSMEs are automatically DTI approved/assisted and will be displayed in your store view.
            </div>
            
            <div className="approval-checklist">
              <label className="approval-checkbox-item">
                <input
                  type="checkbox"
                  name="governmentApprovals.dole"
                  checked={dashboardData.governmentApprovals?.dole || false}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                <span className="checkbox-custom"></span>
                <span className="approval-text">
                  <strong>DOLE</strong> - Department of Labor and Employment
                </span>
              </label>

              <label className="approval-checkbox-item">
                <input
                  type="checkbox"
                  name="governmentApprovals.dost"
                  checked={dashboardData.governmentApprovals?.dost || false}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                <span className="checkbox-custom"></span>
                <span className="approval-text">
                  <strong>DOST</strong> - Department of Science and Technology
                </span>
              </label>

              <label className="approval-checkbox-item">
                <input
                  type="checkbox"
                  name="governmentApprovals.fda"
                  checked={dashboardData.governmentApprovals?.fda || false}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                <span className="checkbox-custom"></span>
                <span className="approval-text">
                  <strong>FDA</strong> - Food and Drug Administration
                </span>
              </label>



              <div className="approval-checkbox-item-with-input">
                <label className="approval-checkbox-item">
                  <input
                      type="checkbox"
                      name="governmentApprovals.others"
                      checked={dashboardData.governmentApprovals?.others || false}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  <span className="checkbox-custom"></span>
                  <span className="approval-text">
                    <strong>Others</strong> - Specify Government Agencies
                  </span>
                </label>
                  {dashboardData.governmentApprovals?.others && (
                    <div className="other-agencies-container">
                      {(dashboardData.governmentApprovals?.otherAgencies || []).map((agency, index) => (
                        <div key={index} className="agency-input-group">
                          <input
                            type="text"
                            value={agency}
                            onChange={(e) => handleOtherAgencyChange(index, e.target.value)}
                            placeholder="Enter government agency name (e.g., BSP, DILG, etc.)"
                            className="others-input"
                            disabled={!editMode}
                          />
                          {editMode && (
                            <button
                              type="button"
                              onClick={() => removeOtherAgency(index)}
                              className="remove-agency-btn"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {editMode && (
                        <button
                          type="button"
                          onClick={addOtherAgency}
                          className="add-agency-btn"
                        >
                          + Add Another Agency
                        </button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="social-section">
            <h3>Social Media & Links</h3>
            <div className="social-grid">
              {Object.entries(dashboardData.socialLinks).map(([platform, url]) => (
                <div key={platform} className="social-item">
                  <label className="social-label">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                  {editMode ? (
                    <input
                      type="url"
                      name={`socialLinks.${platform}`}
                      value={url}
                      onChange={handleInputChange}
                      placeholder={`${platform} URL`}
                      className="social-input"
                    />
                  ) : (
                    <div className="social-display">
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="social-link">
                          {url}
                        </a>
                      ) : (
                        <span className="social-empty">Not provided</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* E-commerce Platforms in Social Links Style */}
              {Object.entries(dashboardData.ecommercePlatforms || {}).map(([platform, data]) => (
                <div key={platform} className="social-item">
                  <label className="social-label">
                    {platform === 'shopee' && '🛍️ Shopee'}
                    {platform === 'lazada' && '🛒 Lazada'}
                    {platform === 'tiktok' && '🎵 TikTok Shop'}
                  </label>
                  {editMode ? (
                    <input
                      type="url"
                      name={`ecommercePlatforms.${platform}.url`}
                      value={data?.url || ''}
                      onChange={handleInputChange}
                      placeholder={`${platform} store URL`}
                      className="social-input"
                    />
                  ) : (
                    <div className="social-display">
                      {data?.url ? (
                        <a href={data?.url} target="_blank" rel="noopener noreferrer" className="social-link">
                          {data?.url}
                        </a>
                      ) : (
                        <span className="social-empty">Not provided</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="products-section">
            <h3>Our Products</h3>
            {products.length > 0 ? (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    <img 
                      src={getProductImageUrl(product)} 
                      alt={product.productName} 
                      className="product-image" 
                    />
                    <div className="product-info">
                      <h4 className="product-name">{product.productName}</h4>
                      <p className="product-price">₱{product.price}</p>
                      <p className="product-description">{product.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No products to display. Add products to showcase them here.</p>
              </div>
            )}
          </div>

          {/* Public/Private Toggle */}
          {editMode && (
            <div className="visibility-section">
              <label className="visibility-toggle">
                <input
                  type="checkbox"
                  checked={dashboardData.isPublic}
                  onChange={(e) => setDashboardData(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <span className="visibility-text">Make this dashboard public (customers can view it)</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MsmeCustomizeDashboard;
