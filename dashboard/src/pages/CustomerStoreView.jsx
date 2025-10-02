import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import FollowButton from '../components/FollowButton';
import '../css/CustomerStoreView.css';
import defaultStoreImg from '../assets/pic.jpg';
import foodStoreImg from '../assets/shakshouka.jpg';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ChatIcon from '@mui/icons-material/Chat';
import RateReviewIcon from '@mui/icons-material/RateReview';

const CustomerStoreView = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hasExistingRating, setHasExistingRating] = useState(false);
  const [loadingExistingRating, setLoadingExistingRating] = useState(false);
  
  // Top rated products state
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  
  // Product feedbacks state
  const [productFeedbacks, setProductFeedbacks] = useState([]);

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails();
      fetchStoreProducts();
      fetchTopRatedProducts();
      fetchProductFeedbacks();
      // Record page view when customer visits store
      recordPageView();
      // Scroll to top when component mounts or storeId changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [storeId]);

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/stores/${storeId}`);
      const data = await response.json();
      
      if (data.success) {
        setStore(data.store);
      } else {
        showError("Store not found", "Error");
        navigate('/customer/stores');
      }
    } catch (error) {
      console.error("Error fetching store details:", error);
      showError("Failed to load store details", "Error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/msme/${storeId}/products`);
      const data = await response.json();
      
      if (data.success) {
        // Only show visible products to customers
        const visibleProducts = data.products.filter(product => product.visible === true);
        setProducts(visibleProducts);
      }
    } catch (error) {
      console.error("Error fetching store products:", error);
    }
  };

  const fetchTopRatedProducts = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/msme/${storeId}/products/top-rated`);
      const data = await response.json();
      
      if (data.success) {
        setTopRatedProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching top rated products:", error);
    }
  };

  const fetchProductFeedbacks = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/msme/${storeId}/products/feedbacks`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Received feedbacks:', data.feedbacks);
        setProductFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error("Error fetching product feedbacks:", error);
    }
  };

  const fetchExistingRating = async () => {
    if (!user) return;

    setLoadingExistingRating(true);
    try {
      const userId = user.id || user._id;
      const response = await fetch(`http://localhost:1337/api/stores/${storeId}/rating/${userId}`);
      const data = await response.json();

      if (data.success) {
        if (data.hasRated) {
          setRating(data.rating);
          setHasExistingRating(true);
        } else {
          setRating(0);
          setHasExistingRating(false);
        }
      }
    } catch (error) {
      console.error('Error fetching existing rating:', error);
    } finally {
      setLoadingExistingRating(false);
    }
  };

  const submitStoreRating = async () => {
    if (!user) {
      showError('Please log in to rate this store', 'Login Required');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const userName = `${user.firstname} ${user.lastname}`.trim();
      const userId = user.id || user._id;

      const response = await fetch(`http://localhost:1337/api/stores/${storeId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating, 
          user: userName,
          userId: userId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update state to reflect that user has now rated
        setHasExistingRating(true);
        setSubmitSuccess(true);
        setShowRatingModal(false);
        
        // Refresh store details
        fetchStoreDetails();
        
        // Show appropriate notification message
        const actionMessage = hasExistingRating ? 'updated' : 'rated';
        showSuccess(`You ${actionMessage} ${store.businessName} with ${rating} star${rating > 1 ? 's' : ''}!`, 'Rating Submitted');
        
        // Hide success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(data.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSubmitError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChatClick = () => {
    if (!user) {
      showError('Please log in to chat with this store', 'Login Required');
      return;
    }
    // Navigate to chat page with store info
    navigate(`/customer/chat/${storeId}`, { 
      state: { 
        storeName: store.businessName,
        storeId: storeId 
      } 
    });
  };

  const handleFollowToggle = async () => {
    if (!user) {
      showError('Please log in to follow stores', 'Login Required');
      return;
    }

    const action = isFollowing ? 'unfollow' : 'follow';

    try {
      const response = await fetch(`http://localhost:1337/api/stores/${storeId}/follow`, {
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
        setIsFollowing(!isFollowing);
        showSuccess(data.message, 'Success');
      } else {
        showError(data.error || 'Failed to update follow status', 'Error');
      }
    } catch (error) {
      console.error('Error following store:', error);
      showError('Failed to update follow status', 'Error');
    }
  };

  const recordPageView = async () => {
    // Only record page view for authenticated customers
    if (!user || !user._id) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:1337/api/stores/${storeId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user._id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Page view recorded:', data.message);
      } else {
        console.error('Failed to record page view:', data.error);
      }
    } catch (error) {
      console.error('Error recording page view:', error);
    }
  };

  const getStoreImageUrl = (store) => {
    if (store?.dashboard?.storeLogo) {
      return `http://localhost:1337/uploads/${store.dashboard.storeLogo}`;
    }
    
    if (store?.dashboard?.coverPhoto) {
      return `http://localhost:1337/uploads/${store.dashboard.coverPhoto}`;
    }
    
    if (store?.category === 'food') {
      return foodStoreImg;
    } else if (store?.category === 'artisan') {
      return defaultStoreImg;
    }
    
    return defaultStoreImg;
  };

  const getProductImageUrl = (product) => {
    if (product.picture) {
      return `http://localhost:1337/uploads/${product.picture}`;
    }
    return foodStoreImg; // Default product image
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

  if (loading) {
    return (
      <div className="customer-store-view-container">
        <Header />
        <div className="customer-store-view-content">
          <div className="loading-state">
            <p>Loading store...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="customer-store-view-container">
        <Header />
        <div className="customer-store-view-content">
          <div className="error-state">
            <p>Store not found</p>
            <button onClick={() => navigate('/customer/stores')} className="back-button">
              Back to Stores
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dashboard = store.dashboard || {};

  return (
    <div className="customer-store-view-container">
      <Header />
      <div className="customer-store-view-content">
        {/* Back Button */}
        <button 
          className="back-to-stores-btn"
          onClick={() => navigate('/customer/stores')}
        >
          <ArrowBackIcon /> Back to Stores
        </button>

        {/* Cover Photo Header */}
        <div className="store-cover-section">
          <div className="cover-photo">
            <img 
              src={dashboard.coverPhoto ? `http://localhost:1337/uploads/${dashboard.coverPhoto}` : getStoreImageUrl(store)} 
              alt={store.businessName}
              className="cover-image"
              onError={(e) => {
                e.target.src = store.category === 'food' ? foodStoreImg : defaultStoreImg;
              }}
            />
          </div>
          
          {/* Store Logo and Info Section */}
          <div className="store-info-section">
            <div className="store-logo-container">
              <img 
                src={getStoreImageUrl(store)} 
                alt={store.businessName}
                className="store-logo-main"
                onError={(e) => {
                  e.target.src = store.category === 'food' ? foodStoreImg : defaultStoreImg;
                }}
              />
            </div>
            
            <div className="store-details">
              <h1 className="store-name">{store.businessName}</h1>
              
              {/* Username */}
              <div className="store-detail-row username-row">
                <PersonIcon className="detail-icon username-icon" />
                <span className="username-text">@{store.username}</span>
              </div>
              
              {/* Description */}
              {dashboard.description && (
                <p className="store-description">{dashboard.description}</p>
              )}
              
              <div className="store-meta">
                {/* Location */}
                {dashboard.location && (
                  <div className="store-detail-row">
                    <LocationOnIcon className="detail-icon location-icon" />
                    <span>{dashboard.location}</span>
                  </div>
                )}
                
                {/* Contact Number - prioritize dashboard contact number, fallback to store contact number */}
                {(dashboard.contactNumber || store.contactNumber) && (
                  <div className="store-detail-row">
                    <PhoneIcon className="detail-icon contact-icon" />
                    <span>{dashboard.contactNumber || store.contactNumber}</span>
                  </div>
                )}
                
                {/* Social Media Links */}
                {dashboard.socialLinks?.facebook && (
                  <div className="store-detail-row">
                    <FacebookIcon className="detail-icon facebook-icon" />
                    <a href={dashboard.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                      Facebook
                    </a>
                  </div>
                )}
                
                {dashboard.socialLinks?.instagram && (
                  <div className="store-detail-row">
                    <InstagramIcon className="detail-icon instagram-icon" />
                    <a href={dashboard.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                      Instagram
                    </a>
                  </div>
                )}
                
                {dashboard.socialLinks?.twitter && (
                  <div className="store-detail-row">
                    <TwitterIcon className="detail-icon twitter-icon" />
                    <a href={dashboard.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                      Twitter
                    </a>
                  </div>
                )}
                
                {dashboard.socialLinks?.website && (
                  <div className="store-detail-row">
                    <LanguageIcon className="detail-icon website-icon" />
                    <a href={dashboard.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link">
                      Website
                    </a>
                  </div>
                )}
                
                {/* Store Rating */}
                <div className="store-rating">
                  {renderStarRating(store.averageRating || 0)}
                  {store.totalRatings > 0 && (
                    <span className="total-ratings">({store.totalRatings} rating{store.totalRatings !== 1 ? 's' : ''})</span>
                  )}
                </div>
              </div>
              
              <div className="store-actions">
                <FollowButton 
                  storeId={storeId} 
                  storeName={store?.businessName}
                  onFollowChange={(isFollowing) => {
                    setIsFollowing(isFollowing);
                  }}
                />
                <button 
                  className="rate-btn-header"
                  onClick={() => {
                    setShowRatingModal(true);
                    fetchExistingRating();
                  }}
                  title="Rate this store"
                >
                  <RateReviewIcon />
                  RATE
                </button>
                <button 
                  className="chat-btn-header"
                  onClick={handleChatClick}
                  title="Chat with store"
                >
                  <ChatIcon />
                  CHAT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="store-products">
          <h2>PRODUCTS</h2>
          {products.length === 0 ? (
            <div className="no-products">
              <p>No products available at the moment.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="product-card"
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={getProductImageUrl(product)} 
                    alt={product.productName}
                    className="product-image"
                  />
                  <div className="product-name-overlay">
                    {product.productName}
                  </div>
                  <div className="product-price-tag">
                    ₱{product.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="store-reviews">
          {/* Top Rated Products Section */}
          {topRatedProducts.length > 0 && (
            <div className="top-reviews-section">
              <h3>Top Rated Products</h3>
              <div className="top-products-grid">
                {topRatedProducts.slice(0, 3).map((product, index) => (
                  <div 
                    key={product._id} 
                    className="top-product-card"
                    onClick={() => navigate(`/product/${product._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={getProductImageUrl(product)} 
                      alt={product.productName}
                      className="top-product-image"
                    />
                    <div className="top-product-info">
                      <h4 className="top-product-name">{product.productName}</h4>
                      <div className="top-product-rating">
                        <div className="stars">
                          {'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}
                        </div>
                        <span className="rating-text">({product.rating ? product.rating.toFixed(1) : '0.0'})</span>
                      </div>
                      <div className="top-product-price">₱{product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Feedbacks Section */}
          <div className="product-feedbacks-section">
            <h3>Customer Reviews</h3>
            {productFeedbacks.length > 0 ? (
              <div className="feedbacks-list">
                {productFeedbacks.map((feedback, index) => (
                  <div key={index} className="feedback-item">
                    <div className="feedback-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {(feedback.userName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="reviewer-details">
                          <strong>{feedback.userName || 'Anonymous'}</strong>
                          <span className="review-date">
                            {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="stars">
                          {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Review text */}
                    <p className="review-text">"{feedback.feedback}"</p>
                    
                    {/* Product name */}
                    <div className="reviewed-product-name">
                      <span className="product-label">Product: </span>
                      <span className="product-name-text">{feedback.productName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>No product reviews yet. Be the first to review a product from this store!</p>
              </div>
            )}
          </div>
        </div>

        {/* Rating Modal - Simplified to stars only */}
        {showRatingModal && (
          <div className="rating-modal-overlay" onClick={() => {
            setShowRatingModal(false);
            // Reset modal state
            setRating(0);
            setHoverRating(0);
            setHasExistingRating(false);
            setSubmitError(null);
            setSubmitSuccess(false);
          }}>
            <div className="rating-modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="rating-modal-close"
                onClick={() => {
                  setShowRatingModal(false);
                  // Reset modal state
                  setRating(0);
                  setHoverRating(0);
                  setHasExistingRating(false);
                  setSubmitError(null);
                  setSubmitSuccess(false);
                }}
              >
                ×
              </button>
              
              <h3>
                {loadingExistingRating 
                  ? `Loading rating for ${store?.businessName}...` 
                  : hasExistingRating 
                    ? `Update your rating for ${store?.businessName}` 
                    : `Rate ${store?.businessName}`
                }
              </h3>
              
              {!user ? (
                <div className="auth-message">
                  <p>Please log in to rate this store.</p>
                </div>
              ) : loadingExistingRating ? (
                <div className="loading-rating">
                  <p>Loading your previous rating...</p>
                </div>
              ) : (
                <div className="modal-rating-section">
                  {hasExistingRating && (
                    <div className="existing-rating-info">
                      <p>You previously rated this store {rating} star{rating > 1 ? 's' : ''}. You can update your rating below.</p>
                    </div>
                  )}
                  
                  <div className="rating-input">
                    {[1,2,3,4,5].map(star => (
                      <span
                        key={star}
                        className={`star-input ${(hoverRating || rating) >= star ? 'filled' : 'empty'}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        {(hoverRating || rating) >= star ? (
                          <StarIcon className="star-icon filled" />
                        ) : (
                          <StarBorderIcon className="star-icon empty" />
                        )}
                      </span>
                    ))}
                    {rating > 0 && <span className="rating-label">{rating} Star{rating > 1 ? 's' : ''}</span>}
                  </div>
                  
                  <button
                    onClick={submitStoreRating}
                    disabled={submitting || rating === 0}
                    className="submit-rating-button"
                  >
                    {submitting 
                      ? 'Submitting...' 
                      : hasExistingRating 
                        ? 'Update Rating' 
                        : 'Submit Rating'
                    }
                  </button>
                  
                  {submitError && <div className="error-message">{submitError}</div>}
                  {submitSuccess && <div className="success-message">Rating submitted successfully!</div>}
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default CustomerStoreView;