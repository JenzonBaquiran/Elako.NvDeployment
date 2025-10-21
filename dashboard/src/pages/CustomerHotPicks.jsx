import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import FavoriteButton from '../components/FavoriteButton';
import heroPic from '../pictures/IMG_6125.jpg';
import '../css/Home.css';
import '../css/CustomerHotpicks.css';

function CustomerHotPicks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotPicks, setHotPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);


  useEffect(() => {
    fetchAllHotPicks();
  }, [currentPage, user]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchAllHotPicks = async () => {
    try {
      setLoading(true);
      console.log('Fetching all hot picks, page:', currentPage);
      
      // Include customer ID if user is logged in for favorite status
      const url = user && user._id 
        ? `http://localhost:1337/api/hot-picks/all?page=${currentPage}&limit=12&customerId=${user._id}`
        : `http://localhost:1337/api/hot-picks/all?page=${currentPage}&limit=12`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        console.log('All Hot Picks fetched:', data.products.length, 'products');
        console.log('Total available:', data.total, 'products');
        setHotPicks(data.products);
        setTotalProducts(data.total);
        setTotalPages(Math.ceil(data.total / 12));
      } else {
        console.error('Failed to fetch all hot picks:', data.error);
      }
    } catch (error) {
      console.error('Error fetching all hot picks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get product label based on rating
  const getProductLabel = (rating) => {
    if (rating === 5) return { label: "Hot", labelClass: "hot" };
    if (rating >= 4.8) return { label: "Trending", labelClass: "trending" };
    if (rating >= 4.5) return { label: "Popular", labelClass: "popular" };
    return { label: "Featured", labelClass: "hot" };
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return `₱${price.toLocaleString()}`;
  };

  const starIcon = <span style={{color: "#0097a7", fontSize: "1rem", marginRight: "0.25rem"}}>★</span>;

  return (
    <div>
      <Navbar />
      
      <div className="browse-stores-page">
        <div className="browse-header">
          <button 
            className="back-button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              navigate('/');
            }}
          >
            ← Back to Home
          </button>
          <h1>All Top Rated Products</h1>
          <p>Discover amazing products with 4.5-5.0 star ratings from approved stores.</p>
        </div>





        <div className="products-container">
          {loading ? (
            <div className="loading-state">
              <p>Loading hot picks...</p>
            </div>
          ) : hotPicks.length === 0 ? (
            <div className="empty-state">
              <p>No hot picks found.</p>
            </div>
          ) : (
            <div className="products-grid">
              {hotPicks.map((product) => {
                const productLabel = getProductLabel(product.rating);
                const productImage = product.imageUrl || heroPic;
                
                return (
                  <div className="product-card" key={product._id}>
                    <div className="product-image-container">
                      <img 
                        src={productImage} 
                        alt={product.productName}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = heroPic;
                        }}
                      />
                      <div className={`product-badge ${productLabel.labelClass}`}>
                        {productLabel.label}
                      </div>
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-name">{product.productName}</h3>
                      
                      <div className="product-rating">
                        <div className="rating-container">
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`star ${i < Math.floor(product.rating) ? '' : 'empty'}`}>
                                {i < Math.floor(product.rating) ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="rating-value">({product.rating.toFixed(1)})</span>
                        </div>
                      </div>
                      
                      <div className="product-actions">
                        <button 
                          className="customer-view-store-visit-btn"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            navigate(`/product/${product._id}`);
                          }}
                        >
                          View Product
                        </button>
                        <div className="product-favorite-wrapper">
                          <FavoriteButton
                            productId={product._id}
                            productName={product.productName}
                            className="product-favorite-btn"
                            size="medium"
                            variant="default"
                          />
                        </div>
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
  );
}

export default CustomerHotPicks;