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
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [selectedMsme, setSelectedMsme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch MSMEs from API
  const fetchMsmes = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/admin/users');
      const data = await response.json();
      
      if (data.msmes) {
        // Transform MSME data to match component structure
        const transformedMsmes = data.msmes.map(msme => ({
          id: msme.id,
          _id: msme._id,
          businessName: msme.businessName,
          ownerName: msme.businessName, // Using businessName as owner name
          email: `${msme.username}@msme.com`, // Generate email from username
          phone: msme.contactNumber || 'N/A',
          address: msme.address || 'N/A',
          businessType: msme.category || 'N/A',
          registrationDate: new Date(msme.createdAt).toLocaleDateString(),
          status: msme.status || 'pending',
          username: msme.username,
          revenue: '₱0', // Default revenue
          employees: 0, // Default employees
          products: 0, // Will be updated with actual product count
          sales: '₱0', // Default sales
          rating: 4.0, // Default rating
          followers: 0, // Default followers
          businessPermit: msme.clientProfilingNumber || 'N/A',
          taxId: 'N/A',
          isVisible: msme.isVisible !== undefined ? msme.isVisible : true, // Use API value or default to true
          clientProfilingNumber: msme.clientProfilingNumber
        }));
        
        setMsmeData(transformedMsmes);
        return transformedMsmes;
      }
    } catch (error) {
      console.error('Error fetching MSMEs:', error);
      setMsmeData([]);
      return [];
    }
  };



  // Fetch MSME statistics (products, rating, followers)
  const fetchMsmeStatistics = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/admin/msme-statistics');
      const data = await response.json();
      
      if (data.success && data.statistics) {
        return data.statistics;
      } else {
        console.error('Failed to fetch MSME statistics:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching MSME statistics:', error);
      return [];
    }
  };

  // Update MSME data with real statistics
  const updateMsmeWithStatistics = (msmes, statistics) => {
    return msmes.map(msme => {
      const stats = statistics.find(stat => stat.msmeId === msme._id);
      return {
        ...msme,
        products: stats ? stats.products : 0,
        rating: stats ? stats.rating : 0,
        followers: stats ? stats.followers : 0
      };
    });
  };

  useEffect(() => {
    // Fetch data when component mounts
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [msmes, statistics] = await Promise.all([
          fetchMsmes(),
          fetchMsmeStatistics()
        ]);
        
        // Update MSMEs with real statistics
        const updatedMsmes = updateMsmeWithStatistics(msmes, statistics);
        setMsmeData(updatedMsmes);
        setFilteredData(updatedMsmes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
        msme.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msme.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(msme => 
        msme.businessType && msme.businessType.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(msme => msme.status === statusFilter);
    }

    // Apply visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(msme => 
        visibilityFilter === 'visible' ? msme.isVisible : !msme.isVisible
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, categoryFilter, statusFilter, visibilityFilter, msmeData, activeTab]);

  const handleVisibilityToggle = async (msmeId) => {
    try {
      // Find the MSME to get current visibility status
      const msme = msmeData.find(m => m.id === msmeId);
      if (!msme) return;

      const newVisibility = !msme.isVisible;

      // Call API to update visibility
      const response = await fetch(`http://localhost:1337/api/admin/msme/${msme._id}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible: newVisibility })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setMsmeData(prev => prev.map(m =>
          m.id === msmeId ? { ...m, isVisible: newVisibility } : m
        ));

        // Show success notification (you can implement this)
        console.log(`${msme.businessName} is now ${newVisibility ? 'visible' : 'hidden'} on the homepage and ${newVisibility ? 'can' : 'cannot'} log in.`);
      } else {
        console.error('Error toggling visibility:', data.error);
        // Show error notification
        alert('Error updating visibility: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Error updating visibility. Please try again.');
    }
  };

  const handleViewDetails = (msme) => {
    setSelectedMsme(msme);
    setShowModal(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return 'admin-msme-oversight__status-badge--verified';
      case 'pending':
        return 'admin-msme-oversight__status-badge--pending';
      case 'rejected':
        return 'admin-msme-oversight__status-badge--rejected';
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
    verified: msmeData.filter(m => m.status === 'approved' || m.status === 'verified').length,
    totalProducts: msmeData.reduce((sum, msme) => sum + (msme.products || 0), 0), // Sum all products from all MSMEs
    avgRating: msmeData.length > 0 ? 
      Math.round((msmeData.reduce((sum, m) => sum + (m.rating || 0), 0) / msmeData.length) * 10) / 10 : 0,
    pending: msmeData.filter(m => m.status === 'pending').length,
    topPerformers: msmeData.filter(m => (m.rating || 0) >= 4.5).length
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
              <option value="artisan">Artisan</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-msme-oversight__filter-dropdown"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
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
