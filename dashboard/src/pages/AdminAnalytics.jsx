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
  const [expandedChart, setExpandedChart] = useState(null); // 'growth' or 'products'

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

  const handleChartClick = (chartType) => {
    setExpandedChart(chartType);
  };

  const closeExpandedChart = () => {
    setExpandedChart(null);
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
            <div className="admin-analytics__chart-box admin-analytics__chart-box--clickable" onClick={() => handleChartClick('growth')}>
              <div className="admin-analytics__chart-header">
                <h3>MSME Growth Tracking</h3>
                <p>Individual MSME performance based on ratings and profile views</p>
                <div className="admin-analytics__click-hint">Click to expand details</div>
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

            <div className="admin-analytics__chart-box admin-analytics__chart-box--clickable" onClick={() => handleChartClick('products')}>
              <div className="admin-analytics__chart-header">
                <h3>Top Picks Products</h3>
                <p>Most popular products by customer preference</p>
                <div className="admin-analytics__click-hint">Click to expand details</div>
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

        

      </div>

      {/* Expanded Growth Chart Modal */}
      {expandedChart === 'growth' && (
        <div className="admin-analytics__modal-overlay" onClick={closeExpandedChart}>
          <div className="admin-analytics__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-analytics__modal-header">
              <h2>MSME Growth Tracking - Detailed Analysis</h2>
              <button className="admin-analytics__modal-close" onClick={closeExpandedChart}>×</button>
            </div>
            <div className="admin-analytics__modal-body">
              {loading || !monthlyGrowthData ? (
                <div className="admin-analytics__no-data">
                  Loading MSME growth data...
                </div>
              ) : (
                <>
                  <div className="admin-analytics__expanded-chart">
                    <svg className="admin-analytics__chart-svg" width="100%" height="400" viewBox="0 0 800 400">
                      {/* Enhanced chart grid lines */}
                      <defs>
                        <pattern id="expanded-grid" width="80" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#expanded-grid)" />
                      
                      {/* Enhanced dynamic chart lines */}
                      {monthlyGrowthData.stores.map((store, storeIndex) => {
                        const xStep = 720 / (monthlyGrowthData.months.length - 1);
                        const xPositions = monthlyGrowthData.months.map((_, i) => 60 + i * xStep);
                        
                        const maxViews = Math.max(...monthlyGrowthData.stores.flatMap(s => s.views));
                        const minViews = Math.min(...monthlyGrowthData.stores.flatMap(s => s.views));
                        const viewsRange = maxViews - minViews || 1;
                        
                        const yPositions = store.views.map(views => {
                          const normalizedViews = (views - minViews) / viewsRange;
                          return 360 - (normalizedViews * 280); // Larger scale for expanded view
                        });
                        
                        const points = xPositions.map((x, i) => `${x},${yPositions[i]}`).join(' ');
                        
                        return (
                          <g key={store.name}>
                            <polyline 
                              fill="none" 
                              stroke={store.color} 
                              strokeWidth="4"
                              points={points}
                            />
                            {xPositions.map((x, i) => (
                              <circle 
                                key={i}
                                cx={x} 
                                cy={yPositions[i]} 
                                r="6" 
                                fill={store.color} 
                                stroke="white" 
                                strokeWidth="3"
                              />
                            ))}
                          </g>
                        );
                      })}
                      
                      {/* Enhanced Y-axis labels */}
                      <text x="30" y="80" fontSize="12" fill="#666" textAnchor="middle">High</text>
                      <text x="30" y="160" fontSize="12" fill="#666" textAnchor="middle">Medium</text>
                      <text x="30" y="240" fontSize="12" fill="#666" textAnchor="middle">Low</text>
                      <text x="30" y="320" fontSize="12" fill="#666" textAnchor="middle">Start</text>
                      
                      {/* Enhanced X-axis labels */}
                      {monthlyGrowthData.months.map((month, index) => (
                        <text 
                          key={month}
                          x={60 + index * (720 / (monthlyGrowthData.months.length - 1))} 
                          y="385" 
                          textAnchor="middle" 
                          fontSize="14" 
                          fill="#666"
                        >
                          {month}
                        </text>
                      ))}
                    </svg>
                  </div>
                  <div className="admin-analytics__detailed-stats">
                    <div className="admin-analytics__detail-stat">
                      <h4>Total MSMEs</h4>
                      <p>{monthlyGrowthData.stores.length}</p>
                    </div>
                    <div className="admin-analytics__detail-stat">
                      <h4>Average Growth</h4>
                      <p>{Math.round(monthlyGrowthData.stores.reduce((acc, store) => {
                        const latest = store.views[store.views.length - 1] || 0;
                        const previous = store.views[store.views.length - 2] || 0;
                        return acc + (previous > 0 ? ((latest - previous) / previous) * 100 : 0);
                      }, 0) / monthlyGrowthData.stores.length)}%</p>
                    </div>
                    <div className="admin-analytics__detail-stat">
                      <h4>Top Performer</h4>
                      <p>{monthlyGrowthData.stores.reduce((max, store) => 
                        store.views[store.views.length - 1] > max.views[max.views.length - 1] ? store : max, 
                        monthlyGrowthData.stores[0]
                      ).name}</p>
                    </div>
                    <div className="admin-analytics__detail-stat">
                      <h4>Total Views</h4>
                      <p>{monthlyGrowthData.stores.reduce((total, store) => 
                        total + store.views.reduce((sum, views) => sum + views, 0), 0
                      ).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="admin-analytics__insights-detailed">
                    <h3>Growth Insights</h3>
                    <ul>
                      <li>Top growing MSME: {monthlyGrowthData.stores.reduce((max, store) => {
                        const latest = store.views[store.views.length - 1] || 0;
                        const previous = store.views[store.views.length - 2] || 0;
                        const maxLatest = max.views[max.views.length - 1] || 0;
                        const maxPrevious = max.views[max.views.length - 2] || 0;
                        const storeGrowth = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
                        const maxGrowth = maxPrevious > 0 ? ((maxLatest - maxPrevious) / maxPrevious) * 100 : 0;
                        return storeGrowth > maxGrowth ? store : max;
                      }, monthlyGrowthData.stores[0]).name}</li>
                      <li>Average monthly growth rate: {Math.round(monthlyGrowthData.stores.reduce((acc, store) => {
                        const latest = store.views[store.views.length - 1] || 0;
                        const previous = store.views[store.views.length - 2] || 0;
                        return acc + (previous > 0 ? ((latest - previous) / previous) * 100 : 0);
                      }, 0) / monthlyGrowthData.stores.length)}%</li>
                      <li>Peak performance months: {monthlyGrowthData.months.slice(-2).join(' and ')}</li>
                      <li>Overall trend: {monthlyGrowthData.stores.reduce((acc, store) => {
                        const latest = store.views[store.views.length - 1] || 0;
                        const first = store.views[0] || 0;
                        return acc + (first > 0 ? ((latest - first) / first) * 100 : 0);
                      }, 0) / monthlyGrowthData.stores.length > 0 ? 'Positive growth across all MSMEs' : 'Mixed growth patterns'}</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Products Chart Modal */}
      {expandedChart === 'products' && (
        <div className="admin-analytics__modal-overlay" onClick={closeExpandedChart}>
          <div className="admin-analytics__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-analytics__modal-header">
              <h2>Top Picks Products - Detailed Analysis</h2>
              <button className="admin-analytics__modal-close" onClick={closeExpandedChart}>×</button>
            </div>
            <div className="admin-analytics__modal-body">
              {loading || !topProducts || topProducts.length === 0 ? (
                <div className="admin-analytics__no-data">
                  {loading ? 'Loading top products data...' : 'No top products available yet'}
                </div>
              ) : (
                <>
                  <div className="admin-analytics__expanded-chart">
                    <svg className="admin-analytics__chart-svg" width="100%" height="500" viewBox="0 0 600 500">
                      <g transform="translate(300,250)">
                        {topProducts.map((product, index) => {
                          const percentage = parseFloat(product.percentage) || (100 / topProducts.length);
                          const colors = ['#313131', '#7ed957', '#f59e0b', '#8b5cf6', '#ef4444'];
                          const radius = 150; // Larger radius for expanded view
                          
                          // Calculate angles for this segment
                          const segmentAngle = (100 / topProducts.length) * 3.6; // Convert percentage to degrees
                          const startAngle = (index * segmentAngle - 90) * Math.PI / 180;
                          const endAngle = ((index + 1) * segmentAngle - 90) * Math.PI / 180;
                          
                          // Calculate points
                          const x1 = radius * Math.cos(startAngle);
                          const y1 = radius * Math.sin(startAngle);
                          const x2 = radius * Math.cos(endAngle);
                          const y2 = radius * Math.sin(endAngle);
                          
                          // Large arc flag for segments > 180 degrees
                          const largeArc = segmentAngle > 180 ? 1 : 0;
                          
                          const pathData = `M 0,0 L ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
                          
                          // Label position
                          const labelAngle = (startAngle + endAngle) / 2;
                          const labelX = 80 * Math.cos(labelAngle);
                          const labelY = 80 * Math.sin(labelAngle);
                          
                          return (
                            <g key={product._id || index}>
                              <path 
                                d={pathData}
                                fill={colors[index % colors.length]}
                                stroke="white" 
                                strokeWidth="3"
                              />
                              <text 
                                x={labelX} 
                                y={labelY} 
                                fontSize="16" 
                                fill="white" 
                                fontWeight="bold" 
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                {Math.round(percentage)}%
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                  <div className="admin-analytics__detailed-stats">
                    <div className="admin-analytics__detail-stat">
                      <h4>Total Products</h4>
                      <p>{topProducts.length}</p>
                    </div>
                    <div className="admin-analytics__detail-stat">
                      <h4>Top Rated</h4>
                      <p>{topProducts[0]?.rating ? `${topProducts[0].rating}★` : 'N/A'}</p>
                    </div>
                    <div className="admin-analytics__detail-stat">
                      <h4>Categories</h4>
                      <p>{new Set(topProducts.map(p => p.category).filter(Boolean)).size || 'Various'}</p>
                    </div>
                    <div className="admin-analytics__detail-stat">
                      <h4>Active Stores</h4>
                      <p>{new Set(topProducts.map(p => p.storeName).filter(Boolean)).size}</p>
                    </div>
                  </div>
                  <div className="admin-analytics__product-breakdown">
                    <h3>Product Performance Breakdown</h3>
                    <div className="admin-analytics__product-grid">
                      {topProducts.map((product, index) => {
                        const colors = ['#313131', '#7ed957', '#f59e0b', '#8b5cf6', '#ef4444'];
                        const percentage = Math.round(100 / topProducts.length);
                        
                        return (
                          <div key={product._id || index} className="admin-analytics__product-card">
                            <div 
                              className="admin-analytics__product-indicator"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            ></div>
                            <div className="admin-analytics__product-info">
                              <h4>{product.productName}</h4>
                              <p className="admin-analytics__product-store">by {product.storeName}</p>
                              <div className="admin-analytics__product-stats">
                                <span className="admin-analytics__product-rating">
                                  {product.rating ? `${product.rating}★` : 'No rating'}
                                </span>
                                <span className="admin-analytics__product-percentage">
                                  {percentage}% share
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="admin-analytics__insights-detailed">
                    <h3>Product Insights</h3>
                    <ul>
                      <li>Most popular product: {topProducts[0]?.productName || 'N/A'} by {topProducts[0]?.storeName || 'Unknown Store'}</li>
                      <li>Average rating across top products: {topProducts.filter(p => p.rating).length > 0 ? 
                        (topProducts.filter(p => p.rating).reduce((sum, p) => sum + parseFloat(p.rating), 0) / 
                        topProducts.filter(p => p.rating).length).toFixed(1) + '★' : 'No ratings available'}</li>
                      <li>Market distribution: {topProducts.length > 3 ? 'Competitive market with diverse products' : 'Market dominated by few key products'}</li>
                      <li>Store participation: {new Set(topProducts.map(p => p.storeName).filter(Boolean)).size} unique stores contributing to top picks</li>
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

export default AdminAnalytics;
