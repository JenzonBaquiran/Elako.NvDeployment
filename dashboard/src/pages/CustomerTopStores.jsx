import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import heroPic from '../pictures/IMG_6125.jpg';
import '../css/Home.css';
import '../css/CustomerTopStores.css';

function CustomerTopStores() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [topStores, setTopStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [followedStores, setFollowedStores] = useState([]);

  useEffect(() => {
    fetchAllTopStores();
    if (user && user._id) {
      fetchFollowedStores();
    }
  }, [currentPage, user]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchAllTopStores = async () => {
    try {
      setLoading(true);
      console.log('Fetching all top stores, page:', currentPage);
      
      const response = await fetch(`http://localhost:1337/api/top-stores/all?page=${currentPage}&limit=16`);
      const data = await response.json();
      
      if (data.success) {
        console.log('All Top Stores fetched:', data.stores.length, 'stores');
        console.log('Total available:', data.total, 'stores');
        console.log('Sample store data:', data.stores[0]); // Debug: Check actual data structure
        setTopStores(data.stores);
        setTotalStores(data.total);
        setTotalPages(Math.ceil(data.total / 16));
      } else {
        console.error('Failed to fetch all top stores:', data.error);
      }
    } catch (error) {
      console.error('Error fetching all top stores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch followed stores
  const fetchFollowedStores = async () => {
    if (!user || !user._id) return;
    
    try {
      const response = await fetch(`http://localhost:1337/api/customers/${user._id}/followed-stores`);
      const data = await response.json();
      
      if (data.success) {
        setFollowedStores(data.followedStores.map(store => store._id));
      }
    } catch (error) {
      console.error('Error fetching followed stores:', error);
    }
  };

  // Toggle follow store
  const toggleFollowStore = async (store) => {
    if (!user || !user._id) {
      showError('Please log in to follow stores', 'Login Required');
      return;
    }
    
    const isFollowing = followedStores.includes(store._id);
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
        if (action === 'follow') {
          setFollowedStores(prev => [...prev, store._id]);
          showSuccess(`Now following ${store.businessName || store.storeName}`, 'Success');
        } else {
          setFollowedStores(prev => prev.filter(id => id !== store._id));
          showSuccess(`Unfollowed ${store.businessName || store.storeName}`, 'Success');
        }
      } else {
        showError(data.error || 'Failed to update follow status', 'Error');
      }
    } catch (error) {
      console.error('Error toggling follow store:', error);
      showError('Failed to update follow status', 'Error');
    }
  };

  // Helper function to get store category badge
  const getCategoryBadge = (category) => {
    const badges = {
      'Food & Beverages': { label: 'Food', class: 'food-badge' },
      'food': { label: 'Food', class: 'food-badge' },
      'Arts & Crafts': { label: 'Arts & Crafts', class: 'artisan-badge' },
      'artisan': { label: 'Arts & Crafts', class: 'artisan-badge' },
      'Fashion': { label: 'Fashion', class: 'fashion-badge' },
      'Technology': { label: 'Technology', class: 'tech-badge' },
      'Home & Garden': { label: 'Home & Garden', class: 'home-badge' }
    };
    return badges[category] || { label: 'Store', class: 'default-badge' };
  };

  // Check if store is new (created within last 30 days)
  const isNewStore = (createdAt) => {
    if (!createdAt) return false;
    const storeDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return storeDate > thirtyDaysAgo;
  };

  return (
    <div>
      <Navbar />
      
      <div className="browse-stores-page">
        <div className="browse-stores-content">
          <button 
            className="back-button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              navigate('/');
            }}
          >
            ← Back to Home
          </button>
          
          <div className="browse-stores-header">
            <h1>Top Stores</h1>
            <p>Discover amazing MSME stores with 4.0-5.0 star ratings and their products.</p>
          </div>

          <div className="stores-container">
          {loading ? (
            <div className="loading-state">
              <p>Loading top stores...</p>
            </div>
          ) : topStores.length === 0 ? (
            <div className="empty-state">
              <p>No top stores found.</p>
            </div>
          ) : (
            <div className="browse-stores-grid">
              {topStores.map((store) => {
                const categoryBadge = getCategoryBadge(store.category);
                const isNew = isNewStore(store.createdAt);
                // Use cover photo or store logo, fallback to hero image
                const storeImage = store.dashboard?.coverPhoto 
                  ? `http://localhost:1337/uploads/${store.dashboard.coverPhoto}` 
                  : store.dashboard?.storeLogo 
                    ? `http://localhost:1337/uploads/${store.dashboard.storeLogo}` 
                    : heroPic;
                const isFollowed = followedStores.includes(store._id);
                
                return (
                  <div className="top-store-card" key={store._id}>
                    {/* Category Badge */}
                    <div className={`category-badge ${categoryBadge.class}`}>
                      {categoryBadge.label}
                    </div>

                    {/* Store Image */}
                    <img 
                      src={storeImage} 
                      alt={store.businessName || store.storeName}
                      className="top-store-image"
                      onError={(e) => {
                        e.target.src = heroPic;
                      }}
                    />
                    
                    <div className="top-store-info">
                      <div className="top-store-content">
                        <h3 className="top-store-name">{store.businessName || store.storeName}</h3>
                        <p className="top-store-description">
                          {store.dashboard?.description || store.description || store.businessDescription || "Discover amazing products and services from this top-rated local business."}
                        </p>
                        
                        {/* Rating */}
                        <div className="top-store-rating">
                          <span className="rating-star">★</span>
                          <span className="rating-value">{store.averageRating?.toFixed(1) || '4.5'}</span>
                          <span className="rating-count">({store.totalRatings || store.totalReviews || Math.floor(Math.random() * 10) + 1} reviews)</span>
                        </div>
                      </div>

                      {/* Store Actions */}
                      <div className="customer-view-store-actions">
                        <button 
                          className="customer-view-store-visit-btn"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            navigate(`/customer/store/${store._id}`);
                          }}
                        >
                          Visit Store
                        </button>
                        <button 
                          className={`customer-view-store-follow-btn ${isFollowed ? 'following' : ''}`}
                          onClick={() => toggleFollowStore(store)}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
        </div>
      </div>


    </div>
  );
}

export default CustomerTopStores;
