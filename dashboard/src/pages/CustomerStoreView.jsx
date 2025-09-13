import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import '../css/CustomerStoreView.css';
import defaultStoreImg from '../assets/pic.jpg';
import foodStoreImg from '../assets/shakshouka.jpg';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const CustomerStoreView = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails();
      fetchStoreProducts();
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

  const handleFavoriteToggle = () => {
    if (!user) {
      showError('Please log in to favorite stores', 'Login Required');
      return;
    }

    setIsFavorited(!isFavorited);
    
    if (!isFavorited) {
      showSuccess(`Added ${store?.businessName || 'store'} to favorites`, 'Success');
    } else {
      showSuccess(`Removed ${store?.businessName || 'store'} from favorites`, 'Success');
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
              
              {dashboard.description && (
                <p className="store-description">{dashboard.description}</p>
              )}
              
              <div className="store-meta">
                {dashboard.location && (
                  <div className="store-detail-row">
                    <LocationOnIcon className="detail-icon location-icon" />
                    <span>{dashboard.location}</span>
                  </div>
                )}
                
                {dashboard.socialLinks?.facebook && (
                  <div className="store-detail-row">
                    <FacebookIcon className="detail-icon facebook-icon" />
                    <a href={dashboard.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                      {dashboard.socialLinks.facebook}
                    </a>
                  </div>
                )}
                
                {dashboard.socialLinks?.instagram && (
                  <div className="store-detail-row">
                    <InstagramIcon className="detail-icon instagram-icon" />
                    <a href={dashboard.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                      {dashboard.socialLinks.instagram}
                    </a>
                  </div>
                )}
                
                {store.contactNumber && (
                  <div className="store-detail-row">
                    <PhoneIcon className="detail-icon contact-icon" />
                    <span>{store.contactNumber}</span>
                  </div>
                )}
                
                {dashboard.rating && (
                  <div className="store-rating">
                    {renderStarRating(dashboard.rating)}
                  </div>
                )}
              </div>
              
              <div className="store-actions">
                <button 
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? '✓ Following' : '+ Follow'}
                </button>
                
                <button 
                  className={`favorite-heart-btn ${isFavorited ? 'favorited' : ''}`}
                  onClick={handleFavoriteToggle}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
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
          <div className="sample-review">
            <div className="reviewer-info">
              <div className="reviewer-avatar">👤</div>
              <div className="reviewer-details">
                <strong>Shakyry Baldy</strong>
                <span className="review-date">August 3, 2023</span>
              </div>
            </div>
            <div className="review-rating">
              <div className="stars">
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star empty">☆</span>
                <span className="star empty">☆</span>
              </div>
            </div>
            <p className="review-text">
              "This buko pie is absolutely delicious! The crust is golden, buttery, and flaky, complementing the soft and tender coconut filling inside. The filling has just the right level of sweetness, creamy but not overwhelming, which really lets the natural flavor of the young coconut shine through. Every bite feels comforting and homemade, like a true taste of Filipino tradition. Perfect for dessert, snacks, or even pasalubong, this buko pie is definitely worth recommending to anyone who loves classic Filipino treats."
            </p>
          </div>
          
          <div className="sample-review">
            <div className="reviewer-info">
              <div className="reviewer-avatar">👤</div>
              <div className="reviewer-details">
                <strong>Shakyry Baldy</strong>
                <span className="review-date">August 3, 2023</span>
              </div>
            </div>
            <div className="review-rating">
              <div className="stars">
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star empty">☆</span>
                <span className="star empty">☆</span>
              </div>
            </div>
            <p className="review-text">
              "This buko pie is absolutely delicious! The crust is golden, buttery, and flaky, complementing the soft and tender coconut filling inside. The filling has just the right level of sweetness, creamy but not overwhelming, which really lets the natural flavor of the young coconut shine through. Every bite feels comforting and homemade, like a true taste of Filipino tradition. Perfect for dessert, snacks, or even pasalubong, this buko pie is definitely worth recommending to anyone who loves classic Filipino treats."
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bottom-actions">
          <button className="rate-btn">RATE</button>
          <button className="chat-btn">CHAT</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerStoreView;