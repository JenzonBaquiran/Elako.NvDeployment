import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import "../css/AdminAnalytics.css";

const AdminAnalytics = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [activeTab, setActiveTab] = useState("growth");
  const [msmeData, setMsmeData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyGrowthData, setMonthlyGrowthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  // Fetch MSME reports data
  const fetchMsmeData = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/admin/msme-reports');
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching MSME data:', error);
      return [];
    }
  };

  // Fetch monthly growth data with real profile views and ratings
  const fetchMonthlyGrowthData = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/admin/analytics/monthly-growth');
      const data = await response.json();
      
      if (data.success && data.monthlyData) {
        return data.monthlyData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching monthly growth data:', error);
      return null;
    }
  };

  // Fetch real top products
  const fetchTopProducts = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/admin/hot-picks');
      const data = await response.json();
      
      if (data.success && data.products) {
        return data.products.slice(0, 4); // Get top 4 products
      }
      return [];
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  };

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [msmes, growthData, products] = await Promise.all([
          fetchMsmeData(),
          fetchMonthlyGrowthData(),
          fetchTopProducts()
        ]);
        
        setMsmeData(msmes);
        setMonthlyGrowthData(growthData);
        setTopProducts(products);
        console.log('Top products fetched:', products);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'admin-analytics__content admin-analytics__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'admin-analytics__content admin-analytics__content--sidebar-open' 
      : 'admin-analytics__content admin-analytics__content--sidebar-collapsed';
  };

  return (
    <div className="admin-analytics">
      <AdminSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="admin-analytics__header">
          <h1>MSME Analytics</h1>
          <p>Comprehensive analytics and insights for MSME performance and growth.</p>
        </div>

        <div className="admin-analytics__charts-section">
          <div className="admin-analytics__chart-container">
            <div className="admin-analytics__chart-box">
              <div className="admin-analytics__chart-header">
                <h3>MSME Growth Tracking</h3>
                <p>Individual MSME performance based on ratings and profile views</p>
              </div>
              <div className="admin-analytics__chart-content">
                <div className="admin-analytics__chart-legend">
                  {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      Loading MSME data...
                    </div>
                  ) : monthlyGrowthData && monthlyGrowthData.stores ? (
                    monthlyGrowthData.stores.slice(0, 4).map((store, index) => (
                      <div key={store.name} className="admin-analytics__legend-item">
                        <span 
                          className="admin-analytics__legend-color"
                          style={{ backgroundColor: store.color }}
                        ></span>
                        <span>{store.name}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No MSME data available
                    </div>
                  )}
                </div>
                <div className="admin-analytics__line-chart">
                  {monthlyGrowthData && monthlyGrowthData.stores ? (
                    <svg className="admin-analytics__chart-svg" width="100%" height="200" viewBox="0 0 400 200">
                      {/* Chart grid lines */}
                      <defs>
                        <pattern id="msme-grid" width="80" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#msme-grid)" />
                      
                      {/* Dynamic chart lines based on real data */}
                      {monthlyGrowthData.stores.slice(0, 4).map((store, storeIndex) => {
                        const xStep = 360 / (monthlyGrowthData.months.length - 1);
                        const xPositions = monthlyGrowthData.months.map((_, i) => 40 + i * xStep);
                        
                        // Convert views to Y positions (higher views = lower Y value)
                        const maxViews = Math.max(...monthlyGrowthData.stores.flatMap(s => s.views));
                        const minViews = Math.min(...monthlyGrowthData.stores.flatMap(s => s.views));
                        const viewsRange = maxViews - minViews || 1;
                        
                        const yPositions = store.views.map(views => {
                          const normalizedViews = (views - minViews) / viewsRange;
                          return 180 - (normalizedViews * 120); // Scale to chart height
                        });
                        
                        // Create points string for polyline
                        const points = xPositions.map((x, i) => `${x},${yPositions[i]}`).join(' ');
                        
                        return (
                          <g key={store.name}>
                            {/* Store line */}
                            <polyline 
                              fill="none" 
                              stroke={store.color} 
                              strokeWidth="3"
                              points={points}
                            />
                            {/* Store points */}
                            {xPositions.map((x, i) => (
                              <circle 
                                key={i}
                                cx={x} 
                                cy={yPositions[i]} 
                                r="4" 
                                fill={store.color} 
                                stroke="white" 
                                strokeWidth="2"
                              />
                            ))}
                          </g>
                        );
                      })}
                      
                      {/* Y-axis labels for views */}
                      <text x="15" y="60" fontSize="10" fill="#666" textAnchor="middle">High</text>
                      <text x="15" y="100" fontSize="10" fill="#666" textAnchor="middle">Med</text>
                      <text x="15" y="140" fontSize="10" fill="#666" textAnchor="middle">Low</text>
                      <text x="15" y="180" fontSize="10" fill="#666" textAnchor="middle">Start</text>
                      
                      {/* X-axis labels - show last 5 months */}
                      {monthlyGrowthData.months.slice(-5).map((month, index) => (
                        <text 
                          key={month}
                          x={40 + index * 80} 
                          y="195" 
                          textAnchor="middle" 
                          fontSize="12" 
                          fill="#666"
                        >
                          {month}
                        </text>
                      ))}
                    </svg>
                  ) : (
                    <div style={{ padding: '80px', textAlign: 'center', color: '#666' }}>
                      Loading chart data...
                    </div>
                  )}
                </div>
                
                <div className="admin-analytics__msme-stats">
                  {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      Loading MSME statistics...
                    </div>
                  ) : monthlyGrowthData && monthlyGrowthData.stores ? (
                    monthlyGrowthData.stores.slice(0, 4).map((store, index) => {
                      const latestViews = store.views[store.views.length - 1] || 0;
                      const previousViews = store.views[store.views.length - 2] || 0;
                      const growthRate = previousViews > 0 ? 
                        Math.round(((latestViews - previousViews) / previousViews) * 100) : 0;
                      
                      const latestRating = store.ratings[store.ratings.length - 1] || 0;
                      
                      const getGrowthClass = (rate) => {
                        if (rate >= 30) return 'high';
                        if (rate >= 20) return 'good';
                        if (rate >= 10) return 'moderate';
                        return 'steady';
                      };
                      
                      return (
                        <div key={store.name} className="admin-analytics__msme-stat-item">
                          <div 
                            className="admin-analytics__msme-indicator"
                            style={{ backgroundColor: store.color }}
                          ></div>
                          <div className="admin-analytics__msme-details">
                            <span className="admin-analytics__msme-name">{store.name}</span>
                            <span className="admin-analytics__msme-metrics">
                              {latestRating.toFixed(1)}★ • {latestViews.toLocaleString()} views
                            </span>
                          </div>
                          <div className={`admin-analytics__growth-rate admin-analytics__growth-rate--${getGrowthClass(growthRate)}`}>
                            {growthRate > 0 ? '+' : ''}{growthRate}%
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No MSME statistics available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-analytics__chart-box">
              <div className="admin-analytics__chart-header">
                <h3>Top Picks Products</h3>
                <p>Most popular products by customer preference</p>
              </div>
              <div className="admin-analytics__chart-content">
                <div className="admin-analytics__chart-legend">
                  {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      Loading top products...
                    </div>
                  ) : topProducts.length > 0 ? (
                    topProducts.map((product, index) => {
                      const colors = ['#313131', '#7ed957', '#f59e0b', '#8b5cf6'];
                      const percentage = Math.round(100 / topProducts.length);
                      
                      return (
                        <div key={product._id} className="admin-analytics__legend-item">
                          <span 
                            className="admin-analytics__legend-color"
                            style={{ backgroundColor: colors[index] }}
                          ></span>
                          <span>{product.productName} ({percentage}%)</span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No top products available
                    </div>
                  )}
                </div>
                <div className="admin-analytics__pie-chart">
                  <svg className="admin-analytics__chart-svg" width="100%" height="300" viewBox="0 0 350 300">
                    <g transform="translate(175,150)">
                      {topProducts && topProducts.length > 0 ? (
                        topProducts.map((product, index) => {
                          const percentage = parseFloat(product.percentage) || 25; // Default to 25% if no percentage
                          const colors = ['#313131', '#7ed957', '#f59e0b', '#8b5cf6', '#ef4444'];
                          const radius = 110;
                          
                          // Calculate angles for this segment
                          const startAngle = (index * 90 - 90) * Math.PI / 180; // Each segment is 90 degrees, start from top
                          const endAngle = ((index + 1) * 90 - 90) * Math.PI / 180;
                          
                          // Calculate points
                          const x1 = radius * Math.cos(startAngle);
                          const y1 = radius * Math.sin(startAngle);
                          const x2 = radius * Math.cos(endAngle);
                          const y2 = radius * Math.sin(endAngle);
                          
                          // Create path for quarter circle
                          const pathData = `M 0,0 L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
                          
                          // Label position
                          const labelAngle = (startAngle + endAngle) / 2;
                          const labelX = 60 * Math.cos(labelAngle);
                          const labelY = 60 * Math.sin(labelAngle);
                          
                          return (
                            <g key={product._id || index}>
                              <path 
                                d={pathData}
                                fill={colors[index % colors.length]}
                                stroke="white" 
                                strokeWidth="2"
                              />
                              <text 
                                x={labelX} 
                                y={labelY} 
                                fontSize="12" 
                                fill="white" 
                                fontWeight="bold" 
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                {Math.round(percentage)}%
                              </text>
                            </g>
                          );
                        })
                      ) : (
                        <text x="0" y="0" fontSize="16" fill="#666" textAnchor="middle" dominantBaseline="middle">
                          No data available
                        </text>
                      )}
                    </g>
                  </svg>
                </div>
                
                <div className="admin-analytics__product-owners">
                  <h4 className="admin-analytics__owners-title">Product Sellers</h4>
                  <div className="admin-analytics__owners-grid">
                    {topProducts && topProducts.length > 0 ? (
                      topProducts.map((product, index) => {
                        const indicatorClasses = ['blue', 'green', 'orange', 'purple', 'red'];
                        const indicatorClass = indicatorClasses[index % indicatorClasses.length];
                        
                        return (
                          <div key={product._id || index} className="admin-analytics__owner-item">
                            <div className={`admin-analytics__owner-indicator admin-analytics__owner-indicator--${indicatorClass}`}></div>
                            <div className="admin-analytics__owner-info">
                              <span className="admin-analytics__owner-name">{product.storeName}</span>
                              <span className="admin-analytics__owner-product">{product.productName}</span>
                            </div>
                            <div className="admin-analytics__owner-stats">
                              <span className="admin-analytics__owner-rating">
                                {product.rating ? `${product.rating}★` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No product sellers available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-analytics__tabs">
          <button 
            className={`admin-analytics__tab-button ${activeTab === "growth" ? "admin-analytics__tab-button--active" : ""}`}
            onClick={() => setActiveTab("growth")}
          >
            MSME Growth
          </button>
          <button 
            className={`admin-analytics__tab-button ${activeTab === "engagement" ? "admin-analytics__tab-button--active" : ""}`}
            onClick={() => setActiveTab("engagement")}
          >
            Customer Engagement
          </button>
          <button 
            className={`admin-analytics__tab-button ${activeTab === "ratings" ? "admin-analytics__tab-button--active" : ""}`}
            onClick={() => setActiveTab("ratings")}
          >
            Product Ratings
          </button>
          <button 
            className={`admin-analytics__tab-button ${activeTab === "insights" ? "admin-analytics__tab-button--active" : ""}`}
            onClick={() => setActiveTab("insights")}
          >
            Key Insights
          </button>
        </div>

        <div className="admin-analytics__content-section">
          {activeTab === "growth" && (
            <div className="admin-analytics__growth-section">
              <div className="admin-analytics__section-header">
                <h2>MSME Growth Trends</h2>
                <p>Monthly MSME registrations and business development over time</p>
              </div>
              
              <div className="admin-analytics__monthly-stats">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => (
                  <div className="admin-analytics__month-row" key={month}>
                    <div className="admin-analytics__month-label">{month}</div>
                    <div className="admin-analytics__stats-bars">
                      <div className="admin-analytics__stat-group">
                        <div className="admin-analytics__new-msmes-bar">24</div>
                        <span className="admin-analytics__bar-label">New MSMEs</span>
                      </div>
                      <div className="admin-analytics__stat-group">
                        <div className="admin-analytics__verified-bar">18</div>
                        <span className="admin-analytics__bar-label">Verified</span>
                      </div>
                      <div className="admin-analytics__stat-group">
                        <div className="admin-analytics__active-bar">142</div>
                        <span className="admin-analytics__bar-label">Active MSMEs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "engagement" && (
            <div className="admin-analytics__engagement-section">
              <div className="admin-analytics__section-header">
                <h2>Customer Engagement Metrics</h2>
                <p>Customer interaction patterns and engagement with MSME businesses</p>
              </div>
              
              <div className="admin-analytics__engagement-grid">
                <div className="admin-analytics__engagement-card">
                  <h3>Daily Interactions</h3>
                  <div className="admin-analytics__engagement-value">1,248</div>
                  <span className="admin-analytics__engagement-trend">+18% vs yesterday</span>
                </div>
                <div className="admin-analytics__engagement-card">
                  <h3>Customer Reviews</h3>
                  <div className="admin-analytics__engagement-value">524</div>
                  <span className="admin-analytics__engagement-trend">+25% this week</span>
                </div>
                <div className="admin-analytics__engagement-card">
                  <h3>Repeat Customers</h3>
                  <div className="admin-analytics__engagement-value">67%</div>
                  <span className="admin-analytics__engagement-trend">+8% this month</span>
                </div>
                <div className="admin-analytics__engagement-card">
                  <h3>Average Session</h3>
                  <div className="admin-analytics__engagement-value">12.5m</div>
                  <span className="admin-analytics__engagement-trend">+3m increase</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="admin-analytics__ratings-section">
              <div className="admin-analytics__section-header">
                <h2>Product Ratings & Reviews</h2>
                <p>Quality metrics and customer satisfaction across MSME products</p>
              </div>
              
              <div className="admin-analytics__ratings-overview">
                <div className="admin-analytics__rating-summary">
                  <div className="admin-analytics__overall-rating">
                    <span className="admin-analytics__rating-number">4.7</span>
                    <span className="admin-analytics__rating-stars">★★★★★</span>
                    <span className="admin-analytics__rating-count">Based on 2,847 reviews</span>
                  </div>
                </div>
                
                <div className="admin-analytics__rating-breakdown">
                  <div className="admin-analytics__rating-bar-item">
                    <span className="admin-analytics__rating-label">5 Stars</span>
                    <div className="admin-analytics__rating-bar">
                      <div className="admin-analytics__rating-fill" style={{width: '68%'}}></div>
                    </div>
                    <span className="admin-analytics__rating-percent">68%</span>
                  </div>
                  <div className="admin-analytics__rating-bar-item">
                    <span className="admin-analytics__rating-label">4 Stars</span>
                    <div className="admin-analytics__rating-bar">
                      <div className="admin-analytics__rating-fill" style={{width: '22%'}}></div>
                    </div>
                    <span className="admin-analytics__rating-percent">22%</span>
                  </div>
                  <div className="admin-analytics__rating-bar-item">
                    <span className="admin-analytics__rating-label">3 Stars</span>
                    <div className="admin-analytics__rating-bar">
                      <div className="admin-analytics__rating-fill" style={{width: '8%'}}></div>
                    </div>
                    <span className="admin-analytics__rating-percent">8%</span>
                  </div>
                  <div className="admin-analytics__rating-bar-item">
                    <span className="admin-analytics__rating-label">2 Stars</span>
                    <div className="admin-analytics__rating-bar">
                      <div className="admin-analytics__rating-fill" style={{width: '2%'}}></div>
                    </div>
                    <span className="admin-analytics__rating-percent">2%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="admin-analytics__insights-section">
              <div className="admin-analytics__section-header">
                <h2>Growth Analysis & Support Recommendations</h2>
                <p>Identifying thriving MSMEs and those requiring assistance</p>
              </div>
              
              <div className="admin-analytics__insights-grid">
                <div className="admin-analytics__growing-msmes">
                  <h3>🚀 High Growth MSMEs</h3>
                  <div className="admin-analytics__msme-list">
                    <div className="admin-analytics__msme-item admin-analytics__msme-item--growing">
                      <div className="admin-analytics__msme-info">
                        <span className="admin-analytics__msme-name">Maria's Kitchen</span>
                        <span className="admin-analytics__msme-category">Food</span>
                      </div>
                      <div className="admin-analytics__growth-indicator">+45% growth</div>
                    </div>
                    <div className="admin-analytics__msme-item admin-analytics__msme-item--growing">
                      <div className="admin-analytics__msme-info">
                        <span className="admin-analytics__msme-name">Verde Crafts</span>
                        <span className="admin-analytics__msme-category">Artisan</span>
                      </div>
                      <div className="admin-analytics__growth-indicator">+38% growth</div>
                    </div>
                    <div className="admin-analytics__msme-item admin-analytics__msme-item--growing">
                      <div className="admin-analytics__msme-info">
                        <span className="admin-analytics__msme-name">TechStart Solutions</span>
                        <span className="admin-analytics__msme-category">Technology</span>
                      </div>
                      <div className="admin-analytics__growth-indicator">+32% growth</div>
                    </div>
                  </div>
                </div>

                <div className="admin-analytics__struggling-msmes">
                  <h3>📈 MSMEs Needing Support</h3>
                  <div className="admin-analytics__msme-list">
                    <div className="admin-analytics__msme-item admin-analytics__msme-item--struggling">
                      <div className="admin-analytics__msme-info">
                        <span className="admin-analytics__msme-name">Local Delights</span>
                        <span className="admin-analytics__msme-category">Food</span>
                      </div>
                      <div className="admin-analytics__support-indicator">Low engagement</div>
                    </div>
                    <div className="admin-analytics__msme-item admin-analytics__msme-item--struggling">
                      <div className="admin-analytics__msme-info">
                        <span className="admin-analytics__msme-name">Handmade Treasures</span>
                        <span className="admin-analytics__msme-category">Crafts</span>
                      </div>
                      <div className="admin-analytics__support-indicator">Declining sales</div>
                    </div>
                    <div className="admin-analytics__msme-item admin-analytics__msme-item--struggling">
                      <div className="admin-analytics__msme-info">
                        <span className="admin-analytics__msme-name">Fresh Harvest</span>
                        <span className="admin-analytics__msme-category">Agriculture</span>
                      </div>
                      <div className="admin-analytics__support-indicator">Limited reach</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-analytics__recommendations">
                <h3>🎯 Action Recommendations</h3>
                <div className="admin-analytics__recommendation-list">
                  <div className="admin-analytics__recommendation-item">
                    <div className="admin-analytics__recommendation-icon">💼</div>
                    <div className="admin-analytics__recommendation-content">
                      <h4>Business Mentorship Program</h4>
                      <p>Connect struggling MSMEs with successful business mentors for guidance and support.</p>
                    </div>
                  </div>
                  <div className="admin-analytics__recommendation-item">
                    <div className="admin-analytics__recommendation-icon">📱</div>
                    <div className="admin-analytics__recommendation-content">
                      <h4>Digital Marketing Training</h4>
                      <p>Provide social media and online marketing workshops for low-engagement businesses.</p>
                    </div>
                  </div>
                  <div className="admin-analytics__recommendation-item">
                    <div className="admin-analytics__recommendation-icon">🤝</div>
                    <div className="admin-analytics__recommendation-content">
                      <h4>Collaborative Events</h4>
                      <p>Organize joint promotional events to boost visibility for underperforming MSMEs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
