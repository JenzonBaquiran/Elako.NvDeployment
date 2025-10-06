import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MsmeSidebar from './MsmeSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import '../css/MsmeReviews.css';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';

const MsmeReviews = () => {
  const { user, userType, isAuthenticated } = useAuth();
  const { showError } = useNotification();
  const navigate = useNavigate();
  
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Fetch store reviews and products on component mount
  useEffect(() => {
    if (isAuthenticated && userType === 'msme' && user?._id) {
      fetchStoreReviews();
      fetchStoreProducts();
    }
  }, [isAuthenticated, userType, user]);

  const fetchStoreReviews = async () => {
    setLoading(true);
    try {
      console.log('Fetching reviews for store:', user._id);
      const response = await fetch(`http://localhost:1337/api/stores/${user._id}/reviews`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Store reviews API response:', data);
      
      if (data.success) {
        console.log('Reviews found:', data.reviews ? data.reviews.length : 0);
        setReviews(data.reviews || []);
        calculateStats(data.reviews || []);
      } else {
        console.log('API error:', data.error);
        // Don't show error for no reviews, it's normal
        if (!data.error.includes('No products') && !data.error.includes('No reviews')) {
          showError('Failed to load your store reviews', 'Error');
        }
      }
    } catch (error) {
      console.error('Error fetching store reviews:', error);
      showError('Failed to load your store reviews', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async () => {
    setLoadingProducts(true);
    try {
      console.log('Fetching products for store:', user._id);
      const response = await fetch(`http://localhost:1337/api/products?msmeId=${user._id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Store products API response:', data);
      
      if (data.success) {
        console.log('Products found:', data.products.length);
        // Log feedback data for debugging
        data.products.forEach(product => {
          console.log(`Product: ${product.productName}, Feedback:`, product.feedback);
        });
        setProducts(data.products);
      } else {
        console.log('API error:', data.error);
        showError('Failed to load your store products', 'Error');
      }
    } catch (error) {
      console.error('Error fetching store products:', error);
      showError('Failed to load your store products', 'Error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateStats = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const totalReviews = reviewsData.length;
    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    setStats({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    });
  };

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'msme-reviews__content msme-reviews__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'msme-reviews__content msme-reviews__content--sidebar-open' 
      : 'msme-reviews__content msme-reviews__content--sidebar-collapsed';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className="msme-reviews__star">
        {index < rating ? (
          <StarIcon className="msme-reviews__star--filled" />
        ) : (
          <StarBorderIcon className="msme-reviews__star--empty" />
        )}
      </span>
    ));
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getProductImageUrl = (imagePath) => {
    if (imagePath) {
      return `http://localhost:1337/uploads/${imagePath}`;
    }
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getRatingPercentage = (rating) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((stats.ratingDistribution[rating] / stats.totalReviews) * 100);
  };

  const handleProductClick = (product) => {
    // Get reviews for this specific product from both sources
    let productReviews = [];
    
    // First, try to get reviews from the global reviews array (from store reviews API)
    const globalProductReviews = reviews.filter(review => 
      review.productId && review.productId.toString() === product._id.toString()
    );
    
    // Then, get reviews from the product's feedback array
    const productFeedbackReviews = product.feedback ? product.feedback.map(feedback => ({
      _id: feedback._id || `feedback_${Date.now()}_${Math.random()}`,
      productId: product._id,
      product: {
        productName: product.productName,
        picture: product.picture,
      },
      customer: feedback.userId ? null : { firstname: feedback.user ? feedback.user.split(' ')[0] : 'Anonymous', lastname: feedback.user ? feedback.user.split(' ').slice(1).join(' ') : '' },
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt || new Date(),
    })) : [];
    
    // Combine both sources, preferring global reviews if they exist
    productReviews = globalProductReviews.length > 0 ? globalProductReviews : productFeedbackReviews;
    
    // Calculate product-specific stats
    const productStats = {
      totalReviews: productReviews.length,
      averageRating: productReviews.length > 0 
        ? Math.round((productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length) * 10) / 10
        : 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    productReviews.forEach(review => {
      productStats.ratingDistribution[review.rating]++;
    });

    setSelectedProduct({
      ...product,
      reviews: productReviews,
      stats: productStats
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const getProductRatingPercentage = (rating, productStats) => {
    if (productStats.totalReviews === 0) return 0;
    return Math.round((productStats.ratingDistribution[rating] / productStats.totalReviews) * 100);
  };

  // Filter and search logic
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Rating filter
    if (selectedRating !== 'all') {
      filtered = filtered.filter(product => {
        const feedbackRatings = product.feedback || [];
        const avgRating = feedbackRatings.length > 0 
          ? feedbackRatings.reduce((sum, fb) => sum + fb.rating, 0) / feedbackRatings.length
          : 0;
        
        if (selectedRating === '4+') return avgRating >= 4;
        if (selectedRating === '3+') return avgRating >= 3;
        if (selectedRating === '2+') return avgRating >= 2;
        if (selectedRating === '1+') return avgRating >= 1;
        return true;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'price':
          return a.price - b.price;
        case 'rating':
          const aRating = a.feedback?.length > 0 
            ? a.feedback.reduce((sum, fb) => sum + fb.rating, 0) / a.feedback.length 
            : 0;
          const bRating = b.feedback?.length > 0 
            ? b.feedback.reduce((sum, fb) => sum + fb.rating, 0) / b.feedback.length 
            : 0;
          return bRating - aRating;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Get unique categories from products
  const getCategories = () => {
    const categories = products.map(product => product.category).filter(Boolean);
    return [...new Set(categories)];
  };

  // Show login message if not authenticated
  if (!isAuthenticated || userType !== 'msme') {
    return (
      <div className="msme-reviews">
        <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
        <div className={getContentClass()}>
          <div className="msme-reviews__container">
            <div className="msme-reviews__auth-message">
              <h2>Please log in as an MSME to view your store reviews</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="msme-reviews">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-reviews__header">
          <div className="msme-reviews__header-content">
            <div className="msme-reviews__header-text">
            
            </div>
          </div>
        </div>

        {/* Products Gallery Section */}
        <div className="msme-reviews__products-section">
          <div className="msme-reviews__products-header">
            <h2> Review's and Ratings</h2>
            <p>Click on any product to view its reviews and ratings</p>
            
            {/* Search and Filter Controls */}
            <div className="msme-reviews__controls">
              {/* Search Bar */}
              <div className="msme-reviews__search">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="msme-reviews__search-input"
                />
              </div>

              {/* Filters */}
              <div className="msme-reviews__filters">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="msme-reviews__filter-select"
                >
                  <option value="all">All Categories</option>
                  {getCategories().map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Rating Filter */}
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="msme-reviews__filter-select"
                >
                  <option value="all">All Ratings</option>
                  <option value="4+">4+ Stars</option>
                  <option value="3+">3+ Stars</option>
                  <option value="2+">2+ Stars</option>
                  <option value="1+">1+ Stars</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="msme-reviews__filter-select"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="newest">Sort by Newest</option>
                </select>
              </div>
            </div>
          </div>
          
          {loadingProducts ? (
            <div className="msme-reviews__loading">
              <p>Loading your products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="msme-reviews__empty">
              <GridViewIcon className="msme-reviews__empty-icon" />
              <h3>No products found</h3>
              <p>You haven't added any products yet. Add products to see their reviews here.</p>
            </div>
          ) : getFilteredProducts().length === 0 ? (
            <div className="msme-reviews__empty">
              <GridViewIcon className="msme-reviews__empty-icon" />
              <h3>No products match your filters</h3>
              <p>Try adjusting your search terms or filters to find products.</p>
            </div>
          ) : (
            <div className="msme-reviews__products-grid">
              {getFilteredProducts().map((product) => {
                // Calculate average rating from feedback
                const feedbackRatings = product.feedback || [];
                const avgRating = feedbackRatings.length > 0 
                  ? feedbackRatings.reduce((sum, fb) => sum + fb.rating, 0) / feedbackRatings.length
                  : 0;
                
                return (
                  <div 
                    key={product._id} 
                    className="msme-reviews__product-card"
                  >
                    {/* Product Image */}
                    <div className="msme-reviews__product-image-container">
                      {getProductImageUrl(product.picture) ? (
                        <img 
                          src={getProductImageUrl(product.picture)} 
                          alt={product.productName}
                          className="msme-reviews__product-card-img"
                        />
                      ) : (
                        <div className="msme-reviews__product-placeholder">No Image</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="msme-reviews__product-card-content">
                      <h4 className="msme-reviews__product-card-name">{product.productName}</h4>
                      <p className="msme-reviews__product-card-store">{user?.businessName || 'Your Store'}</p>
                      
                      {/* Rating Stars */}
                      <div className="msme-reviews__product-card-rating">
                        <div className="msme-reviews__product-card-stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`msme-reviews__product-card-star ${star <= Math.round(avgRating) ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="msme-reviews__product-card-rating-text">
                          ({avgRating > 0 ? avgRating.toFixed(1) : '0.0'})
                        </span>
                      </div>

                      {/* Product Description */}
                      <p className="msme-reviews__product-card-description">
                        {product.description}
                      </p>

                      {/* Category Tag */}
                      {product.category && (
                        <div className="msme-reviews__product-card-category">
                          {product.category.toUpperCase()}
                        </div>
                      )}

                      {/* View Product Button */}
                      <button 
                        className="msme-reviews__product-card-button"
                        onClick={() => handleProductClick(product)}
                      >
                        View Product Reviews & Rating
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>

      {/* Product Review Modal */}
      {isModalOpen && selectedProduct && (
        <div className="msme-reviews__modal-overlay" onClick={closeModal}>
          <div className="msme-reviews__modal" onClick={(e) => e.stopPropagation()}>
            <div className="msme-reviews__modal-header">
              <h2>{selectedProduct.productName}</h2>
              <button className="msme-reviews__modal-close" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="msme-reviews__modal-content">
              <div className="msme-reviews__modal-product-info">
                <div className="msme-reviews__modal-image">
                  {getProductImageUrl(selectedProduct.picture) ? (
                    <img 
                      src={getProductImageUrl(selectedProduct.picture)} 
                      alt={selectedProduct.productName}
                      className="msme-reviews__modal-img"
                    />
                  ) : (
                    <div className="msme-reviews__modal-image-placeholder">No Image</div>
                  )}
                </div>
                
                <div className="msme-reviews__modal-details">
                  <h3>{selectedProduct.productName}</h3>
                  <p className="msme-reviews__modal-description">{selectedProduct.description}</p>
                  <p className="msme-reviews__modal-price">₱{selectedProduct.price}</p>
                  <p className="msme-reviews__modal-availability">
                    Status: {selectedProduct.availability ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>

              {/* Product-specific Stats */}
              <div className="msme-reviews__modal-stats">
                <div className="msme-reviews__modal-rating-summary">
                  <div className="msme-reviews__modal-overall-rating">
                    <div className="msme-reviews__modal-rating-number">{selectedProduct.stats.averageRating}</div>
                    <div className="msme-reviews__modal-rating-stars">
                      {renderStars(Math.round(selectedProduct.stats.averageRating))}
                    </div>
                    <div className="msme-reviews__modal-rating-count">
                      {selectedProduct.stats.totalReviews} review{selectedProduct.stats.totalReviews !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="msme-reviews__modal-rating-breakdown">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="msme-reviews__modal-rating-row">
                        <span className="msme-reviews__modal-rating-label">{rating} star</span>
                        <div className="msme-reviews__modal-rating-bar">
                          <div 
                            className="msme-reviews__modal-rating-fill" 
                            style={{ width: `${getProductRatingPercentage(rating, selectedProduct.stats)}%` }}
                          ></div>
                        </div>
                        <span className="msme-reviews__modal-rating-percentage">
                          {getProductRatingPercentage(rating, selectedProduct.stats)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Reviews */}
              <div className="msme-reviews__modal-reviews">
                <h3>Customer Reviews</h3>
                {selectedProduct.reviews.length === 0 ? (
                  <div className="msme-reviews__modal-no-reviews">
                    <RateReviewIcon className="msme-reviews__empty-icon" />
                    <p>No reviews for this product yet.</p>
                  </div>
                ) : (
                  <div className="msme-reviews__modal-reviews-list">
                    {selectedProduct.reviews.map((review) => (
                      <div key={review._id} className="msme-reviews__modal-review-card">
                        <div className="msme-reviews__modal-review-header">
                          <div className="msme-reviews__modal-customer-info">
                            <div className="msme-reviews__modal-customer-avatar">
                              <PersonIcon />
                            </div>
                            <div className="msme-reviews__modal-customer-details">
                              <h4 className="msme-reviews__modal-customer-name">
                                {review.customer?.firstname && review.customer?.lastname 
                                  ? `${review.customer.firstname} ${review.customer.lastname}`
                                  : 'Anonymous Customer'
                                }
                              </h4>
                              <div className="msme-reviews__modal-review-rating">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <div className="msme-reviews__modal-review-date">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                        <div className="msme-reviews__modal-review-content">
                          <p>"{review.comment}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MsmeReviews;
