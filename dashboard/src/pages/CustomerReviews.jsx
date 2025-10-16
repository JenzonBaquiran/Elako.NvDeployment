import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import '../css/CustomerReviews.css';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const CustomerReviews = () => {
  const { user, userType, isAuthenticated } = useAuth();
  const { showSuccess, showError, showConfirm } = useNotification();
  const navigate = useNavigate();
  
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editData, setEditData] = useState({ rating: 1, comment: '' });

  // Fetch user's reviews on component mount
  useEffect(() => {
    if (isAuthenticated && userType === 'customer' && user?._id) {
      fetchCustomerReviews();
    }
  }, [isAuthenticated, userType, user]);

  const fetchCustomerReviews = async () => {
    setLoading(true);
    try {
      console.log('Fetching reviews for customer:', user._id);
      const response = await fetch(`http://localhost:1337/api/customers/${user._id}/reviews`);
      const data = await response.json();
      
      console.log('Reviews API response:', data);
      
      if (data.success) {
        console.log('Reviews found:', data.reviews.length);
        setReviews(data.reviews);
      } else {
        console.log('API error:', data.error);
        showError('Failed to load your reviews', 'Error');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError('Failed to load your reviews', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'customer-reviews__content customer-reviews__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'customer-reviews__content customer-reviews__content--sidebar-open' 
      : 'customer-reviews__content customer-reviews__content--sidebar-collapsed';
  };

  const renderStars = (rating, isEditable = false, onRatingChange = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`customer-reviews__star ${isEditable ? 'customer-reviews__star--editable' : ''}`}
        onClick={isEditable && onRatingChange ? () => onRatingChange(index + 1) : undefined}
      >
        {index < rating ? (
          <StarIcon className="customer-reviews__star--filled" />
        ) : (
          <StarBorderIcon className="customer-reviews__star--empty" />
        )}
      </span>
    ));
  };

  const handleEditReview = (review) => {
    setEditingReview(review._id);
    setEditData({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditData({ rating: 1, comment: '' });
  };

  const handleSaveEdit = async (reviewId) => {
    // Validate input
    if (!editData.comment.trim()) {
      showError('Please write a comment for your review', 'Validation Error');
      return;
    }

    if (editData.comment.trim().length < 5) {
      showError('Review comment must be at least 5 characters long', 'Validation Error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:1337/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: editData.rating,
          comment: editData.comment.trim(),
          customerId: user._id
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Review updated successfully!', 'Success');
        
        // Update the review in the local state
        setReviews(reviews.map(review => 
          review._id === reviewId 
            ? { ...review, rating: editData.rating, comment: editData.comment.trim() }
            : review
        ));
        
        setEditingReview(null);
        setEditData({ rating: 1, comment: '' });
      } else {
        showError(data.error || 'Failed to update review', 'Error');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showError('Failed to update review', 'Error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    // Show confirmation notification
    const confirmed = await showConfirm(
      'Are you sure you want to delete this review? This action cannot be undone.',
      'Delete Review'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:1337/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user._id
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Review deleted successfully!', 'Success');
        
        // Remove the review from the local state
        setReviews(reviews.filter(review => review._id !== reviewId));
      } else {
        showError(data.error || 'Failed to delete review', 'Error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('Failed to delete review', 'Error');
    }
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

  // Show login message if not authenticated
  if (!isAuthenticated || userType !== 'customer') {
    return (
      <div className="customer-reviews">
        <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
        <div className={getContentClass()}>
          <div className="customer-reviews__container">
            <div className="customer-reviews__auth-message">
              <h2>Please log in as a customer to view your reviews</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-reviews">
      <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="customer-reviews__header">
          <div className="customer-reviews__header-content">
            <div className="customer-reviews__header-text">
            
            </div>
          </div>
        </div>

        <div className="customer-reviews__reviews-section">
          {loading ? (
            <div className="customer-reviews__loading">
              <p>Loading your reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="customer-reviews__empty">
              <RateReviewIcon className="customer-reviews__empty-icon" />
              <h3>No reviews yet</h3>
              <p>You haven't written any product reviews yet. Start exploring products and share your experience!</p>
            </div>
          ) : (
            <div className="customer-reviews__reviews-list">
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className={`customer-reviews__review-card ${
                    editingReview === review._id ? 'customer-reviews__review-card--editing' : ''
                  }`}
                >
                  <div className="customer-reviews__review-header">
                    <div className="customer-reviews__product-info">
                      <div className="customer-reviews__product-image">
                        {getProductImageUrl(review.productImage) ? (
                          <img 
                            src={getProductImageUrl(review.productImage)} 
                            alt={review.productName}
                            className="customer-reviews__product-img"
                          />
                        ) : (
                          <div className="customer-reviews__image-placeholder"></div>
                        )}
                      </div>
                      <div className="customer-reviews__product-details">
                        <h3 className="customer-reviews__product-name">{review.productName}</h3>
                        <p className="customer-reviews__store-name">
                          {review.store?.businessName || 'Unknown Store'}
                        </p>
                        
                        {/* Display variant and size information */}
                        {(review.selectedVariant || review.selectedSize) && (
                          <div className="customer-reviews__product-selection">
                            {review.selectedVariant && (
                              <span className="customer-reviews__variant-badge">
                                <strong>Variant:</strong> {review.selectedVariant.name}
                              </span>
                            )}
                            {review.selectedSize && (
                              <span className="customer-reviews__size-badge">
                                <strong>Size:</strong> {review.selectedSize.size} {review.selectedSize.unit}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="customer-reviews__rating">
                          {editingReview === review._id ? (
                            renderStars(
                              editData.rating, 
                              true, 
                              (newRating) => setEditData({ ...editData, rating: newRating })
                            )
                          ) : (
                            renderStars(review.rating)
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="customer-reviews__review-actions">
                      <span className="customer-reviews__review-date">
                        {formatDate(review.createdAt)}
                      </span>
                      <div className="customer-reviews__action-buttons">
                        {editingReview === review._id ? (
                          <>
                            <button 
                              className="customer-reviews__action-btn customer-reviews__action-btn--save"
                              onClick={() => handleSaveEdit(review._id)}
                              title="Save changes"
                            >
                              <SaveIcon />
                            </button>
                            <button 
                              className="customer-reviews__action-btn customer-reviews__action-btn--cancel"
                              onClick={handleCancelEdit}
                              title="Cancel editing"
                            >
                              <CancelIcon />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="customer-reviews__action-btn customer-reviews__action-btn--edit"
                              onClick={() => handleEditReview(review)}
                              title="Edit review"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              className="customer-reviews__action-btn customer-reviews__action-btn--delete"
                              onClick={() => handleDeleteReview(review._id)}
                              title="Delete review"
                            >
                              <DeleteIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="customer-reviews__review-content">
                    {editingReview === review._id ? (
                      <textarea
                        className="customer-reviews__edit-textarea"
                        value={editData.comment}
                        onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                        placeholder="Write your review..."
                        rows={4}
                      />
                    ) : (
                      <p className="customer-reviews__review-text">"{review.comment}"</p>
                    )}
                  </div>
                  <div className="customer-reviews__review-footer">
                    <button 
                      className="customer-reviews__view-product-btn"
                      onClick={() => handleViewProduct(review.productId)}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
