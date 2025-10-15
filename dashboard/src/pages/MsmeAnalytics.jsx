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
  const [productRatings, setProductRatings] = useState({
    productRatings: [],
    summary: {
      totalProducts: 0,
      ratedProducts: 0,
      averageRating: 0,
      totalReviews: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState(null); // 'pageViews' or 'productRatings'

  useEffect(() => {
    if (user && user._id) {
      fetchAnalytics();
      fetchProductRatings();
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

  const fetchProductRatings = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/stores/${user._id}/analytics/products`);
      const data = await response.json();

      if (data.success) {
        setProductRatings(data.data);
      } else {
        showError('Failed to load product ratings data', 'Error');
      }
    } catch (error) {
      console.error('Error fetching product ratings:', error);
      showError('Failed to load product ratings data', 'Error');
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

  const handleChartClick = (chartType) => {
    setExpandedChart(chartType);
  };

  const closeExpandedChart = () => {
    setExpandedChart(null);
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
          <div className="msme-analytics__chart-card msme-analytics__chart-card--clickable" onClick={() => handleChartClick('pageViews')}>
            <div className="msme-analytics__chart-header">
              <h3>Daily Page Views</h3>
              <p>Track your store profile views over the past week</p>
              <div className="msme-analytics__click-hint">Click to expand details</div>
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

          <div className="msme-analytics__chart-card msme-analytics__chart-card--clickable" onClick={() => handleChartClick('productRatings')}>
            <div className="msme-analytics__chart-header">
              <h3>Product Rating Performance</h3>
              <p>Performance by product rating - {productRatings.summary?.ratedProducts || 0} of {productRatings.summary?.totalProducts || 0} products rated</p>
              <div className="msme-analytics__click-hint">Click to expand details</div>
            </div>
            <div className="msme-analytics__chart-container">
              {loading || !productRatings.productRatings || productRatings.productRatings.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#666' }}>
                  {loading ? 'Loading product ratings...' : 'No product ratings available yet'}
                </div>
              ) : (
                <LineChart
                  width={600}
                  height={300}
                  series={productRatings.productRatings.slice(0, 5).map((product, index) => ({
                    data: product.weeklyData?.map(week => week.rating * 10) || [0, 0, 0, 0], // Convert to scale of 0-50 for better visualization
                    label: product.productName && product.productName.length > 15 ? product.productName.substring(0, 15) + '...' : product.productName || 'Unknown Product',
                    color: ['#313131', '#7ed957', '#666666', '#ff6b6b', '#4ecdc4'][index % 5],
                  }))}
                  xAxis={[
                    {
                      data: productRatings.productRatings.length > 0 && productRatings.productRatings[0].weeklyData
                        ? productRatings.productRatings[0].weeklyData.map(week => week.week)
                        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                      scaleType: 'point',
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Rating (scaled x10)',
                      min: 0,
                      max: 50,
                    },
                  ]}
                  margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
                />
              )}
            </div>
            {productRatings.productRatings && productRatings.productRatings.length > 0 && (
              <div style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
                <strong>Top Products:</strong> {productRatings.productRatings.slice(0, 3).map(p => 
                  `${p.productName || 'Unknown'} (${p.overallRating || 0}★)`
                ).join(', ')}
              </div>
            )}
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
                  <h4>{productRatings.productRatings && productRatings.productRatings.length > 0 ? 'Top Product Performance' : 'Product Performance'}</h4>
                  <p>
                    {productRatings.productRatings && productRatings.productRatings.length > 0 
                      ? `${productRatings.productRatings[0].productName || 'Your top product'} is your top-rated product with ${productRatings.productRatings[0].overallRating || 0}★ rating.`
                      : 'Add product reviews to track performance insights.'
                    }
                  </p>
                </div>
              </div>
              <div className="msme-analytics__insight-item">
                <div className="msme-analytics__insight-icon positive">★</div>
                <div className="msme-analytics__insight-content">
                  <h4>Customer Satisfaction</h4>
                  <p>
                    {productRatings.summary && productRatings.summary.averageRating > 0 
                      ? `Your ${productRatings.summary.averageRating}★ average rating across ${productRatings.summary.totalReviews} reviews reflects ${
                          productRatings.summary.averageRating >= 4.5 ? 'excellent' : 
                          productRatings.summary.averageRating >= 4.0 ? 'good' : 
                          productRatings.summary.averageRating >= 3.5 ? 'satisfactory' : 'needs improvement'
                        } customer satisfaction.`
                      : 'Encourage customers to leave reviews to track satisfaction levels.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Chart Modals */}
      {expandedChart === 'pageViews' && (
        <div className="msme-analytics__modal-overlay" onClick={closeExpandedChart}>
          <div className="msme-analytics__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="msme-analytics__modal-header">
              <h2>Daily Page Views - Detailed Analysis</h2>
              <button className="msme-analytics__modal-close" onClick={closeExpandedChart}>×</button>
            </div>
            <div className="msme-analytics__modal-body">
              <div className="msme-analytics__expanded-chart">
                <BarChart
                  width={800}
                  height={400}
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
                          return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                        }),
                      scaleType: 'band',
                    },
                  ]}
                  margin={{ top: 20, bottom: 60, left: 60, right: 20 }}
                />
              </div>
              <div className="msme-analytics__detailed-stats">
                <div className="msme-analytics__detail-stat">
                  <h4>Total Views</h4>
                  <p>{analytics.pageViews.total.toLocaleString()}</p>
                </div>
                <div className="msme-analytics__detail-stat">
                  <h4>This Week</h4>
                  <p>{analytics.pageViews.weekly}</p>
                </div>
                <div className="msme-analytics__detail-stat">
                  <h4>Today</h4>
                  <p>{analytics.pageViews.today}</p>
                </div>
                <div className="msme-analytics__detail-stat">
                  <h4>Daily Average</h4>
                  <p>{Math.round((analytics.pageViews.weekly / 7) * 10) / 10}</p>
                </div>
              </div>
              <div className="msme-analytics__insights-detailed">
                <h3>Insights</h3>
                <ul>
                  <li>Peak viewing time appears to be {analytics.pageViews.dailyBreakdown.length > 0 ? 
                    analytics.pageViews.dailyBreakdown.reduce((max, day) => day.count > max.count ? day : max, analytics.pageViews.dailyBreakdown[0])._id 
                    : 'weekdays'}</li>
                  <li>Your profile is getting {analytics.pageViews.weekly > analytics.pageViews.monthly ? 'increased' : 'steady'} traffic this week</li>
                  <li>Consider posting content on high-traffic days for better engagement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {expandedChart === 'productRatings' && (
        <div className="msme-analytics__modal-overlay" onClick={closeExpandedChart}>
          <div className="msme-analytics__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="msme-analytics__modal-header">
              <h2>Product Rating Performance - Detailed Analysis</h2>
              <button className="msme-analytics__modal-close" onClick={closeExpandedChart}>×</button>
            </div>
            <div className="msme-analytics__modal-body">
              {loading || !productRatings.productRatings || productRatings.productRatings.length === 0 ? (
                <div className="msme-analytics__no-data">
                  {loading ? 'Loading product ratings...' : 'No product ratings available yet. Encourage customers to leave reviews!'}
                </div>
              ) : (
                <>
                  <div className="msme-analytics__expanded-chart">
                    <LineChart
                      width={800}
                      height={400}
                      series={productRatings.productRatings.slice(0, 5).map((product, index) => ({
                        data: product.weeklyData?.map(week => week.rating * 10) || [0, 0, 0, 0],
                        label: product.productName || 'Unknown Product',
                        color: ['#313131', '#7ed957', '#666666', '#ff6b6b', '#4ecdc4'][index % 5],
                      }))}
                      xAxis={[
                        {
                          data: productRatings.productRatings.length > 0 && productRatings.productRatings[0].weeklyData
                            ? productRatings.productRatings[0].weeklyData.map(week => week.week)
                            : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                          scaleType: 'point',
                        },
                      ]}
                      yAxis={[
                        {
                          label: 'Rating (scaled x10)',
                          min: 0,
                          max: 50,
                        },
                      ]}
                      margin={{ top: 20, bottom: 60, left: 80, right: 20 }}
                    />
                  </div>
                  <div className="msme-analytics__product-details">
                    <h3>Product Performance Summary</h3>
                    <div className="msme-analytics__product-list">
                      {productRatings.productRatings.slice(0, 10).map((product, index) => (
                        <div key={index} className="msme-analytics__product-item">
                          <div className="msme-analytics__product-rank">#{index + 1}</div>
                          <div className="msme-analytics__product-info">
                            <h4>{product.productName || 'Unknown Product'}</h4>
                            <div className="msme-analytics__product-stats">
                              <span className="msme-analytics__rating">⭐ {product.overallRating || 0}</span>
                              <span className="msme-analytics__reviews">({product.totalReviews || 0} reviews)</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="msme-analytics__insights-detailed">
                    <h3>Performance Insights</h3>
                    <ul>
                      <li>Average rating across all products: {productRatings.summary.averageRating}⭐</li>
                      <li>Total reviews received: {productRatings.summary.totalReviews}</li>
                      <li>{productRatings.summary.ratedProducts} out of {productRatings.summary.totalProducts} products have ratings</li>
                      <li>Top performing product: {productRatings.productRatings[0]?.productName || 'None'} 
                        {productRatings.productRatings[0]?.overallRating && ` (${productRatings.productRatings[0].overallRating}⭐)`}</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MsmeAnalytics;
