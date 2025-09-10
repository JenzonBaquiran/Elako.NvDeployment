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
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      website: ''
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
        setDashboardData(data.dashboard);
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
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setDashboardData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setDashboardData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
      formData.append('socialLinks', JSON.stringify(dashboardData.socialLinks));
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

              <div className="contact-item">
                <h4>Location</h4>
                {editMode ? (
                  <input
                    type="text"
                    name="location"
                    value={dashboardData.location}
                    onChange={handleInputChange}
                    placeholder="Store Location"
                    className="contact-input"
                  />
                ) : (
                  <p>{dashboardData.location || 'No location provided'}</p>
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
