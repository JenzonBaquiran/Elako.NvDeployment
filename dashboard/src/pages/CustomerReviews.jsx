import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import '../css/CustomerReviews.css';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const reviewsData = [
  {
    id: 1,
    productName: "Sample Product 1",
    rating: 5,
    review: "Great product! Really satisfied with the quality and delivery time.",
    date: "2 days ago",
    productImage: null
  },
  {
    id: 2,
    productName: "Sample Product 2", 
    rating: 5,
    review: "Great product! Really satisfied with the quality and delivery time.",
    date: "3 days ago",
    productImage: null
  },
  {
    id: 3,
    productName: "Sample Product 3",
    rating: 5,
    review: "Great product! Really satisfied with the quality and delivery time.",
    date: "5 days ago",
    productImage: null
  }
];

const CustomerReviews = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const navigate = useNavigate();

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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className="customer-reviews__star">
        {index < rating ? (
          <StarIcon className="customer-reviews__star--filled" />
        ) : (
          <StarBorderIcon className="customer-reviews__star--empty" />
        )}
      </span>
    ));
  };

  const handleEditReview = (reviewId) => {
    // Handle edit review logic
    console.log('Edit review:', reviewId);
  };

  const handleDeleteReview = (reviewId) => {
    // Handle delete review logic
    console.log('Delete review:', reviewId);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

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
          <div className="customer-reviews__reviews-list">
            {reviewsData.map((review) => (
              <div key={review.id} className="customer-reviews__review-card">
                <div className="customer-reviews__review-header">
                  <div className="customer-reviews__product-info">
                    <div className="customer-reviews__product-image">
                      <div className="customer-reviews__image-placeholder"></div>
                    </div>
                    <div className="customer-reviews__product-details">
                      <h3 className="customer-reviews__product-name">{review.productName}</h3>
                      <div className="customer-reviews__rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="customer-reviews__review-actions">
                    <span className="customer-reviews__review-date">{review.date}</span>
                    <div className="customer-reviews__action-buttons">
                      <button 
                        className="customer-reviews__action-btn customer-reviews__action-btn--edit"
                        onClick={() => handleEditReview(review.id)}
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="customer-reviews__action-btn customer-reviews__action-btn--delete"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="customer-reviews__review-content">
                  <p className="customer-reviews__review-text">"{review.review}"</p>
                </div>
                <div className="customer-reviews__review-footer">
                  <button 
                    className="customer-reviews__view-product-btn"
                    onClick={() => handleViewProduct(review.id)}
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
