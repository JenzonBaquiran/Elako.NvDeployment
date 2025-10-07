import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Navbar';
import FavoriteButton from '../components/FavoriteButton';
import '../css/ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, userType, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Feedback form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  // Helper function to get all available images
  const getAllImages = () => {
    if (!product) return [];
    
    let images = [];
    
    // Add images from pictures array (new multiple image system)
    if (product.pictures && product.pictures.length > 0) {
      images = product.pictures.map(pic => `http://localhost:1337/uploads/${pic}`);
    } 
    // Fallback to single picture (backward compatibility)
    else if (product.picture) {
      images = [`http://localhost:1337/uploads/${product.picture}`];
    }
    
    return images;
  };

  // Handle variant selection
  const handleVariantSelection = (variant) => {
    setSelectedVariant(variant);
    
    // If variant has specific image index, switch to that image
    if (variant.imageIndex !== undefined && variant.imageIndex >= 0) {
      const images = getAllImages();
      if (variant.imageIndex < images.length) {
        setSelectedImageIndex(variant.imageIndex);
      }
    }
  };

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="product-details-container"><Header /><div className="loading-state">Loading...</div></div>;
  }
  if (error || !product) {
    return <div className="product-details-container"><Header /><div className="error-state">{error || 'Product not found'}</div></div>;
  }

  return (
    <div className="product-details-container">
      <Header />
      
      <div className="product-details-content">
        <button className="product-details-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        
        {/* Main Product Card - Image and Details */}
        <div className="product-details-main-card">
          <div className="product-details-image-section">
            {/* Main Image Display */}
            <div className="product-details-main-image-container">
              <img 
                src={getAllImages()[selectedImageIndex] || `http://localhost:1337/uploads/${product.picture}`} 
                alt={product.productName} 
                className="product-details-image" 
              />
              
              {/* Image Counter */}
              {getAllImages().length > 1 && (
                <div className="product-details-image-counter">
                  {selectedImageIndex + 1} / {getAllImages().length}
                </div>
              )}
              
              {/* Image Navigation Arrows */}
              {getAllImages().length > 1 && (
                <>
                  <button 
                    className="product-details-image-nav prev"
                    onClick={() => setSelectedImageIndex(prev => 
                      prev > 0 ? prev - 1 : getAllImages().length - 1
                    )}
                  >
                    ‹
                  </button>
                  <button 
                    className="product-details-image-nav next"
                    onClick={() => setSelectedImageIndex(prev => 
                      prev < getAllImages().length - 1 ? prev + 1 : 0
                    )}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {getAllImages().length > 1 && (
              <div className="product-details-thumbnails">
                {getAllImages().map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.productName} ${index + 1}`}
                    className={`product-details-thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="product-details-info-section">
            <div className="product-details-header">
              <h1 className="product-details-title">{product.productName}</h1>
              {/* Inline favorite button for desktop */}
              {isAuthenticated && userType === 'customer' && (
                <FavoriteButton
                  productId={productId}
                  productName={product.productName}
                  className="product-details-favorite-inline"
                  size="large"
                  variant="inline"
                />
              )}
            </div>
            <p className="product-details-description">{product.description}</p>
            
            <div className="product-details-price">₱{product.price}</div>
            
            <div className="product-details-meta">
              <span className="product-details-availability-status">
                {product.availability ? '✓ Available' : '✗ Unavailable'}
              </span>
              <span className="product-details-category">Category: {product.category || 'N/A'}</span>
            </div>
            
            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="product-details-variants">
                <h4>Available Variants:</h4>
                <div className="product-details-variants-list">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`product-details-variant-btn ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                      onClick={() => handleVariantSelection(variant)}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <div className="product-details-selected-variant">
                    Selected: <strong>{selectedVariant.name}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Size Options */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div className="product-details-sizes">
                <h4>Available Sizes:</h4>
                <div className="product-details-sizes-list">
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size.id}
                      className={`product-details-size-btn ${selectedSize?.id === size.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size.size} {size.unit}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <div className="product-details-selected-size">
                    Selected Size: <strong>{selectedSize.size} {selectedSize.unit}</strong>
                  </div>
                )}
              </div>
            )}
            
            <div className="product-details-rating">
              <span className="product-details-rating-stars">
                {product.rating ? (
                  '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))
                ) : '☆☆☆☆☆'}
              </span>
              <span className="product-details-rating-text">
                {product.rating ? product.rating.toFixed(1) : 'No rating yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="product-details-reviews-section">
          <h3>Customer Reviews</h3>
          {(product.feedback && Array.isArray(product.feedback) && product.feedback.length > 0) ? (
            <div className="product-details-reviews-list">
              {product.feedback.map((fb, idx) => (
                <div key={idx} className="product-details-feedback-item">
                  <div className="product-details-feedback-header">
                    <div className="product-details-feedback-avatar">
                      {fb.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="product-details-feedback-content">
                      <div className="product-details-feedback-user-info">
                        <strong className="product-details-feedback-user">{fb.user}</strong>
                        <span className="product-details-feedback-date">
                          {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : ''}
                        </span>
                      </div>
                      <div className="product-details-feedback-rating">
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="product-details-feedback-comment">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="product-details-no-feedback">No reviews yet. Be the first to leave a review!</p>
          )}
        </div>

        {/* Rate Product Section */}
        <div className="product-details-rate-section">
          <h3>Rate this Product</h3>
          
          {!isAuthenticated || userType !== 'customer' ? (
            <div className="product-details-auth-message">
              <p>Please log in as a customer to leave a review.</p>
            </div>
          ) : (
            <>
              <div className="product-details-rating-input">
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    className={`product-details-star ${(hoverRating || rating) >= star ? 'active' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >★</span>
                ))}
                {rating > 0 && <span className="product-details-rating-label">{rating} Star{rating > 1 ? 's' : ''}</span>}
              </div>
              
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                placeholder="Write your feedback..."
                className="product-details-feedback-textarea"
                disabled={submitting}
              />
              
              <button
                onClick={async () => {
                  setSubmitting(true);
                  setSubmitError(null);
                  setSubmitSuccess(false);
                  
                  try {
                    const userName = `${user.firstname} ${user.lastname}`.trim();
                    const userId = user.id || user._id;
                    
                    const res = await fetch(`http://localhost:1337/api/products/${productId}/feedback`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        rating, 
                        comment, 
                        user: userName,
                        userId: userId
                      })
                    });
                    
                    const data = await res.json();
                    
                    if (data.success) {
                      // Re-fetch product data to get updated rating and feedback
                      await fetchProductDetails();
                      
                      // Reset form
                      setRating(0);
                      setComment("");
                      setSubmitSuccess(true);
                      
                      // Hide success message after 3 seconds
                      setTimeout(() => setSubmitSuccess(false), 3000);
                      
                    } else {
                      setSubmitError(data.error || 'Failed to submit feedback');
                    }
                  } catch (err) {
                    console.error('Error submitting feedback:', err);
                    setSubmitError('Failed to submit feedback. Please try again.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting || rating === 0 || comment.trim() === ""}
                className="product-details-submit-button"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              
              {submitError && <div className="product-details-error-message">{submitError}</div>}
              {submitSuccess && <div className="product-details-success-message">Feedback submitted successfully!</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
