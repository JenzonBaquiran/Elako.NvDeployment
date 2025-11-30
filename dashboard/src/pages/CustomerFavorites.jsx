import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import FavoriteButton from '../components/FavoriteButton';
import FollowButton from '../components/FollowButton';
import TopFanCongratulations from '../components/TopFanCongratulations';
import { recordStoreView } from '../utils/storeViewTracker';
import { API_BASE_URL } from '../config/api';
import '../css/CustomerFavorites.css';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import StoreIcon from '@mui/icons-material/Store';

const CustomerFavorites = () => {
  const { user, userType, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [activeTab, setActiveTab] = useState('products');
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [followedStores, setFollowedStores] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // TOP FAN Badge System State
  const [showTopFanCongratulations, setShowTopFanCongratulations] = useState(false);
  const [topFanBadgeData, setTopFanBadgeData] = useState(null);
  const [badgeLoading, setBadgeLoading] = useState(false);

  // Fetch user's favorite products on component mount
  useEffect(() => {
    if (isAuthenticated && userType === 'customer' && user?._id) {
      fetchFavoriteProducts();
      fetchFollowedStores();
      // Check for TOP FAN badge after a short delay
      setTimeout(() => {
        checkTopFanStatus();
      }, 2000);
    }
  }, [isAuthenticated, userType, user]);

  const fetchFavoriteProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${user._id}/favorites`);
      const data = await response.json();
      
      if (data.success) {
        setFavoriteProducts(data.favorites);
      } else {
        showError('Failed to load favorite products', 'Error');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      showError('Failed to load favorite products', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedStores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${user._id}/following`);
      const data = await response.json();
      
      if (data.success) {
        setFollowedStores(data.following);
      } else {
        showError('Failed to load followed stores', 'Error');
      }
    } catch (error) {
      console.error('Error fetching followed stores:', error);
      showError('Failed to load followed stores', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteRemoved = (productId) => {
    // Remove the product from the local state when unfavorited
    setFavoriteProducts(prev => prev.filter(product => product._id !== productId));
  };

  const handleFavoriteStatusChanged = (productId, isFavorite, action) => {
    if (!isFavorite && action === 'removed') {
      handleFavoriteRemoved(productId);
    }
    // If needed in the future, we could handle adding products here too
    // though it's uncommon to add favorites from the favorites page
  };

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'customer-favorites__content customer-favorites__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'customer-favorites__content customer-favorites__content--sidebar-open' 
      : 'customer-favorites__content customer-favorites__content--sidebar-collapsed';
  };

  const toggleFavorite = (productId) => {
    // This will be handled by the FavoriteButton component
    // We just need to update local state when product is unfavorited
    handleFavoriteRemoved(productId);
  };

  // TOP FAN Badge System Functions
  const checkTopFanStatus = async () => {
    if (!user?._id) return;

    try {
      setBadgeLoading(true);
      
      // First get existing badge
      const getResponse = await fetch(`${API_BASE_URL}/api/badges/customer/${user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const getData = await getResponse.json();
      console.log('Existing Customer Badge:', getData);

      // Always set badge data if it exists
      if (getData.success && getData.badge) {
        setTopFanBadgeData(getData.badge);
        
        // Show popup if badge is active and celebration not shown
        if (getData.badge.isActive && !getData.badge.celebrationShown) {
          // Check localStorage to prevent showing multiple times per day
          const lastShown = localStorage.getItem(`topfan-congratulations-${user._id}`);
          const today = new Date().toDateString();
          
          if (lastShown !== today) {
            console.log('Showing TOP FAN congratulations popup from Favorites page');
            setShowTopFanCongratulations(true);
            localStorage.setItem(`topfan-congratulations-${user._id}`, today);
          } else {
            console.log('TOP FAN congratulations already shown today');
          }
        }
      } else {
        // Try to calculate badge if none exists
        const calculateResponse = await fetch(`${API_BASE_URL}/api/badges/customer/${user._id}/calculate`, {
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
            const lastShown = localStorage.getItem(`topfan-congratulations-${user._id}`);
            const today = new Date().toDateString();
            
            if (lastShown !== today) {
              console.log('Showing TOP FAN congratulations popup from Favorites page');
              setShowTopFanCongratulations(true);
              localStorage.setItem(`topfan-congratulations-${user._id}`, today);
            } else {
              console.log('TOP FAN congratulations already shown today');
            }
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
      const response = await fetch(`${API_BASE_URL}/api/badges/celebration-shown`, {
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
    console.log('🏆 Testing TOP FAN popup from Favorites page...');
    console.log('👤 Current user ID:', user._id);
    console.log('📝 Full user object:', user);
    setBadgeLoading(true);
    
    try {
      // Force fetch the latest badge data
      const response = await fetch(`${API_BASE_URL}/api/badges/customer/${user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🎖️ Badge data fetched for test:', data);

      if (data.success && data.badge) {
        setTopFanBadgeData(data.badge);
        
        // Force show popup for testing regardless of celebration shown status
        console.log('Forcing TOP FAN congratulations popup for testing');
        setShowTopFanCongratulations(true);
      } else {
        // Create a test badge if none exists
        console.log('🆕 Creating test badge for user ID:', user._id);
        const createResponse = await fetch(`${API_BASE_URL}/api/badges/test/create-top-fan/${user._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const createData = await createResponse.json();
        console.log('✨ Test badge created:', createData);

        if (createData.success) {
          setTopFanBadgeData(createData.badge);
          setShowTopFanCongratulations(true);
          showSuccess('Test TOP FAN badge created and popup shown!', 'Badge Test');
        } else {
          showError('Failed to create test badge', 'Badge Test');
        }
      }
    } catch (error) {
      console.error('Error testing TOP FAN popup:', error);
      showError('Error testing TOP FAN popup. Check console for details.', 'Badge Test');
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleViewStore = (storeId) => {
    recordStoreView(storeId, user?._id, navigate);
  };

  const handleStoreUnfollowed = (storeId) => {
    // Remove the store from the local state when unfollowed
    setFollowedStores(prev => prev.filter(store => store._id !== storeId));
    showSuccess('Store unfollowed successfully', 'Success');
  };

  const getProductImageUrl = (product) => {
    if (product.picture) {
      return `${API_BASE_URL}/uploads/${product.picture}`;
    }
    return null;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon 
        key={index} 
        className={index < Math.floor(rating) ? 'customer-favorites__star customer-favorites__star--filled' : 'customer-favorites__star customer-favorites__star--empty'} 
      />
    ));
  };

  // Show login message if not authenticated
  if (!isAuthenticated || userType !== 'customer') {
    return (
      <div className="customer-favorites">
        <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
        <div className={getContentClass()}>
          <div className="customer-favorites__container">
            <div className="customer-favorites__auth-message">
              <h2>Please log in as a customer to view your favorites</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-favorites">
      <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="customer-favorites__header">
          <div className="customer-favorites__header-content">
           
          </div>
        </div>

        <div className="customer-favorites__tabs-section">
          <button 
            className={`customer-favorites__tab-button ${activeTab === 'products' ? 'customer-favorites__tab-button--active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FavoriteIcon className="customer-favorites__tab-icon" />
            Favorite Products ({favoriteProducts.length})
          </button>
          <button 
            className={`customer-favorites__tab-button ${activeTab === 'stores' ? 'customer-favorites__tab-button--active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            <StoreIcon className="customer-favorites__tab-icon" />
            Followed Stores ({followedStores.length})
          </button>
          
          {/* TOP FAN Badge Test Button - Only show when badge is active */}
          {topFanBadgeData?.isActive && (
            <button 
              onClick={handleTestTopFanPopup}
              disabled={badgeLoading}
              className="customer-favorites__top-fan-test-btn"
              style={{
                background: badgeLoading 
                  ? 'linear-gradient(135deg, #ccc 0%, #999 50%, #ccc 100%)'
                  : 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                color: '#333',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: badgeLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                boxShadow: badgeLoading 
                  ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                  : '0 2px 8px rgba(255, 215, 0, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: badgeLoading ? 0.7 : 1,
                transform: badgeLoading ? 'scale(0.95)' : 'scale(1)',
                marginLeft: 'auto'
              }}
              onMouseOver={(e) => {
                if (!badgeLoading) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (!badgeLoading) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.4)';
                }
              }}
            >
              {badgeLoading ? '⏳ Testing...' : '👑 TOP FAN BADGE'}
            </button>
          )}
        </div>

        <div className="customer-favorites__content-section">
            {activeTab === 'products' && (
              <div className="customer-favorites__products-section">
                {loading ? (
                  <div className="customer-favorites__loading">
                    <p>Loading your favorite products...</p>
                  </div>
                ) : favoriteProducts.length === 0 ? (
                  <div className="customer-favorites__empty">
                    <FavoriteIcon className="customer-favorites__empty-icon" />
                    <h3>No favorite products yet</h3>
                    <p>Start adding products to your favorites by clicking the heart icon on any product!</p>
                  </div>
                ) : (
                  <div className="customer-favorites__products-grid">
                    {favoriteProducts.map((product) => (
                      <div key={product._id} className="customer-favorites__product-card">
                        <div className="customer-favorites__product-image">
                          {getProductImageUrl(product) ? (
                            <img 
                              src={getProductImageUrl(product)} 
                              alt={product.productName}
                              className="customer-favorites__product-img"
                            />
                          ) : (
                            <div className="customer-favorites__image-placeholder">
                              <StoreIcon />
                            </div>
                          )}
                          <FavoriteButton
                            productId={product._id}
                            productName={product.productName}
                            className="customer-favorites__favorite-btn"
                            size="medium"
                            variant="overlay"
                            onToggle={(isFavorite, action) => {
                              handleFavoriteStatusChanged(product._id, isFavorite, action);
                            }}
                          />
                        </div>
                        <div className="customer-favorites__product-info">
                          <h3 className="customer-favorites__product-name">{product.productName}</h3>
                          <p className="customer-favorites__store-name">
                            {product.msmeId?.businessName || 'Unknown Store'}
                          </p>
                          <div className="customer-favorites__product-rating">
                            {product.rating ? renderStars(product.rating) : renderStars(0)}
                            <span className="customer-favorites__rating-text">
                              ({product.rating ? product.rating.toFixed(1) : '0.0'})
                            </span>
                          </div>
                          <p className="customer-favorites__product-description">
                            {product.description}
                          </p>
                          <div className="customer-favorites__product-footer">
                            <button 
                              className="customer-favorites__view-btn"
                              onClick={() => handleViewProduct(product._id)}
                            >
                              View Product
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stores' && (
              <div className="customer-favorites__stores-section">
                {loading ? (
                  <p>Loading followed stores...</p>
                ) : followedStores.length === 0 ? (
                  <p>You haven't followed any stores yet.</p>
                ) : (
                  <div className="customer-favorites__stores-grid">
                    {followedStores.map((store) => (
                      <div key={store._id} className="customer-favorites__store-card">
                        <div className="customer-favorites__store-header">
                          <div className="customer-favorites__store-avatar">
                            <StoreIcon />
                          </div>
                          <div className="customer-favorites__store-info">
                            <h3 className="customer-favorites__store-name">{store.businessName}</h3>
                            <p className="customer-favorites__store-category">{store.category}</p>
                            <div className="customer-favorites__store-location">
                              <LocationOnIcon className="customer-favorites__location-icon" />
                              <span>{store.dashboard?.location || store.address || 'Location not specified'}</span>
                            </div>
                          </div>
                          <FollowButton 
                            storeId={store._id} 
                            storeName={store.businessName}
                            onFollowChange={(isFollowing) => {
                              if (!isFollowing) {
                                handleStoreUnfollowed(store._id);
                              }
                            }}
                          />
                        </div>
                        <div className="customer-favorites__store-description">
                          <p>{store.dashboard?.description || 'A great store with quality products'}</p>
                        </div>
                        <button 
                          className="customer-favorites__visit-store-btn"
                          onClick={() => handleViewStore(store._id)}
                        >
                          Visit Store
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
  );
};

export default CustomerFavorites;
