import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Navbar';
import '../css/ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feedback form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

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
            <img 
              src={`http://localhost:1337/uploads/${product.picture}`} 
              alt={product.productName} 
              className="product-details-image" 
            />
          </div>
          
          <div className="product-details-info-section">
            <h1 className="product-details-title">{product.productName}</h1>
            <p className="product-details-description">{product.description}</p>
            
            <div className="product-details-price">₱{product.price}</div>
            
            <div className="product-details-meta">
              <span className="product-details-stock-status">
                {product.stocks > 0 ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
              <span className="product-details-category">Category: {product.category || 'N/A'}</span>
            </div>
            
            <div className="product-details-rating">
              <span className="product-details-rating-stars">★★★★☆</span>
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
            product.feedback.map((fb, idx) => (
              <div key={idx} className="product-details-feedback-item">
                <div className="product-details-feedback-header">
                  <strong className="product-details-feedback-user">{fb.user}</strong>
                  <span className="product-details-feedback-rating">{'★'.repeat(fb.rating)}</span>
                </div>
                <p className="product-details-feedback-comment">{fb.comment}</p>
              </div>
            ))
          ) : (
            <p className="product-details-no-feedback">No reviews yet. Be the first to leave a review!</p>
          )}
        </div>

        {/* Rate Product Section */}
        <div className="product-details-rate-section">
          <h3>Rate this Product</h3>
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
              try {
                const user = 'Anonymous';
                const res = await fetch(`http://localhost:1337/api/products/${productId}/feedback`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ rating, comment, user })
                });
                const data = await res.json();
                if (data.success) {
                  setProduct(prev => ({
                    ...prev,
                    feedback: [...(prev.feedback || []), { user, comment, rating }]
                  }));
                  setRating(0);
                  setComment("");
                } else {
                  setSubmitError(data.error || 'Failed to submit feedback');
                }
              } catch (err) {
                setSubmitError('Failed to submit feedback');
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
