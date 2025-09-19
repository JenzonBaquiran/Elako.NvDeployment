import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import '../css/CustomerFavorites.css';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import StoreIcon from '@mui/icons-material/Store';

const favoriteProducts = [
  {
    id: 1,
    name: "Artisan Coffee Beans",
    store: "Mountain Brew Coffee",
    price: "₱450",
    rating: 4.8,
    image: null,
    inStock: true,
    description: "Premium roasted coffee beans from Benguet highlands"
  },
  {
    id: 2,
    name: "Handwoven Bag",
    store: "Traditional Weavers",
    price: "₱850",
    rating: 4.9,
    image: null,
    inStock: true,
    description: "Beautiful handwoven bag made from indigenous materials"
  },
  {
    id: 3,
    name: "Buko Pie",
    store: "Maria's Bakery",
    price: "₱280",
    rating: 4.7,
    image: null,
    inStock: false,
    description: "Delicious coconut pie made with fresh ingredients"
  },
  {
    id: 4,
    name: "Banana Chips",
    store: "Island Crafts",
    price: "₱120",
    rating: 4.6,
    image: null,
    inStock: true,
    description: "Crispy banana chips from fresh local bananas"
  }
];

const followedStores = [
  {
    id: 1,
    name: "Maria's Bakery",
    category: "Food & Beverages",
    location: "Laguna",
    followers: 234,
    products: 15,
    rating: 4.8,
    isFollowing: true,
    description: "Traditional Filipino baked goods and pastries"
  },
  {
    id: 2,
    name: "Mountain Brew Coffee",
    category: "Food & Beverages", 
    location: "Benguet",
    followers: 189,
    products: 8,
    rating: 4.9,
    isFollowing: true,
    description: "Premium coffee from the mountains of Cordillera"
  },
  {
    id: 3,
    name: "Traditional Weavers",
    category: "Clothing & Accessories",
    location: "Ilocos",
    followers: 156,
    products: 22,
    rating: 4.7,
    isFollowing: true,
    description: "Handwoven textiles and traditional crafts"
  }
];

const CustomerFavorites = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'customer-favorites__content customer-favorites__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'customer-favorites__content customer-favorites__content--sidebar-open' 
      : 'customer-favorites__content customer-favorites__content--sidebar-collapsed';
  };

  const toggleFavorite = (productId) => {
    // Handle favorite toggle logic here
    console.log('Toggle favorite for product:', productId);
  };

  const toggleFollow = (storeId) => {
    // Handle follow toggle logic here
    console.log('Toggle follow for store:', storeId);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleViewStore = (storeId) => {
    navigate(`/customer/store/${storeId}`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon 
        key={index} 
        className={index < Math.floor(rating) ? 'customer-favorites__star customer-favorites__star--filled' : 'customer-favorites__star customer-favorites__star--empty'} 
      />
    ));
  };

  return (
    <div className="customer-favorites">
      <CustomerSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="customer-favorites__header">
          <div className="customer-favorites__header-content">
           
          </div>
        </div>

        <div className="customer-favorites__tabs-section">
          <button 
            className={`customer-favorites__tab-button ${activeTab === 'products' ? 'customer-favorites__tab-button--active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FavoriteIcon className="customer-favorites__tab-icon" />
            Favorite Products ({favoriteProducts.length})
          </button>
          <button 
            className={`customer-favorites__tab-button ${activeTab === 'stores' ? 'customer-favorites__tab-button--active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            <StoreIcon className="customer-favorites__tab-icon" />
            Followed Stores ({followedStores.length})
          </button>
        </div>

        <div className="customer-favorites__content-section">
            {activeTab === 'products' && (
              <div className="customer-favorites__products-grid">
                {favoriteProducts.map((product) => (
                  <div key={product.id} className="customer-favorites__product-card">
                    <div className="customer-favorites__product-image">
                      <div className="customer-favorites__image-placeholder">
                        <StoreIcon />
                      </div>
                      <button 
                        className="customer-favorites__favorite-btn customer-favorites__favorite-btn--active"
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <FavoriteIcon />
                      </button>
                    </div>
                    <div className="customer-favorites__product-info">
                      <h3 className="customer-favorites__product-name">{product.name}</h3>
                      <p className="customer-favorites__store-name">{product.store}</p>
                      <div className="customer-favorites__product-rating">
                        {renderStars(product.rating)}
                        <span className="customer-favorites__rating-text">({product.rating})</span>
                      </div>
                      <p className="customer-favorites__product-description">{product.description}</p>
                      <div className="customer-favorites__product-footer">
                        <div className="customer-favorites__price-section">
                          <span className="customer-favorites__price">{product.price}</span>
                          <span className={`customer-favorites__stock-status ${product.inStock ? 'customer-favorites__stock-status--in-stock' : 'customer-favorites__stock-status--out-of-stock'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <button 
                          className="customer-favorites__view-btn"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stores' && (
              <div className="customer-favorites__stores-grid">
                {followedStores.map((store) => (
                  <div key={store.id} className="customer-favorites__store-card">
                    <div className="customer-favorites__store-header">
                      <div className="customer-favorites__store-avatar">
                        <StoreIcon />
                      </div>
                      <div className="customer-favorites__store-info">
                        <h3 className="customer-favorites__store-name">{store.name}</h3>
                        <p className="customer-favorites__store-category">{store.category}</p>
                        <div className="customer-favorites__store-location">
                          <LocationOnIcon className="customer-favorites__location-icon" />
                          <span>{store.location}</span>
                        </div>
                      </div>
                      <button 
                        className={`customer-favorites__follow-btn ${store.isFollowing ? 'customer-favorites__follow-btn--following' : ''}`}
                        onClick={() => toggleFollow(store.id)}
                      >
                        <FollowTheSignsIcon />
                        {store.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                    <div className="customer-favorites__store-description">
                      <p>{store.description}</p>
                    </div>
                    <div className="customer-favorites__store-stats">
                      <div className="customer-favorites__stat">
                        <span className="customer-favorites__stat-value">{store.products}</span>
                        <span className="customer-favorites__stat-label">Products</span>
                      </div>
                      <div className="customer-favorites__stat">
                        <span className="customer-favorites__stat-value">{store.followers}</span>
                        <span className="customer-favorites__stat-label">Followers</span>
                      </div>
                      <div className="customer-favorites__stat">
                        <div className="customer-favorites__rating">
                          <StarIcon className="customer-favorites__star customer-favorites__star--filled" />
                          <span className="customer-favorites__stat-value">{store.rating}</span>
                        </div>
                        <span className="customer-favorites__stat-label">Rating</span>
                      </div>
                    </div>
                    <button 
                      className="customer-favorites__visit-store-btn"
                      onClick={() => handleViewStore(store.id)}
                    >
                      Visit Store
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default CustomerFavorites;
