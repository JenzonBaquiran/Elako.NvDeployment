import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Add, Message, Analytics, Settings } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeDashboard.css';

const MsmeDashboard = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });
  const [businessName, setBusinessName] = useState('');
  const [analytics, setAnalytics] = useState({
    pageViews: {
      today: 0,
      weekly: 0,
      monthly: 0,
      total: 0,
      dailyBreakdown: []
    },
    followers: 0,
    ratings: {
      currentAverage: 0,
      totalRatings: 0,
      weeklyBreakdown: [],
      trend: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch business name from localStorage
    const fetchBusinessName = () => {
      try {
        // Get MSME user data from localStorage
        const msmeUserData = localStorage.getItem('msmeUser');
        if (msmeUserData) {
          const parsedData = JSON.parse(msmeUserData);
          if (parsedData.businessName) {
            setBusinessName(parsedData.businessName);
            return;
          }
        }

        // Fallback if no business name found
        setBusinessName("Your Business");
      } catch (error) {
        console.error('Error fetching business name:', error);
        setBusinessName("Your Business");
      }
    };

    fetchBusinessName();
    
    // Fetch analytics data
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user || !user._id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:1337/api/stores/${user._id}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        } else {
          showError('Invalid analytics data received');
        }
      } else {
        showError('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showError('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

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
      return 'msme-dashboard__content msme-dashboard__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'msme-dashboard__content msme-dashboard__content--sidebar-open' 
      : 'msme-dashboard__content msme-dashboard__content--sidebar-collapsed';
  };

  return (
    <div className="msme-dashboard">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-dashboard__header">
          <div className="msme-dashboard__header-content">
            <div className="msme-dashboard__header-text">
              <h1>Welcome back, {businessName}!</h1>
              <p>Here's what's happening with your business today</p>
            </div>
            <button 
              className="msme-dashboard__customize-btn"
              onClick={() => navigate('/msme-customize-dashboard')}
            >
              Customize Dashboard
            </button>
          </div>
        </div>
        
        <div className="msme-dashboard__stats">
          <div className="msme-dashboard__stat-box">
            <div className="msme-dashboard__stat-value">
              {loading ? '...' : analytics.pageViews.total.toLocaleString()}
            </div>
            <div className="msme-dashboard__stat-label">Total Page Views</div>
            <div className="msme-dashboard__stat-change positive">
              Today: {loading ? '...' : analytics.pageViews.today}
            </div>
          </div>
          <div className="msme-dashboard__stat-box">
            <div className="msme-dashboard__stat-value">
              {loading ? '...' : analytics.pageViews.weekly.toLocaleString()}
            </div>
            <div className="msme-dashboard__stat-label">Weekly Views</div>
            <div className="msme-dashboard__stat-change neutral">
              Last 7 days
            </div>
          </div>
          <div className="msme-dashboard__stat-box">
            <div className="msme-dashboard__stat-value">
              {loading ? '...' : analytics.followers.toLocaleString()}
            </div>
            <div className="msme-dashboard__stat-label">Followers</div>
            <div className="msme-dashboard__stat-change positive">
              Monthly: {loading ? '...' : analytics.pageViews.monthly}
            </div>
          </div>
          <div className="msme-dashboard__stat-box">
            <div className="msme-dashboard__stat-value">
              {loading ? '...' : (analytics.ratings.currentAverage || 0).toFixed(1)}
            </div>
            <div className="msme-dashboard__stat-label">Average Rating</div>
            <div className={`msme-dashboard__stat-change ${
              analytics.ratings.trend > 0 ? 'positive' : 
              analytics.ratings.trend < 0 ? 'negative' : 'neutral'
            }`}>
              {loading ? '...' : analytics.ratings.trend > 0 ? `+${analytics.ratings.trend}` : analytics.ratings.trend} this week
            </div>
          </div>
        </div>

        <div className="msme-dashboard__content-grid">
          <div className="msme-dashboard__card">
            <h3>Top Products by Rating</h3>
            <div className="msme-dashboard__products-list">
              <div className="msme-dashboard__product-item">
                <span className="msme-dashboard__product-rank">#1</span>
                <span className="msme-dashboard__product-name">Buko Pie</span>
                <span className="msme-dashboard__product-rating">4.9</span>
              </div>
              <div className="msme-dashboard__product-item">
                <span className="msme-dashboard__product-rank">#2</span>
                <span className="msme-dashboard__product-name">Coffee Beans</span>
                <span className="msme-dashboard__product-rating">4.8</span>
              </div>
              <div className="msme-dashboard__product-item">
                <span className="msme-dashboard__product-rank">#3</span>
                <span className="msme-dashboard__product-name">Shakshuka Breakfast</span>
                <span className="msme-dashboard__product-rating">4.7</span>
              </div>
              <div className="msme-dashboard__product-item">
                <span className="msme-dashboard__product-rank">#4</span>
                <span className="msme-dashboard__product-name">Banana Chips</span>
                <span className="msme-dashboard__product-rating">4.6</span>
              </div>
            </div>
          </div>

          <div className="msme-dashboard__card">
            <h3>Business Insights</h3>
            <div className="msme-dashboard__insights-list">
              <div className="msme-dashboard__insight-item">
                <div className="msme-dashboard__insight-icon"></div>
                <div className="msme-dashboard__insight-content">
                  <h4>Peak Customer Engagement</h4>
                  <p>Most customer interactions occur between 2-4 PM</p>
                </div>
              </div>
              <div className="msme-dashboard__insight-item">
                <div className="msme-dashboard__insight-icon"></div>
                <div className="msme-dashboard__insight-content">
                  <h4>Growth Opportunity</h4>
                  <p>Consider adding more coffee varieties to boost sales</p>
                </div>
              </div>
            </div>
          </div>

          <div className="msme-dashboard__card msme-dashboard__card--compact">
            <h3>Weekly Rating Analysis</h3>
            <div className="msme-dashboard__rating-analysis">
              {loading ? (
                <div>Loading rating data...</div>
              ) : analytics.ratings.weeklyBreakdown.length > 0 ? (
                <>
                  <div className="msme-dashboard__rating-summary">
                    <div className="msme-dashboard__rating-overall">
                      <span className="msme-dashboard__rating-value">{analytics.ratings.currentAverage.toFixed(1)}</span>
                      <div className="msme-dashboard__rating-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`msme-dashboard__star ${star <= Math.round(analytics.ratings.currentAverage) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="msme-dashboard__rating-count">({analytics.ratings.totalRatings} reviews)</span>
                    </div>
                  </div>
                  <div className="msme-dashboard__weekly-breakdown">
                    {analytics.ratings.weeklyBreakdown.map((week, index) => (
                      <div key={index} className="msme-dashboard__week-item">
                        <div className="msme-dashboard__week-info">
                          <span className="msme-dashboard__week-label">{week.week}</span>
                          <span className="msme-dashboard__week-average">
                            {week.average > 0 ? week.average.toFixed(1) : 'No ratings'}
                          </span>
                        </div>
                        <div className="msme-dashboard__week-details">
                          <span className="msme-dashboard__week-count">
                            {week.count} rating{week.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="msme-dashboard__no-ratings">
                  <p>No ratings yet. Encourage customers to rate your store!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="msme-dashboard__quick-actions">
          <h3>Quick Actions</h3>
          <div className="msme-dashboard__actions-grid">
            <button 
              className="msme-dashboard__action-btn msme-dashboard__action-btn--primary"
              onClick={() => navigate('/msme-manage-product')}
            >
              <Add className="msme-dashboard__action-icon" />
              <span className="msme-dashboard__action-text">Add Product</span>
            </button>
            <button 
              className="msme-dashboard__action-btn msme-dashboard__action-btn--secondary"
              onClick={() => navigate('/msme-messages')}
            >
              <Message className="msme-dashboard__action-icon" />
              <span className="msme-dashboard__action-text">View Messages</span>
            </button>
            <button 
              className="msme-dashboard__action-btn msme-dashboard__action-btn--success"
              onClick={() => navigate('/msme-analytics')}
            >
              <Analytics className="msme-dashboard__action-icon" />
              <span className="msme-dashboard__action-text">Check Analytics</span>
            </button>
            <button 
              className="msme-dashboard__action-btn msme-dashboard__action-btn--info"
              onClick={() => navigate('/msme-profile')}
            >
              <Settings className="msme-dashboard__action-icon" />
              <span className="msme-dashboard__action-text">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmeDashboard;
