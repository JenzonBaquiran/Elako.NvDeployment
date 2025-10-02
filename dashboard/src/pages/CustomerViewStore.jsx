import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import FollowButton from '../components/FollowButton';
import StoreImage from '../components/StoreImage';
import { recordStoreView } from '../utils/storeViewTracker';
import '../css/CustomerViewStore.css';
import '../components/StoreImage.css';
import defaultStoreImg from '../assets/pic.jpg';
import foodStoreImg from '../assets/shakshouka.jpg';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const CustomerViewStore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [followedStores, setFollowedStores] = useState(new Set());
  const [favoritedStores, setFavoritedStores] = useState(new Set());

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // API Functions
  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:1337/api/stores');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.stores)) {
        setStores(data.stores);
      } else {
        showError("Failed to fetch stores", "Error");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      showError("Failed to fetch stores", "Error");
    } finally {
      setLoading(false);
    }
  };

  // Filter stores based on search and filters
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (store.dashboard?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (store.dashboard?.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || store.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getStoreBadgeClass = (category) => {
    switch (category) {
      case 'food':
        return 'food-badge';
      case 'artisan':
        return 'artisan-badge';
      default:
        return 'default-badge';
    }
  };

  const formatCategoryName = (category) => {
    switch (category) {
      case 'food':
        return 'Food & Beverages';
      case 'artisan':
        return 'Arts & Crafts';
      default:
        return category || 'Business';
    }
  };

  const getDaysAgo = (dateString) => {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 14) return "1 week ago";
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleFollowToggle = async (store) => {
    if (!user) {
      showError('Please log in to follow stores', 'Login Required');
      return;
    }

    const isFollowing = followedStores.has(store._id);
    const action = isFollowing ? 'unfollow' : 'follow';

    try {
      const response = await fetch(`http://localhost:1337/api/stores/${store._id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user._id,
          action: action
        })
      });

      const data = await response.json();

      if (data.success) {
        const newFollowedStores = new Set(followedStores);
        if (action === 'follow') {
          newFollowedStores.add(store._id);
        } else {
          newFollowedStores.delete(store._id);
        }
        setFollowedStores(newFollowedStores);
        showSuccess(data.message, 'Success');
      } else {
        showError(data.error || 'Failed to update follow status', 'Error');
      }
    } catch (error) {
      console.error('Error following store:', error);
      showError('Failed to update follow status', 'Error');
    }
  };

  const handleFavoriteToggle = (store) => {
    const newFavoritedStores = new Set(favoritedStores);
    if (favoritedStores.has(store._id)) {
      newFavoritedStores.delete(store._id);
      showSuccess(`Removed ${store.businessName} from favorites`, 'Success');
    } else {
      newFavoritedStores.add(store._id);
      showSuccess(`Added ${store.businessName} to favorites`, 'Success');
    }
    setFavoritedStores(newFavoritedStores);
  };



  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }

    return (
      <div className="rating-container">
        <div className="stars">{stars}</div>
        <span className="rating-value">({rating > 0 ? rating.toFixed(1) : '0.0'})</span>
      </div>
    );
  };

  const getContentClass = () => {
    return 'customer-view-store-content';
  };

  return (
    <div className="customer-view-store-container">
      <Header />
      <div className={getContentClass()}>
        <div className="customer-view-store-header">
          <div className="customer-view-store-header-content">
            <div className="customer-view-store-header-text">
              <h1>Browse Stores</h1>
              <p>Discover amazing MSME stores and their products.</p>
            </div>
          </div>
        </div>
        
        <div className="customer-view-store-filters">
          <div className="customer-view-store-filters-row">
            <input 
              type="text" 
              placeholder="Search stores..." 
              className="customer-view-store-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="customer-view-store-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="food">Food & Beverages</option>
              <option value="artisan">Arts & Crafts</option>
            </select>
          </div>
        </div>

        <section className="customer-view-store-grid">
          {loading ? (
            <div className="loading-state">
              <p>Loading stores...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="empty-state">
              <p>{stores.length === 0 ? 'No stores found.' : 'No stores match your search criteria.'}</p>
            </div>
          ) : (
            filteredStores.map((store) => {
              const dashboard = store.dashboard || {};
              const isNew = getDaysAgo(store.createdAt).includes('day') && parseInt(getDaysAgo(store.createdAt)) <= 7;
              
              return (
                <div key={store._id} className="customer-view-store-card">
                  <div className="customer-view-store-visibility-indicator">
                    <span className={`category-badge ${getStoreBadgeClass(store.category)}`}>
                      {formatCategoryName(store.category)}
                    </span>
                    {isNew && <span className="new-badge">NEW</span>}
                  </div>
                  
                  <StoreImage 
                    store={store}
                    className="customer-view-store-image"
                    alt={store.businessName}
                  />
                  
                  <div className="customer-view-store-info">
                    <div className="customer-view-store-top-content">
                      <div className="store-name-section">
                        <h3>{store.businessName}</h3>
                        <button 
                          className={`favorite-heart-btn ${favoritedStores.has(store._id) ? 'favorited' : ''}`}
                          onClick={() => handleFavoriteToggle(store)}
                          title={favoritedStores.has(store._id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favoritedStores.has(store._id) ? 
                            <FavoriteIcon /> : 
                            <FavoriteBorderIcon />
                          }
                        </button>
                      </div>
                      <p className="customer-view-store-username">@{store.username}</p>
                      
                      {/* Store Details with Icons */}
                      <div className="store-details-section">
                        {/* Location */}
                        {(dashboard.location || store.address) && (
                          <div className="store-detail-item">
                            <LocationOnIcon className="detail-icon" />
                            <span>{dashboard.location || store.address || 'Location not specified'}</span>
                          </div>
                        )}
                        
                        {/* Rating */}
                        <div className="store-detail-item">
                          <div className="rating-inline">
                            {renderStarRating(dashboard.rating || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="customer-view-store-bottom-content">
                      <div className="customer-view-store-actions">
                        <button 
                          className="customer-view-store-visit-btn"
                          onClick={() => {
                            // Record page view and navigate using the utility function
                            recordStoreView(store._id, user?._id, navigate);
                          }}
                        >
                          Visit Store
                        </button>
                        <FollowButton 
                          storeId={store._id} 
                          storeName={store.businessName}
                          onFollowChange={(isFollowing) => {
                            const newFollowedStores = new Set(followedStores);
                            if (isFollowing) {
                              newFollowedStores.add(store._id);
                            } else {
                              newFollowedStores.delete(store._id);
                            }
                            setFollowedStores(newFollowedStores);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerViewStore;
