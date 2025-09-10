import React, { useState } from 'react';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeManageProduct.css';
import shakshoukaImg from '../assets/shakshouka.jpg';

const MsmeManageProduct = () => {
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });

  const handleSidebarToggle = (stateOrIsOpen, isMobile = false) => {
    // Handle both object parameter (from MsmeSidebar) and separate parameters
    if (typeof stateOrIsOpen === 'object') {
      setSidebarState({ 
        isOpen: stateOrIsOpen.isOpen, 
        isMobile: stateOrIsOpen.isMobile 
      });
    } else {
      setSidebarState({ isOpen: stateOrIsOpen, isMobile });
    }
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'msme-manage-product-content msme-manage-product-content--mobile';
    }
    return sidebarState.isOpen 
      ? 'msme-manage-product-content sidebar-open' 
      : 'msme-manage-product-content sidebar-closed';
  };

  return (
    <div className="msme-manage-product-container">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-manage-product-header">
          <div className="msme-manage-product-header-content">
            <div className="msme-manage-product-header-text">
              <h1>Product Management</h1>
              <p>Manage your products and inventory on the platform.</p>
            </div>
            <div className="msme-manage-product-actions">
              <button className="msme-manage-product-add-button">+ Add Product</button>
              <button className="msme-manage-product-hashtags-button">Manage Hashtags</button>
            </div>
          </div>
        </div>
        <div className="msme-manage-product-filters">
          <div className="msme-manage-product-filters-row">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="msme-manage-product-search-input" 
            />
            <select className="msme-manage-product-filter-select">
              <option>All Status</option>
              <option>Available</option>
              <option>Out of Stock</option>
            </select>
            <select className="msme-manage-product-filter-select">
              <option>All Categories</option>
              <option>Breakfast Items</option>
              <option>Beverages</option>
              <option>Desserts</option>
              <option>Snacks</option>
              <option>Meal Sets</option>
            </select>
          </div>
        </div>

        <section className="msme-manage-product-grid">
          <div className="msme-manage-product-card">
            <img src={shakshoukaImg} alt="Shakshuka Breakfast" className="msme-manage-product-image" />
            <div className="msme-manage-product-info">
              <h3>Shakshuka Breakfast</h3>
              <p className="msme-manage-product-description">Traditional Middle Eastern dish with eggs poached in spiced tomato sauce</p>
              <p className="msme-manage-product-price">₱295</p>
              <div className="msme-manage-product-details">
                <span className="msme-manage-product-rating">4.9 (156)</span>
                <div className="msme-manage-product-stock-info">
                  <span className="msme-manage-product-stock-count">Stock: 24</span>
                  <span className="msme-manage-product-availability available">Available</span>
                </div>
              </div>
              <div className="msme-manage-product-actions-container">
                <button className="msme-manage-product-edit-btn">Edit Product</button>
                <button className="msme-manage-product-delete-btn">Delete</button>
              </div>
            </div>
          </div>

          <div className="msme-manage-product-card">
            <img src={shakshoukaImg} alt="Artisan Bread" className="msme-manage-product-image" />
            <div className="msme-manage-product-info">
              <h3>Artisan Bread</h3>
              <p className="msme-manage-product-description">Freshly baked artisan sourdough bread with crispy crust and soft interior</p>
              <p className="msme-manage-product-price">₱180</p>
              <div className="msme-manage-product-details">
                <span className="msme-manage-product-rating">4.7 (98)</span>
                <div className="msme-manage-product-stock-info">
                  <span className="msme-manage-product-stock-count">Stock: 15</span>
                  <span className="msme-manage-product-availability available">Available</span>
                </div>
              </div>
              <div className="msme-manage-product-actions-container">
                <button className="msme-manage-product-edit-btn">Edit Product</button>
                <button className="msme-manage-product-delete-btn">Delete</button>
              </div>
            </div>
          </div>

          <div className="msme-manage-product-card">
            <img src={shakshoukaImg} alt="Premium Coffee Blend" className="msme-manage-product-image" />
            <div className="msme-manage-product-info">
              <h3>Premium Coffee Blend</h3>
              <p className="msme-manage-product-description">Rich and aromatic coffee blend sourced from premium beans</p>
              <p className="msme-manage-product-price">₱320</p>
              <div className="msme-manage-product-details">
                <span className="msme-manage-product-rating">4.8 (203)</span>
                <div className="msme-manage-product-stock-info">
                  <span className="msme-manage-product-stock-count">Stock: 8</span>
                  <span className="msme-manage-product-availability low-stock">Low Stock</span>
                </div>
              </div>
              <div className="msme-manage-product-actions-container">
                <button className="msme-manage-product-edit-btn">Edit Product</button>
                <button className="msme-manage-product-delete-btn">Delete</button>
              </div>
            </div>
          </div>

          <div className="msme-manage-product-card">
            <img src={shakshoukaImg} alt="Traditional Buko Pie" className="msme-manage-product-image" />
            <div className="msme-manage-product-info">
              <h3>Traditional Buko Pie</h3>
              <p className="msme-manage-product-description">Classic Filipino dessert with fresh coconut filling in flaky pastry</p>
              <p className="msme-manage-product-price">₱250</p>
              <div className="msme-manage-product-details">
                <span className="msme-manage-product-rating">4.8 (124)</span>
                <div className="msme-manage-product-stock-info">
                  <span className="msme-manage-product-stock-count">Stock: 12</span>
                  <span className="msme-manage-product-availability available">Available</span>
                </div>
              </div>
              <div className="msme-manage-product-actions-container">
                <button className="msme-manage-product-edit-btn">Edit Product</button>
                <button className="msme-manage-product-delete-btn">Delete</button>
              </div>
            </div>
          </div>

          <div className="msme-manage-product-card">
            <img src={shakshoukaImg} alt="Filipino Breakfast Set" className="msme-manage-product-image" />
            <div className="msme-manage-product-info">
              <h3>Filipino Breakfast Set</h3>
              <p className="msme-manage-product-description">Complete breakfast with garlic rice, longganisa, and fried egg</p>
              <p className="msme-manage-product-price">₱385</p>
              <div className="msme-manage-product-details">
                <span className="msme-manage-product-rating">4.9 (89)</span>
                <div className="msme-manage-product-stock-info">
                  <span className="msme-manage-product-stock-count">Stock: 0</span>
                  <span className="msme-manage-product-availability out-of-stock">Out of Stock</span>
                </div>
              </div>
              <div className="msme-manage-product-actions-container">
                <button className="msme-manage-product-edit-btn">Edit Product</button>
                <button className="msme-manage-product-delete-btn">Delete</button>
              </div>
            </div>
          </div>

          <div className="msme-manage-product-card">
            <img src={shakshoukaImg} alt="Homemade Banana Chips" className="msme-manage-product-image" />
            <div className="msme-manage-product-info">
              <h3>Homemade Banana Chips</h3>
              <p className="msme-manage-product-description">Crispy banana chips made from fresh local bananas, lightly salted</p>
              <p className="msme-manage-product-price">₱150</p>
              <div className="msme-manage-product-details">
                <span className="msme-manage-product-rating">4.7 (112)</span>
                <div className="msme-manage-product-stock-info">
                  <span className="msme-manage-product-stock-count">Stock: 35</span>
                  <span className="msme-manage-product-availability available">Available</span>
                </div>
              </div>
              <div className="msme-manage-product-actions-container">
                <button className="msme-manage-product-edit-btn">Edit Product</button>
                <button className="msme-manage-product-delete-btn">Delete</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MsmeManageProduct;