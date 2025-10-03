import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GroupAdd, 
  Message, 
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMsmes: 0,
    customers: 0,
    pendingApprovals: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/admin/dashboard-stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Failed to fetch dashboard stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    setActivitiesLoading(true);
    try {
      const response = await fetch('http://localhost:1337/api/admin/recent-activities');
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.activities);
      } else {
        console.error('Failed to fetch recent activities:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Load stats when component mounts
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetch activities when tab changes to activities
  useEffect(() => {
    if (activeTab === 'activities' && activities.length === 0) {
      fetchRecentActivities();
    }
  }, [activeTab]);

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

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return activityDate.toLocaleDateString();
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'admin-overview__status-badge--verified';
      case 'pending':
        return 'admin-overview__status-badge--pending';
      case 'active':
        return 'admin-overview__status-badge--verified';
      default:
        return '';
    }
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
              <div className="admin-overview__stat-value">
                {loading ? "..." : stats.totalUsers.toLocaleString()}
              </div>
              <div className="admin-overview__stat-label">Total Users</div>
              <div className="admin-overview__stat-growth">+8% from last month</div>
            </div>
          </div>
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <Business />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">
                {loading ? "..." : stats.activeMsmes.toLocaleString()}
              </div>
              <div className="admin-overview__stat-label">Active MSMEs</div>
              <div className="admin-overview__stat-growth">+15% from last month</div>
            </div>
          </div>
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <Person />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">
                {loading ? "..." : stats.customers.toLocaleString()}
              </div>
              <div className="admin-overview__stat-label">Customers</div>
              <div className="admin-overview__stat-growth">+12% from last month</div>
            </div>
          </div>
          <div className="admin-overview__stat-box">
            <div className="admin-overview__stat-icon">
              <PendingActions />
            </div>
            <div className="admin-overview__stat-content">
              <div className="admin-overview__stat-value">
                {loading ? "..." : stats.pendingApprovals.toLocaleString()}
              </div>
              <div className="admin-overview__stat-label">Pending Approvals</div>
              <div className="admin-overview__stat-growth">-5% from last month</div>
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
            <div className="admin-overview__activities-container">
              {activitiesLoading ? (
                <div className="admin-overview__loading">Loading recent activities...</div>
              ) : activities.length === 0 ? (
                <div className="admin-overview__no-activities">
                  <p>No recent activities found for the past week.</p>
                </div>
              ) : (
                <div className="admin-overview__activities-list">
                  <div className="admin-overview__activities-header">
                    <div className="admin-overview__header-item admin-overview__header-item--main">Activity</div>
                    <div className="admin-overview__header-item">Type</div>
                    <div className="admin-overview__header-item">Status</div>
                    <div className="admin-overview__header-item">Time</div>
                    <div className="admin-overview__header-item admin-overview__header-item--details">Details</div>
                  </div>
                  {activities.map((activity, index) => (
                    <div key={index} className="admin-overview__activity-row">
                      <div className="admin-overview__activity-main">
                        <div className="admin-overview__activity-avatar">
                          {activity.avatar}
                        </div>
                        <div className="admin-overview__activity-info">
                          <h4 className="admin-overview__activity-title">{activity.title}</h4>
                          <p className="admin-overview__activity-subtitle">{activity.email}</p>
                        </div>
                      </div>
                      <div className="admin-overview__activity-type">
                        <span className={`admin-overview__type-badge admin-overview__type-badge--${activity.type.replace('_', '-')}`}>
                          {activity.type === 'customer_registration' ? 'Customer' : 
                           activity.category || activity.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </div>
                      <div className="admin-overview__activity-status">
                        <span className={`admin-overview__status-badge ${getStatusBadgeClass(activity.status)}`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      </div>
                      <div className="admin-overview__activity-time">
                        {getTimeAgo(activity.createdAt)}
                      </div>
                      <div className="admin-overview__activity-details">
                        <div className="admin-overview__detail-name">
                          {activity.businessName || activity.name || 'N/A'}
                        </div>
                        {activity.type === 'msme_approval' && activity.rating > 0 && (
                          <div className="admin-overview__detail-rating">
                            {activity.rating.toFixed(1)} <Star className="admin-overview__rating-star-small" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    onClick={() => navigate('/admin-settings')}
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
