import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import { API_BASE_URL } from '../config/api';
import FollowButton from '../components/FollowButton';
import StoreImage from '../components/StoreImage';
import { recordStoreView } from '../utils/storeViewTracker';
import '../css/CustomerViewStore.css';
import '../components/StoreImage.css';
import defaultStoreImg from '../assets/pic.jpg';
import foodStoreImg from '../assets/shakshouka.jpg';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const CustomerViewStore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [followedStores, setFollowedStores] = useState(new Set());

  // Fetch stores on component mount and when user changes
  useEffect(() => {
    fetchStores();
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user]); // Added user as dependency to refetch when user logs in/out

  // API Functions
  const fetchStores = async () => {
    setLoading(true);
    try {
      // For Browse Stores page, show ALL stores (don't exclude followed stores)
      const url = `${API_BASE_URL}/api/stores`;
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.stores)) {
        console.log('Store data received:', data.stores[0]); // Debug: Check actual store data structure
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
    // Handle null, undefined, or empty category
    if (!category || category.trim() === '') return 'default-badge';
    
    const categoryLower = category.toLowerCase().trim();
    
    if (categoryLower.includes('food') || categoryLower.includes('beverage') || categoryLower.includes('restaurant') || categoryLower.includes('cafe')) {
      return 'food-badge';
    }
    
    if (categoryLower.includes('artisan') || categoryLower.includes('art') || categoryLower.includes('craft') || categoryLower.includes('handmade')) {
      return 'artisan-badge';
    }
    
    if (categoryLower.includes('fashion') || categoryLower.includes('clothing') || categoryLower.includes('apparel')) {
      return 'fashion-badge';
    }
    
    if (categoryLower.includes('tech') || categoryLower.includes('technology') || categoryLower.includes('digital')) {
      return 'tech-badge';
    }
    
    if (categoryLower.includes('retail') || categoryLower.includes('shop')) {
      return 'retail-badge';
    }
    
    if (categoryLower.includes('service')) {
      return 'service-badge';
    }
    
    return 'default-badge';
  };

  const formatCategoryName = (category) => {
    // Handle null, undefined, or empty category
    if (!category || category.trim() === '') return 'STORE';
    
    const categoryLower = category.toLowerCase().trim();
    
    if (categoryLower.includes('food') || categoryLower.includes('beverage') || categoryLower.includes('restaurant') || categoryLower.includes('cafe')) {
      return 'FOOD';
    }
    
    if (categoryLower.includes('artisan') || categoryLower.includes('art') || categoryLower.includes('craft') || categoryLower.includes('handmade')) {
      return 'ARTISAN';
    }
    
    if (categoryLower.includes('fashion') || categoryLower.includes('clothing') || categoryLower.includes('apparel')) {
      return 'FASHION';
    }
    
    if (categoryLower.includes('tech') || categoryLower.includes('technology') || categoryLower.includes('digital')) {
      return 'TECH';
    }
    
    if (categoryLower.includes('retail') || categoryLower.includes('shop')) {
      return 'RETAIL';
    }
    
    if (categoryLower.includes('service')) {
      return 'SERVICE';
    }
    
    // Return the original category in uppercase, or 'STORE' if empty
    return category.toUpperCase();
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
      const response = await fetch(`${API_BASE_URL}/api/stores/${store._id}/follow`, {
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
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        
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
              // Calculate if store is new (created within last 7 days)
              const isNew = (() => {
                if (!store.createdAt) return false;
                const createdDate = new Date(store.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now - createdDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              })();
              
              const categoryName = formatCategoryName(store.category);
              const badgeClass = getStoreBadgeClass(store.category);
              const daysAgoText = getDaysAgo(store.createdAt);
              
              // Debug: Log store data for badges
              console.log(`Store: ${store.businessName}`);
              console.log(`- Category: "${store.category}" (${typeof store.category})`);
              console.log(`- Created: ${store.createdAt}`);
              console.log(`- Days Ago Text: ${daysAgoText}`);
              console.log(`- Is New: ${isNew}`);
              console.log(`- Category Name: ${categoryName}`);
              console.log(`- Badge Class: ${badgeClass}`);
              
              // Temporary: Force first store to be "new" for testing
              const isNewForTesting = (store === filteredStores[0] || isNew);
              console.log(`- Is New (Testing): ${isNewForTesting}`);
              console.log('---');
              
              return (
                <div key={store._id} className="customer-view-store-card">
                  {/* Category badge on the left - always show */}
                  <div className="category-badge-container">
                    <span className={`category-badge ${badgeClass}`}>
                      {categoryName}
                    </span>
                  </div>
                  
                  {/* NEW badge on the right */}
                  {isNewForTesting && (
                    <div className="new-badge-container">
                      <span className="new-badge">NEW</span>
                    </div>
                  )}
                  
                  <StoreImage 
                    store={store}
                    className="customer-view-store-image"
                    alt={store.businessName}
                  />
                  
                  <div className="customer-view-store-info">
                    <div className="customer-view-store-top-content">
                      <div className="store-name-section">
                        <h3>{store.businessName}</h3>
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
