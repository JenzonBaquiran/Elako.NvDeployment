import React, { useState, useEffect } from 'react';
import MsmeSidebar from './MsmeSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import '../css/MsmeManageProduct.css';
import shakshoukaImg from '../assets/shakshouka.jpg';

const MsmeManageProduct = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showConfirm } = useNotification();
  
  // Debug log to check if showConfirm is available
  console.log('Notification functions available:', { showSuccess, showError, showConfirm });
  
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    description: '',
    availability: true,
    stocks: '',
    picture: null,
    hashtags: '',
    category: ''
  });
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtagList, setHashtagList] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    if (user && user._id) {
      fetchProducts();
    }
  }, [user]);

  // Get categories based on user's business type
  const getCategories = () => {
    if (user?.category === 'food') {
      return [
        { value: 'processed-foods', label: 'Processed Foods' },
        { value: 'baked-goods', label: 'Baked Goods' },
        { value: 'beverages', label: 'Beverages' },
        { value: 'confectionery', label: 'Confectionery' }
      ];
    } else if (user?.category === 'artisan') {
      return [
        { value: 'furniture', label: 'Furniture' },
        { value: 'paintings-visual-arts', label: 'Paintings & Visual Arts' },
        { value: 'weaved-products', label: 'Weaved Products' },
        { value: 'handmade-accessories', label: 'Handmade Accessories' },
        { value: 'sculptures', label: 'Sculptures' }
      ];
    }
    // Default categories for backward compatibility
    return [
      { value: 'breakfast-items', label: 'Breakfast Items' },
      { value: 'beverages', label: 'Beverages' },
      { value: 'desserts', label: 'Desserts' },
      { value: 'snacks', label: 'Snacks' },
      { value: 'meal-sets', label: 'Meal Sets' },
      { value: 'bakery', label: 'Bakery' },
      { value: 'other', label: 'Other' }
    ];
  };

  // Get category label from value
  const getCategoryLabel = (categoryValue) => {
    const categories = getCategories();
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // API Functions
  const fetchProducts = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Fetch all products without filters - let frontend handle filtering
      const response = await fetch(`http://localhost:1337/api/msme/${user._id}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        showError("Failed to fetch products", "Error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showError("Failed to fetch products", "Error");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      const response = await fetch('http://localhost:1337/api/products', {
        method: 'POST',
        body: productData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess("Product created successfully!", "Success");
        fetchProducts(); // Refresh the product list
        return true;
      } else {
        showError(data.error || "Failed to create product", "Error");
        return false;
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showError("Failed to create product", "Error");
      return false;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const response = await fetch(`http://localhost:1337/api/products/${productId}`, {
        method: 'PUT',
        body: productData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess("Product updated successfully!", "Success");
        fetchProducts(); // Refresh the product list
        return true;
      } else {
        showError(data.error || "Failed to update product", "Error");
        return false;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showError("Failed to update product", "Error");
      return false;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:1337/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess("Product deleted successfully!", "Success");
        fetchProducts(); // Refresh the product list
        return true;
      } else {
        showError(data.error || "Failed to delete product", "Error");
        return false;
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showError("Failed to delete product", "Error");
      return false;
    }
  };

  const toggleProductVisibility = async (productId, currentVisibility) => {
    try {
      const response = await fetch(`http://localhost:1337/api/products/${productId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visible: !currentVisibility })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(data.message, "Success");
        fetchProducts(); // Refresh the product list
        return true;
      } else {
        showError(data.error || "Failed to update product visibility", "Error");
        return false;
      }
    } catch (error) {
      console.error("Error toggling product visibility:", error);
      showError("Failed to update product visibility", "Error");
      return false;
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'available') {
      matchesStatus = product.availability === true && product.stocks > 0;
    } else if (statusFilter === 'out-of-stock') {
      matchesStatus = product.availability === false || product.stocks === 0;
    } else if (statusFilter === 'visible') {
      matchesStatus = product.visible === true;
    } else if (statusFilter === 'hidden') {
      matchesStatus = product.visible === false;
    }
    // If statusFilter is 'all', matchesStatus stays true
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Debug logging (remove this after testing)
    if (statusFilter !== 'all') {
      console.log(`Product: ${product.productName}, Status Filter: ${statusFilter}, Matches: ${matchesStatus}`, {
        availability: product.availability,
        stocks: product.stocks,
        visible: product.visible
      });
    }
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      picture: file
    }));
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtagList.includes(hashtagInput.trim().toLowerCase())) {
      setHashtagList(prev => [...prev, hashtagInput.trim().toLowerCase()]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtagList(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleHashtagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      price: '',
      description: '',
      availability: true,
      stocks: '',
      picture: null,
      hashtags: '',
      category: ''
    });
    setHashtagList([]);
    setHashtagInput('');
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?._id) {
      showError("User information not found", "Error");
      return;
    }
    
    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('productName', formData.productName);
    submitData.append('price', formData.price);
    submitData.append('description', formData.description);
    submitData.append('availability', formData.availability);
    submitData.append('stocks', formData.stocks);
    submitData.append('category', formData.category);
    submitData.append('hashtags', JSON.stringify(hashtagList));
    submitData.append('msmeId', user._id);
    submitData.append('visible', true); // New products are visible by default
    
    if (formData.picture) {
      submitData.append('picture', formData.picture);
    }

    let success = false;
    if (editingProduct) {
      // Update existing product
      success = await updateProduct(editingProduct._id, submitData);
      if (success) {
        setShowEditModal(false);
        setEditingProduct(null);
      }
    } else {
      // Create new product
      success = await createProduct(submitData);
      if (success) {
        setShowAddModal(false);
      }
    }

    if (success) {
      resetForm();
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      price: product.price.toString(),
      description: product.description,
      availability: product.availability,
      stocks: product.stocks.toString(),
      picture: null, // Don't set existing picture in form
      category: product.category || ''
    });
    setHashtagList(product.hashtags || []);
    setShowEditModal(true);
  };

// Delete product handler with notification confirmation
  const handleDelete = async (product) => {
    console.log('handleDelete called, showConfirm available:', typeof showConfirm);
    console.log('All notification functions:', { showSuccess, showError, showConfirm });
    
    // Fallback to window.confirm if showConfirm is not available
    let confirmed = false;
    
    if (typeof showConfirm === 'function') {
      try {
        confirmed = await showConfirm(
          `Are you sure you want to delete "${product.productName}"?`,
          "Confirm Delete"
        );
      } catch (error) {
        console.error('Error with showConfirm:', error);
        confirmed = window.confirm(`Are you sure you want to delete "${product.productName}"?`);
      }
    } else {
      console.warn('showConfirm not available, using window.confirm');
      confirmed = window.confirm(`Are you sure you want to delete "${product.productName}"?`);
    }
    
    if (confirmed) {
      await deleteProduct(product._id);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const toggleDropdown = (productId) => {
    setOpenDropdown(openDropdown === productId ? null : productId);
  };

  const handleFilterChange = () => {
    fetchProducts();
  };

  // Update filters and refetch when they change
  useEffect(() => {
    if (user?._id) {
      fetchProducts();
    }
  }, [user]); // Only refetch when user changes, not when filters change

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const getProductImageUrl = (product) => {
    if (product.picture) {
      return `http://localhost:1337/uploads/${product.picture}`;
    }
    return shakshoukaImg; // Default image
  };

  const getStockStatus = (product) => {
    if (!product.availability || product.stocks === 0) {
      return { class: 'out-of-stock', text: 'Out of Stock' };
    } else if (product.stocks <= 10) {
      return { class: 'low-stock', text: 'Low Stock' };
    } else {
      return { class: 'available', text: 'Available' };
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
              <button 
                className="msme-manage-product-add-button"
                onClick={() => setShowAddModal(true)}
              >
                + Add Product
              </button>
            </div>
          </div>
        </div>
        <div className="msme-manage-product-filters">
          <div className="msme-manage-product-filters-row">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="msme-manage-product-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="msme-manage-product-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="visible">Visible Products</option>
              <option value="hidden">Hidden Products</option>
            </select>
            <select 
              className="msme-manage-product-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {getCategories().map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="msme-manage-product-grid">
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '200px',
              fontSize: '18px',
              color: '#666'
            }}>
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '200px',
              fontSize: '18px',
              color: '#666'
            }}>
              {products.length === 0 ? 'No products found. Add your first product!' : 'No products match your search criteria.'}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <div key={product._id} className={`msme-manage-product-card ${!product.visible ? 'hidden-product' : ''}`}>
                  <div className="msme-manage-product-visibility-indicator">
                    <span className={`visibility-status ${product.visible ? 'visible' : 'hidden'}`}>
                      {product.visible ? ' Visible' : ' Hidden'}
                    </span>
                    
                    {/* 3-dot menu moved to top right corner */}
                    <div className="dropdown-container">
                      <button 
                        className="three-dot-menu"
                        onClick={() => toggleDropdown(product._id)}
                      >
                        ⋮
                      </button>
                      {openDropdown === product._id && (
                        <div className="dropdown-menu">
                          <button 
                            className="dropdown-item"
                            onClick={() => {
                              handleEdit(product);
                              setOpenDropdown(null);
                            }}
                          >
                            Edit Product
                          </button>
                          <button 
                            className="dropdown-item delete"
                            onClick={() => {
                              handleDelete(product);
                              setOpenDropdown(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <img 
                    src={getProductImageUrl(product)} 
                    alt={product.productName} 
                    className="msme-manage-product-image" 
                  />
                  <div className="msme-manage-product-info">
                    <div className="msme-manage-product-top-content">
                      <h3>{product.productName}</h3>
                      <p className="msme-manage-product-description">{product.description}</p>
                      <div className="msme-manage-product-price-and-stock">
                        <p className="msme-manage-product-price">₱{product.price}</p>
                        <div className="msme-manage-product-stock-container">
                          <div className="msme-manage-product-stock-info">
                            <span className="msme-manage-product-stock-count">Stock: {product.stocks}</span>
                            <span className={`msme-manage-product-availability ${stockStatus.class}`}>
                              {stockStatus.text}
                            </span>
                            {/* Visibility Toggle moved here */}
                            <div className="msme-manage-product-visibility-control-inline">
                              <span className="visibility-label-small">Visible to customers:</span>
                              <div className="toggle-switch">
                                <input 
                                  type="checkbox" 
                                  id={`visibility-${product._id}`}
                                  checked={product.visible}
                                  onChange={() => toggleProductVisibility(product._id, product.visible)}
                                  className="toggle-checkbox"
                                />
                                <label htmlFor={`visibility-${product._id}`} className="toggle-label">
                                  <span className="toggle-inner"></span>
                                  <span className="toggle-switch-handle"></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {product.hashtags && product.hashtags.length > 0 && (
                        <div className="msme-manage-product-hashtags">
                          {product.hashtags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="msme-manage-product-hashtag">
                              #{tag}
                            </span>
                          ))}
                          {product.hashtags.length > 3 && (
                            <span className="msme-manage-product-hashtag-more">
                              +{product.hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="msme-manage-product-bottom-content">
                      {/* Actions now handled by 3-dot menu */}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Add/Edit Product Modal */}
        {(showAddModal || showEditModal) && (
          <div className="modal-overlay">
            <div className="add-product-modal">
              <div className="modal-header">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button 
                  className="modal-close-btn"
                  onClick={handleModalClose}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="add-product-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="productName">Product Name *</label>
                    <input
                      type="text"
                      id="productName"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      required
                      maxLength="100"
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Price (₱) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    maxLength="1000"
                    rows="4"
                    placeholder="Describe your product..."
                  />
                  <small className="char-counter">
                    {formData.description.length}/1000 characters
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="stocks">Stock Quantity *</label>
                    <input
                      type="number"
                      id="stocks"
                      name="stocks"
                      value={formData.stocks}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select category</option>
                      {getCategories().map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="picture">Product Image</label>
                  <input
                    key={`file-input-${editingProduct ? editingProduct._id : 'new'}`}
                    type="file"
                    id="picture"
                    name="picture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="file-input"
                  />
                  <small>Recommended: JPG, PNG, max 5MB</small>
                </div>

                <div className="form-group">
                  <label>Hashtags for Filtering</label>
                  <div className="hashtag-input-container">
                    <input
                      type="text"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyPress={handleHashtagKeyPress}
                      placeholder="Add hashtag and press Enter"
                      className="hashtag-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddHashtag}
                      className="add-hashtag-btn"
                    >
                      Add
                    </button>
                  </div>
                  
                  {hashtagList.length > 0 && (
                    <div className="hashtag-list">
                      {hashtagList.map((tag, index) => (
                        <span key={index} className="hashtag-item">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveHashtag(tag)}
                            className="remove-hashtag-btn"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="availability"
                      checked={formData.availability}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Product is available for sale</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MsmeManageProduct;