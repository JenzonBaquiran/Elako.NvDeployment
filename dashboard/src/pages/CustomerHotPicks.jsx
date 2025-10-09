import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import heroPic from '../pictures/IMG_6125.jpg';
import '../css/Home.css';

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
  }, [currentPage]);

  const fetchAllHotPicks = async () => {
    try {
      setLoading(true);
      console.log('Fetching all hot picks, page:', currentPage);
      
      const response = await fetch(`http://localhost:1337/api/hot-picks/all?page=${currentPage}&limit=12`);
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
      
      <div className="customer-hot-picks-page">
        <div className="hot-picks-page-header">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
          <h1>All Hot Picks</h1>
          <p>Products with 4.5-5.0 star ratings from approved stores</p>
          <div className="hot-picks-stats">
            <span>{totalProducts} products found</span>
            {totalPages > 1 && <span> • Page {currentPage} of {totalPages}</span>}
          </div>
        </div>

        <div className="hot-picks-container">
          {loading ? (
            <div className="loading-state">
              <p>Loading hot picks...</p>
            </div>
          ) : hotPicks.length === 0 ? (
            <div className="empty-state">
              <p>No hot picks found.</p>
            </div>
          ) : (
            <div className="hot-picks-grid">
              {hotPicks.map((product) => {
                const productLabel = getProductLabel(product.rating);
                const productImage = product.imageUrl || heroPic;
                
                return (
                  <div className="hot-pick-card" key={product._id}>
                    <img 
                      src={productImage} 
                      alt={product.productName}
                      onError={(e) => {
                        e.target.src = heroPic;
                      }}
                    />
                    <div className={`hot-pick-label ${productLabel.labelClass}`}>
                      {productLabel.label}
                    </div>
                    <div className="hot-pick-content">
                      <div className="hot-pick-info">
                        <h3>{product.productName}</h3>
                        <p>{product.description}</p>
                        <div className="hot-pick-rating">
                          {starIcon}
                          <span>{product.rating.toFixed(1)} ({product.totalReviews})</span>
                        </div>
                        <div className="hot-pick-price">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                      <button 
                        className="hero-button hero-button-primary hot-pick-button" 
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        View Product
                      </button>
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
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CustomerHotPicks;