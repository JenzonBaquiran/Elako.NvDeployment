import React, { useState, useEffect } from 'react';
import MsmeSidebar from './MsmeSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';
import '../css/MsmeAnalytics.css';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

const MsmeAnalytics = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });
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

  useEffect(() => {
    if (user && user._id) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:1337/api/stores/${user._id}/analytics`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        showError('Failed to load analytics data', 'Error');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showError('Failed to load analytics data', 'Error');
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
      return 'msme-analytics__content msme-analytics__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'msme-analytics__content msme-analytics__content--sidebar-open' 
      : 'msme-analytics__content msme-analytics__content--sidebar-collapsed';
  };

  return (
    <div className="msme-analytics">
      <MsmeSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="msme-analytics__header">
          <div className="msme-analytics__header-content">
            <div className="msme-analytics__header-text">
              <h1>Growth & Analytics</h1>
              <p>Track your business performance and growth opportunities.</p>
            </div>
            <div className="msme-analytics__actions">
              <button className="msme-analytics__export-btn">Export Report</button>
              <button className="msme-analytics__filter-btn">Filter Data</button>
            </div>
          </div>
        </div>

        <div className="msme-analytics__stats">
          <div className="msme-analytics__stat-box">
            <div className="msme-analytics__stat-value">
              {loading ? '...' : analytics.pageViews.total.toLocaleString()}
            </div>
            <div className="msme-analytics__stat-label">Total Profile Views</div>
            <div className="msme-analytics__stat-change positive">+{analytics.pageViews.monthly} this month</div>
          </div>
          <div className="msme-analytics__stat-box">
            <div className="msme-analytics__stat-value">
              {loading ? '...' : analytics.pageViews.today}
            </div>
            <div className="msme-analytics__stat-label">Today's Views</div>
            <div className="msme-analytics__stat-change positive">+{analytics.pageViews.weekly} this week</div>
          </div>
          <div className="msme-analytics__stat-box">
            <div className="msme-analytics__stat-value">
              {loading ? '...' : analytics.followers}
            </div>
            <div className="msme-analytics__stat-label">Followers</div>
            <div className="msme-analytics__stat-change positive">Total followers</div>
          </div>
          <div className="msme-analytics__stat-box">
            <div className="msme-analytics__stat-value">
              {loading ? '...' : Math.round((analytics.pageViews.weekly / 7) * 10) / 10}
            </div>
            <div className="msme-analytics__stat-label">Daily Average</div>
            <div className="msme-analytics__stat-change positive">Last 7 days</div>
          </div>
        </div>

        <div className="msme-analytics__charts-grid">
          <div className="msme-analytics__chart-card">
            <div className="msme-analytics__chart-header">
              <h3>Daily Page Views</h3>
              <p>Track your store profile views over the past week</p>
            </div>
            <div className="msme-analytics__chart-container">
              <BarChart
                width={600}
                height={300}
                series={[
                  {
                    data: loading ? [0, 0, 0, 0, 0, 0, 0] : 
                      analytics.pageViews.dailyBreakdown.map(day => day.count),
                    label: 'Daily Views',
                    color: '#313131',
                  }
                ]}
                xAxis={[
                  {
                    data: loading ? ['...', '...', '...', '...', '...', '...', '...'] :
                      analytics.pageViews.dailyBreakdown.map(day => {
                        const date = new Date(day._id);
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                      }),
                    scaleType: 'band',
                  },
                ]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              />
            </div>
          </div>

          <div className="msme-analytics__chart-card">
            <div className="msme-analytics__chart-header">
              <h3>Product Rating Performance</h3>
              <p>Performance by product rating</p>
            </div>
            <div className="msme-analytics__chart-container">
              <LineChart
                width={600}
                height={300}
                series={[
                  {
                    data: [28, 30, 32, 35, 33, 35],
                    label: 'Buko Pie',
                    color: '#313131',
                  },
                  {
                    data: [20, 22, 24, 25, 26, 25],
                    label: 'Coffee Beans',
                    color: '#7ed957',
                  },
                  {
                    data: [18, 19, 20, 20, 21, 20],
                    label: 'Banana Chips',
                    color: '#666666',
                  },
                ]}
                xAxis={[
                  {
                    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    scaleType: 'point',
                  },
                ]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              />
            </div>
          </div>
        </div>

        <div className="msme-analytics__insights">
          <div className="msme-analytics__insights-card">
            <h3>Business Insights</h3>
            <div className="msme-analytics__insights-list">
              <div className="msme-analytics__insight-item">
                <div className="msme-analytics__insight-icon positive">↗</div>
                <div className="msme-analytics__insight-content">
                  <h4>Growing Customer Base</h4>
                  <p>Your follower count has increased by 5% this month, indicating strong brand awareness.</p>
                </div>
              </div>
              <div className="msme-analytics__insight-item">
                <div className="msme-analytics__insight-icon neutral">→</div>
                <div className="msme-analytics__insight-content">
                  <h4>Stable Product Performance</h4>
                  <p>Buko Pie remains your top performer with consistent sales throughout the quarter.</p>
                </div>
              </div>
              <div className="msme-analytics__insight-item">
                <div className="msme-analytics__insight-icon positive">★</div>
                <div className="msme-analytics__insight-content">
                  <h4>Excellent Customer Satisfaction</h4>
                  <p>Your 4.8 rating reflects high customer satisfaction and quality products.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MsmeAnalytics;
