import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import '../css/AdminMsmeOversight.css';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';

const AdminMsmeOversight = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [msmeData, setMsmeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [selectedMsme, setSelectedMsme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Mock MSME data - replace with actual API call
  const mockMsmeData = [
    {
      id: 1,
      businessName: "Maria's Bakery",
      ownerName: 'Maria Santos',
      email: 'maria.bakery@email.com',
      phone: '+63 912 345 6789',
      address: 'Baguio City, Benguet',
      businessType: 'Food',
      registrationDate: '2024-01-15',
      status: 'verified',
      revenue: '₱45K',
      employees: 15,
      products: 15,
      sales: '₱45K',
      rating: 4.8,
      followers: 234,
      businessPermit: 'BP-2024-001',
      taxId: 'TIN-123456789',
      isVisible: true
    },
    {
      id: 2,
      businessName: 'TechCraft Solutions',
      ownerName: 'Juan Dela Cruz',
      email: 'juan@techcraft.ph',
      phone: '+63 917 234 5678',
      address: 'Cebu City, Cebu',
      businessType: 'Technology',
      registrationDate: '2024-02-20',
      status: 'pending',
      revenue: '₱32K',
      employees: 8,
      products: 12,
      sales: '₱32K',
      rating: 4.5,
      followers: 156,
      businessPermit: 'BP-2024-002',
      taxId: 'TIN-987654321',
      isVisible: true
    },
    {
      id: 3,
      businessName: 'Coastal Handicrafts',
      ownerName: 'Ana Rodriguez',
      email: 'ana@coastal.com',
      phone: '+63 905 876 5432',
      address: 'Boracay, Aklan',
      businessType: 'Handicrafts',
      registrationDate: '2024-03-10',
      status: 'verified',
      revenue: '₱28K',
      employees: 5,
      products: 25,
      sales: '₱28K',
      rating: 4.2,
      followers: 89,
      businessPermit: 'BP-2024-003',
      taxId: 'TIN-456789123',
      isVisible: false
    },
    {
      id: 4,
      businessName: 'Green Gardens',
      ownerName: 'Carlos Mendoza',
      email: 'carlos@greengardens.com',
      phone: '+63 908 123 4567',
      address: 'Davao City, Davao',
      businessType: 'Agriculture',
      registrationDate: '2024-03-25',
      status: 'verified',
      revenue: '₱67K',
      employees: 12,
      products: 8,
      sales: '₱67K',
      rating: 4.9,
      followers: 312,
      businessPermit: 'BP-2024-004',
      taxId: 'TIN-789123456',
      isVisible: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMsmeData(mockMsmeData);
      setFilteredData(mockMsmeData);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = msmeData;

    // Filter by active tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(msme => msme.status === 'pending');
    } else if (activeTab === 'top') {
      filtered = filtered.filter(msme => msme.rating >= 4.5);
    } else if (activeTab === 'visibility') {
      // Show all for visibility controls tab
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(msme =>
        msme.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msme.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msme.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(msme => msme.businessType.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Apply visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(msme => 
        visibilityFilter === 'visible' ? msme.isVisible : !msme.isVisible
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, categoryFilter, visibilityFilter, msmeData, activeTab]);

  const handleVisibilityToggle = (msmeId) => {
    setMsmeData(prev => prev.map(msme =>
      msme.id === msmeId ? { ...msme, isVisible: !msme.isVisible } : msme
    ));
  };

  const handleViewDetails = (msme) => {
    setSelectedMsme(msme);
    setShowModal(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'verified':
        return 'admin-msme-oversight__status-badge--verified';
      case 'pending':
        return 'admin-msme-oversight__status-badge--pending';
      default:
        return 'admin-msme-oversight__status-badge--inactive';
    }
  };

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'admin-msme-oversight__content admin-msme-oversight__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'admin-msme-oversight__content admin-msme-oversight__content--sidebar-open' 
      : 'admin-msme-oversight__content admin-msme-oversight__content--sidebar-collapsed';
  };

  const stats = {
    total: msmeData.length,
    verified: msmeData.filter(m => m.status === 'verified').length,
    totalProducts: msmeData.reduce((sum, m) => sum + m.products, 0),
    avgRating: msmeData.reduce((sum, m) => sum + m.rating, 0) / msmeData.length,
    pending: msmeData.filter(m => m.status === 'pending').length,
    topPerformers: msmeData.filter(m => m.rating >= 4.5).length
  };

  return (
    <div className="admin-msme-oversight">
      <AdminSidebar onSidebarToggle={handleSidebarToggle} />
      
      <div className={getContentClass()}>
        <div className="admin-msme-oversight__header">
          <h1>MSME Oversight</h1>
          <p>Monitor and manage MSME businesses, control visibility, and track performance.</p>
        </div>

        {/* Statistics Section */}
        <div className="admin-msme-oversight__stats">
          <div className="admin-msme-oversight__stat-box">
            <div className="admin-msme-oversight__stat-icon">
              <PeopleIcon />
            </div>
            <div className="admin-msme-oversight__stat-content">
              <div className="admin-msme-oversight__stat-value">{stats.total}</div>
              <div className="admin-msme-oversight__stat-label">Total MSMEs</div>
              <div className="admin-msme-oversight__stat-growth">+6% from last month</div>
            </div>
          </div>
          <div className="admin-msme-oversight__stat-box">
            <div className="admin-msme-oversight__stat-icon">
              <VerifiedIcon />
            </div>
            <div className="admin-msme-oversight__stat-content">
              <div className="admin-msme-oversight__stat-value">{stats.verified}</div>
              <div className="admin-msme-oversight__stat-label">Verified MSMEs</div>
              <div className="admin-msme-oversight__stat-growth">+12% from last month</div>
            </div>
          </div>
          <div className="admin-msme-oversight__stat-box">
            <div className="admin-msme-oversight__stat-icon">
              <InventoryIcon />
            </div>
            <div className="admin-msme-oversight__stat-content">
              <div className="admin-msme-oversight__stat-value">{stats.totalProducts.toLocaleString()}</div>
              <div className="admin-msme-oversight__stat-label">Total Products</div>
              <div className="admin-msme-oversight__stat-growth">+18% from last month</div>
            </div>
          </div>
          <div className="admin-msme-oversight__stat-box">
            <div className="admin-msme-oversight__stat-icon">
              <StarIcon />
            </div>
            <div className="admin-msme-oversight__stat-content">
              <div className="admin-msme-oversight__stat-value">{stats.avgRating.toFixed(1)}</div>
              <div className="admin-msme-oversight__stat-label">Avg Rating</div>
              <div className="admin-msme-oversight__stat-growth">+0.2 from last month</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="admin-msme-oversight__filters">
          <h2>Filters & Controls</h2>
          <div className="admin-msme-oversight__filters-row">
            <input
              type="text"
              placeholder="Search MSMEs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-msme-oversight__search-input"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-msme-oversight__filter-dropdown"
            >
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="technology">Technology</option>
              <option value="handicrafts">Handicrafts</option>
              <option value="agriculture">Agriculture</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-msme-oversight__filter-dropdown"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="admin-msme-oversight__filter-dropdown"
            >
              <option value="all">All Visibility</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="admin-msme-oversight__tabs">
          <button
            className={`admin-msme-oversight__tab-button ${activeTab === 'all' ? 'admin-msme-oversight__tab-button--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All MSMEs ({stats.total})
          </button>
          <button
            className={`admin-msme-oversight__tab-button ${activeTab === 'pending' ? 'admin-msme-oversight__tab-button--active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Review ({stats.pending})
          </button>
          <button
            className={`admin-msme-oversight__tab-button ${activeTab === 'top' ? 'admin-msme-oversight__tab-button--active' : ''}`}
            onClick={() => setActiveTab('top')}
          >
            Top Performers ({stats.topPerformers})
          </button>
          <button
            className={`admin-msme-oversight__tab-button ${activeTab === 'visibility' ? 'admin-msme-oversight__tab-button--active' : ''}`}
            onClick={() => setActiveTab('visibility')}
          >
            Visibility Controls
          </button>
        </div>

        {/* MSME Cards Section */}
        <div className="admin-msme-oversight__cards-section">
          {loading ? (
            <div className="admin-msme-oversight__loading">Loading MSME data...</div>
          ) : filteredData.length === 0 ? (
            <div className="admin-msme-oversight__no-data">No MSMEs found matching your criteria.</div>
          ) : (
            <div className="admin-msme-oversight__cards-grid">
              {filteredData.map((msme) => (
                <div key={msme.id} className="admin-msme-oversight__msme-card">
                  <div className="admin-msme-oversight__card-header">
                    <div className="admin-msme-oversight__card-avatar">
                      {msme.businessName.charAt(0)}
                    </div>
                    <div className="admin-msme-oversight__card-info">
                      <h3 className="admin-msme-oversight__card-title">{msme.businessName}</h3>
                      <p className="admin-msme-oversight__card-email">{msme.email}</p>
                    </div>
                    <div className="admin-msme-oversight__card-badges">
                      <span className="admin-msme-oversight__category-badge">{msme.businessType}</span>
                      <span className={`admin-msme-oversight__status-badge ${getStatusBadgeClass(msme.status)}`}>
                        {msme.status}
                      </span>
                    </div>
                    <div className="admin-msme-oversight__visibility-toggle">
                      <label className="admin-msme-oversight__toggle-switch">
                        <input
                          type="checkbox"
                          checked={msme.isVisible}
                          onChange={() => handleVisibilityToggle(msme.id)}
                        />
                        <span className="admin-msme-oversight__toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="admin-msme-oversight__card-metrics">
                    <div className="admin-msme-oversight__metric">
                      <div className="admin-msme-oversight__metric-value">{msme.products}</div>
                      <div className="admin-msme-oversight__metric-label">Products</div>
                    </div>
                    <div className="admin-msme-oversight__metric">
                      <div className="admin-msme-oversight__metric-value">
                        {msme.rating} <StarIcon className="admin-msme-oversight__rating-star" />
                      </div>
                      <div className="admin-msme-oversight__metric-label">Rating</div>
                    </div>
                    <div className="admin-msme-oversight__metric">
                      <div className="admin-msme-oversight__metric-value">{msme.followers}</div>
                      <div className="admin-msme-oversight__metric-label">Followers</div>
                    </div>
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

export default AdminMsmeOversight;
