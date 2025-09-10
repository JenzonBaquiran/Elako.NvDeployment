import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GroupAdd, 
  Message, 
  Analytics, 
  Settings,
  People,
  Business,
  Person,
  PendingActions,
  Star
} from "@mui/icons-material";
import AdminSidebar from "./AdminSidebar";
import "../css/AdminOverview.css";

const AdminOverview = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'admin-overview__content admin-overview__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'admin-overview__content admin-overview__content--sidebar-open' 
      : 'admin-overview__content admin-overview__content--sidebar-collapsed';
  };

  return (
    <div className="admin-overview">
      <AdminSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="admin-overview__header">
          <h1>Dashboard Overview</h1>
          <p>Monitor platform performance and get insights into your system</p>
        </div>

        {/* Statistics Section */}
        <div className="admin-overview__stats">
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <People />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">1,247</div>
              <div className="admin-overview__stat-label">Total Users</div>
              <div className="admin-overview__stat-growth">+8% from last month</div>
            </div>
          </div>
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <Business />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">324</div>
              <div className="admin-overview__stat-label">Active MSMEs</div>
              <div className="admin-overview__stat-growth">+15% from last month</div>
            </div>
          </div>
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <Person />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">923</div>
              <div className="admin-overview__stat-label">Customers</div>
              <div className="admin-overview__stat-growth">+12% from last month</div>
            </div>
          </div>
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <PendingActions />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">56</div>
              <div className="admin-overview__stat-label">Pending Approvals</div>
              <div className="admin-overview__stat-growth">-5% from last month</div>
            </div>
          </div>
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <Star />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">4.8</div>
              <div className="admin-overview__stat-label">Avg Rating</div>
              <div className="admin-overview__stat-growth">+0.3 from last month</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="admin-overview__filters">
          <h2>Quick Filters</h2>
          <div className="admin-overview__filters-row">
            <input
              type="text"
              placeholder="Search activities..."
              className="admin-overview__search-input"
            />
            <select className="admin-overview__filter-dropdown">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select className="admin-overview__filter-dropdown">
              <option value="all">All Activities</option>
              <option value="registrations">Registrations</option>
              <option value="approvals">Approvals</option>
              <option value="customers">Customers</option>
            </select>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="admin-overview__tabs">
          <button
            className={`admin-overview__tab-button ${activeTab === 'overview' ? 'admin-overview__tab-button--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`admin-overview__tab-button ${activeTab === 'activities' ? 'admin-overview__tab-button--active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            Recent Activities
          </button>
          <button
            className={`admin-overview__tab-button ${activeTab === 'performance' ? 'admin-overview__tab-button--active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Top Performers
          </button>
          <button
            className={`admin-overview__tab-button ${activeTab === 'actions' ? 'admin-overview__tab-button--active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            Quick Actions
          </button>
        </div>

        {/* Cards Section */}
        <div className="admin-overview__cards-section">
          {activeTab === 'overview' && (
            <div className="admin-overview__cards-grid">
              <div className="admin-overview__overview-card">
                <div className="admin-overview__card-header">
                  <h3>System Health</h3>
                </div>
                <div className="admin-overview__card-content">
                  <div className="admin-overview__health-item">
                    <div className="admin-overview__health-indicator admin-overview__health-indicator--good"></div>
                    <span>Server Status: Operational</span>
                  </div>
                  <div className="admin-overview__health-item">
                    <div className="admin-overview__health-indicator admin-overview__health-indicator--good"></div>
                    <span>Database: Connected</span>
                  </div>
                  <div className="admin-overview__health-item">
                    <div className="admin-overview__health-indicator admin-overview__health-indicator--warning"></div>
                    <span>Storage: 78% Full</span>
                  </div>
                </div>
              </div>
              
              <div className="admin-overview__overview-card">
                <div className="admin-overview__card-header">
                  <h3>Platform Metrics</h3>
                </div>
                <div className="admin-overview__card-content">
                  <div className="admin-overview__metric-item">
                    <span className="admin-overview__metric-label">Daily Active Users</span>
                    <span className="admin-overview__metric-value">843</span>
                  </div>
                  <div className="admin-overview__metric-item">
                    <span className="admin-overview__metric-label">Transactions Today</span>
                    <span className="admin-overview__metric-value">₱125,400</span>
                  </div>
                  <div className="admin-overview__metric-item">
                    <span className="admin-overview__metric-label">Revenue This Month</span>
                    <span className="admin-overview__metric-value">₱2.1M</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="admin-overview__cards-grid">
              <div className="admin-overview__activity-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__card-avatar">M</div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">New MSME Registration</h3>
                    <p className="admin-overview__card-email">maria.bakery@email.com</p>
                  </div>
                  <div className="admin-overview__card-badges">
                    <span className="admin-overview__category-badge">Food</span>
                    <span className="admin-overview__status-badge admin-overview__status-badge--pending">Pending</span>
                  </div>
                </div>
                <div className="admin-overview__card-metrics">
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">2h</div>
                    <div className="admin-overview__metric-label">Ago</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">Food</div>
                    <div className="admin-overview__metric-label">Category</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">High</div>
                    <div className="admin-overview__metric-label">Priority</div>
                  </div>
                </div>
              </div>

              <div className="admin-overview__activity-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__card-avatar">N</div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">MSME Approved</h3>
                    <p className="admin-overview__card-email">nueva@crafts.ph</p>
                  </div>
                  <div className="admin-overview__card-badges">
                    <span className="admin-overview__category-badge">Artisan</span>
                    <span className="admin-overview__status-badge admin-overview__status-badge--verified">Approved</span>
                  </div>
                </div>
                <div className="admin-overview__card-metrics">
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">4h</div>
                    <div className="admin-overview__metric-label">Ago</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">Craft</div>
                    <div className="admin-overview__metric-label">Category</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">
                      4.8 <Star className="admin-overview__rating-star" />
                    </div>
                    <div className="admin-overview__metric-label">Rating</div>
                  </div>
                </div>
              </div>

              <div className="admin-overview__activity-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__card-avatar">J</div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">New Customer Registration</h3>
                    <p className="admin-overview__card-email">john.doe@customer.com</p>
                  </div>
                  <div className="admin-overview__card-badges">
                    <span className="admin-overview__category-badge">Customer</span>
                    <span className="admin-overview__status-badge admin-overview__status-badge--verified">Active</span>
                  </div>
                </div>
                <div className="admin-overview__card-metrics">
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">6h</div>
                    <div className="admin-overview__metric-label">Ago</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">New</div>
                    <div className="admin-overview__metric-label">Status</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">1st</div>
                    <div className="admin-overview__metric-label">Order</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="admin-overview__cards-grid">
              <div className="admin-overview__performance-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__card-avatar">M</div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">Maria's Kitchen</h3>
                    <p className="admin-overview__card-email">maria.kitchen@food.com</p>
                  </div>
                  <div className="admin-overview__card-badges">
                    <span className="admin-overview__category-badge">Food</span>
                    <span className="admin-overview__status-badge admin-overview__status-badge--verified">#1</span>
                  </div>
                </div>
                <div className="admin-overview__card-metrics">
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">25</div>
                    <div className="admin-overview__metric-label">Products</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">
                      4.9 <Star className="admin-overview__rating-star" />
                    </div>
                    <div className="admin-overview__metric-label">Rating</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">456</div>
                    <div className="admin-overview__metric-label">Followers</div>
                  </div>
                </div>
              </div>

              <div className="admin-overview__performance-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__card-avatar">N</div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">Nueva Crafts</h3>
                    <p className="admin-overview__card-email">nueva@crafts.ph</p>
                  </div>
                  <div className="admin-overview__card-badges">
                    <span className="admin-overview__category-badge">Artisan</span>
                    <span className="admin-overview__status-badge admin-overview__status-badge--verified">#2</span>
                  </div>
                </div>
                <div className="admin-overview__card-metrics">
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">18</div>
                    <div className="admin-overview__metric-label">Products</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">
                      4.8 <Star className="admin-overview__rating-star" />
                    </div>
                    <div className="admin-overview__metric-label">Rating</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">312</div>
                    <div className="admin-overview__metric-label">Followers</div>
                  </div>
                </div>
              </div>

              <div className="admin-overview__performance-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__card-avatar">L</div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">Local Delights</h3>
                    <p className="admin-overview__card-email">local@delights.com</p>
                  </div>
                  <div className="admin-overview__card-badges">
                    <span className="admin-overview__category-badge">Food</span>
                    <span className="admin-overview__status-badge admin-overview__status-badge--verified">#3</span>
                  </div>
                </div>
                <div className="admin-overview__card-metrics">
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">12</div>
                    <div className="admin-overview__metric-label">Products</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">
                      4.7 <Star className="admin-overview__rating-star" />
                    </div>
                    <div className="admin-overview__metric-label">Rating</div>
                  </div>
                  <div className="admin-overview__metric">
                    <div className="admin-overview__metric-value">289</div>
                    <div className="admin-overview__metric-label">Followers</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="admin-overview__cards-grid">
              <div className="admin-overview__action-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__action-icon">
                    <GroupAdd />
                  </div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">Manage Users</h3>
                    <p className="admin-overview__card-email">Add, edit, or remove platform users</p>
                  </div>
                </div>
                <div className="admin-overview__action-button-container">
                  <button 
                    className="admin-overview__action-button"
                    onClick={() => navigate('/admin-user-management')}
                  >
                    Open User Management
                  </button>
                </div>
              </div>

              <div className="admin-overview__action-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__action-icon">
                    <Message />
                  </div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">Review Pending</h3>
                    <p className="admin-overview__card-email">Review pending MSME applications</p>
                  </div>
                </div>
                <div className="admin-overview__action-button-container">
                  <button 
                    className="admin-overview__action-button"
                    onClick={() => navigate('/admin-msme-oversight')}
                  >
                    Review Applications
                  </button>
                </div>
              </div>

              <div className="admin-overview__action-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__action-icon">
                    <Analytics />
                  </div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">View Reports</h3>
                    <p className="admin-overview__card-email">Generate and view platform reports</p>
                  </div>
                </div>
                <div className="admin-overview__action-button-container">
                  <button 
                    className="admin-overview__action-button"
                    onClick={() => navigate('/admin-overview')}
                  >
                    Generate Reports
                  </button>
                </div>
              </div>

              <div className="admin-overview__action-card">
                <div className="admin-overview__card-header">
                  <div className="admin-overview__action-icon">
                    <Settings />
                  </div>
                  <div className="admin-overview__card-info">
                    <h3 className="admin-overview__card-title">Settings</h3>
                    <p className="admin-overview__card-email">Configure platform settings</p>
                  </div>
                </div>
                <div className="admin-overview__action-button-container">
                  <button 
                    className="admin-overview__action-button"
                    onClick={() => navigate('/admin-user-management')}
                  >
                    Open Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
