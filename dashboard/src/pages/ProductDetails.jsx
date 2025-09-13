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
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        <div className="product-details-card">
          
          <div className="product-details-info">
              <img src={`http://localhost:1337/uploads/${product.picture}`} alt={product.productName} className="product-details-image" />
              <h1>{product.productName}</h1>
                <p className="product-details-description">{product.description}</p>
                <div className="product-details-meta">
                  <span className="product-details-price">₱{product.price}</span>
                  <span className="product-details-stock">{product.stocks > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="product-details-extra">
                  <span className="product-details-category"><strong>Category:</strong> {product.category || 'N/A'}</span>
                  <span className="product-details-availability"><strong>Availability:</strong> {product.availability ? 'Available' : 'Unavailable'}</span>
                </div>
              <div className="product-details-rating">
                {/* Render star rating here */}
                <span>★</span> <span>{product.rating ? product.rating.toFixed(1) : 'No rating yet'}</span>
              </div>
                {/* Feedback Form */}
                <div className="product-details-feedback-form" style={{marginTop:24, marginBottom:24}}>
                  <h3>Rate & Leave Feedback</h3>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    {[1,2,3,4,5].map(star => (
                      <span
                        key={star}
                        style={{fontSize:'1.8rem', color: (hoverRating || rating) >= star ? '#FFD600' : '#ccc', cursor:'pointer'}}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >★</span>
                    ))}
                    <span style={{marginLeft:8}}>{rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : ''}</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    placeholder="Write your feedback..."
                    style={{width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ccc', marginBottom:8}}
                    disabled={submitting}
                  />
                  <button
                    onClick={async () => {
                      setSubmitting(true);
                      setSubmitError(null);
                      try {
                        const user = 'Anonymous'; // Replace with logged-in user if available
                        const res = await fetch(`http://localhost:1337/api/products/${productId}/feedback`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ rating, comment, user })
                        });
                        const data = await res.json();
                        if (data.success) {
                          // Add new feedback to product.feedback
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
                    style={{background:'#1976d2', color:'#fff', border:'none', borderRadius:4, padding:'8px 16px', cursor:'pointer'}}
                  >Submit</button>
                  {submitError && <div style={{color:'#d32f2f', marginTop:8}}>{submitError}</div>}
                </div>
              <div className="product-details-feedback">
                <h3>Feedback</h3>
                  {(product.feedback && Array.isArray(product.feedback) && product.feedback.length > 0) ? (
                    product.feedback.map((fb, idx) => (
                      <div key={idx} className="product-feedback-item">
                        <strong>{fb.user}</strong>
                        <span>{fb.comment}</span>
                        <span>Rating: {fb.rating}</span>
                      </div>
                    ))
                  ) : (
                    <p>No feedback yet.</p>
                  )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
