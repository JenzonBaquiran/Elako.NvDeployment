import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "../css/AdminAnalytics.css";

const AdminAnalytics = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [activeTab, setActiveTab] = useState("growth");

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

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
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--blue"></span>
                    <span>Maria's Kitchen</span>
                  </div>
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--green"></span>
                    <span>Verde Crafts</span>
                  </div>
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--orange"></span>
                    <span>TechStart Solutions</span>
                  </div>
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--purple"></span>
                    <span>Fresh Harvest Co.</span>
                  </div>
                </div>
                <div className="admin-analytics__line-chart">
                  <svg className="admin-analytics__chart-svg" width="100%" height="200" viewBox="0 0 400 200">
                    {/* Chart grid lines */}
                    <defs>
                      <pattern id="msme-grid" width="80" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#msme-grid)" />
                    
                    {/* Maria's Kitchen line (blue) - High growth */}
                    <polyline 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="3"
                      points="40,140 120,115 200,95 280,70 360,50"
                    />
                    <circle cx="40" cy="140" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
                    <circle cx="120" cy="115" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
                    <circle cx="200" cy="95" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
                    <circle cx="280" cy="70" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
                    <circle cx="360" cy="50" r="4" fill="#3b82f6" stroke="white" strokeWidth="2"/>
                    
                    {/* Verde Crafts line (green) - Steady growth */}
                    <polyline 
                      fill="none" 
                      stroke="#7ed957" 
                      strokeWidth="3"
                      points="40,160 120,145 200,125 280,105 360,85"
                    />
                    <circle cx="40" cy="160" r="4" fill="#7ed957" stroke="white" strokeWidth="2"/>
                    <circle cx="120" cy="145" r="4" fill="#7ed957" stroke="white" strokeWidth="2"/>
                    <circle cx="200" cy="125" r="4" fill="#7ed957" stroke="white" strokeWidth="2"/>
                    <circle cx="280" cy="105" r="4" fill="#7ed957" stroke="white" strokeWidth="2"/>
                    <circle cx="360" cy="85" r="4" fill="#7ed957" stroke="white" strokeWidth="2"/>
                    
                    {/* TechStart Solutions line (orange) - Moderate growth */}
                    <polyline 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="3"
                      points="40,150 120,140 200,135 280,125 360,115"
                    />
                    <circle cx="40" cy="150" r="4" fill="#f59e0b" stroke="white" strokeWidth="2"/>
                    <circle cx="120" cy="140" r="4" fill="#f59e0b" stroke="white" strokeWidth="2"/>
                    <circle cx="200" cy="135" r="4" fill="#f59e0b" stroke="white" strokeWidth="2"/>
                    <circle cx="280" cy="125" r="4" fill="#f59e0b" stroke="white" strokeWidth="2"/>
                    <circle cx="360" cy="115" r="4" fill="#f59e0b" stroke="white" strokeWidth="2"/>
                    
                    {/* Fresh Harvest Co. line (purple) - Slow but steady */}
                    <polyline 
                      fill="none" 
                      stroke="#8b5cf6" 
                      strokeWidth="3"
                      points="40,170 120,165 200,155 280,150 360,140"
                    />
                    <circle cx="40" cy="170" r="4" fill="#8b5cf6" stroke="white" strokeWidth="2"/>
                    <circle cx="120" cy="165" r="4" fill="#8b5cf6" stroke="white" strokeWidth="2"/>
                    <circle cx="200" cy="155" r="4" fill="#8b5cf6" stroke="white" strokeWidth="2"/>
                    <circle cx="280" cy="150" r="4" fill="#8b5cf6" stroke="white" strokeWidth="2"/>
                    <circle cx="360" cy="140" r="4" fill="#8b5cf6" stroke="white" strokeWidth="2"/>
                    
                    {/* Y-axis labels for growth metrics */}
                    <text x="15" y="60" fontSize="10" fill="#666" textAnchor="middle">High</text>
                    <text x="15" y="100" fontSize="10" fill="#666" textAnchor="middle">Med</text>
                    <text x="15" y="140" fontSize="10" fill="#666" textAnchor="middle">Low</text>
                    <text x="15" y="180" fontSize="10" fill="#666" textAnchor="middle">Start</text>
                    
                    {/* X-axis labels */}
                    <text x="40" y="195" textAnchor="middle" fontSize="12" fill="#666">Jan</text>
                    <text x="120" y="195" textAnchor="middle" fontSize="12" fill="#666">Feb</text>
                    <text x="200" y="195" textAnchor="middle" fontSize="12" fill="#666">Mar</text>
                    <text x="280" y="195" textAnchor="middle" fontSize="12" fill="#666">Apr</text>
                    <text x="360" y="195" textAnchor="middle" fontSize="12" fill="#666">May</text>
                  </svg>
                </div>
                
                <div className="admin-analytics__msme-stats">
                  <div className="admin-analytics__msme-stat-item">
                    <div className="admin-analytics__msme-indicator admin-analytics__msme-indicator--blue"></div>
                    <div className="admin-analytics__msme-details">
                      <span className="admin-analytics__msme-name">Maria's Kitchen</span>
                      <span className="admin-analytics__msme-metrics">4.8★ • 2.4k views</span>
                    </div>
                    <div className="admin-analytics__growth-rate admin-analytics__growth-rate--high">+45%</div>
                  </div>
                  <div className="admin-analytics__msme-stat-item">
                    <div className="admin-analytics__msme-indicator admin-analytics__msme-indicator--green"></div>
                    <div className="admin-analytics__msme-details">
                      <span className="admin-analytics__msme-name">Verde Crafts</span>
                      <span className="admin-analytics__msme-metrics">4.6★ • 1.8k views</span>
                    </div>
                    <div className="admin-analytics__growth-rate admin-analytics__growth-rate--good">+32%</div>
                  </div>
                  <div className="admin-analytics__msme-stat-item">
                    <div className="admin-analytics__msme-indicator admin-analytics__msme-indicator--orange"></div>
                    <div className="admin-analytics__msme-details">
                      <span className="admin-analytics__msme-name">TechStart Solutions</span>
                      <span className="admin-analytics__msme-metrics">4.4★ • 1.2k views</span>
                    </div>
                    <div className="admin-analytics__growth-rate admin-analytics__growth-rate--moderate">+18%</div>
                  </div>
                  <div className="admin-analytics__msme-stat-item">
                    <div className="admin-analytics__msme-indicator admin-analytics__msme-indicator--purple"></div>
                    <div className="admin-analytics__msme-details">
                      <span className="admin-analytics__msme-name">Fresh Harvest Co.</span>
                      <span className="admin-analytics__msme-metrics">4.2★ • 950 views</span>
                    </div>
                    <div className="admin-analytics__growth-rate admin-analytics__growth-rate--steady">+12%</div>
                  </div>
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
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--blue"></span>
                    <span>Buko Pie (35%)</span>
                  </div>
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--light-green"></span>
                    <span>Coffee Beans (28%)</span>
                  </div>
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--orange"></span>
                    <span>Banana Chips (22%)</span>
                  </div>
                  <div className="admin-analytics__legend-item">
                    <span className="admin-analytics__legend-color admin-analytics__legend-color--purple"></span>
                    <span>Handmade Crafts (15%)</span>
                  </div>
                </div>
                <div className="admin-analytics__pie-chart">
                  <svg className="admin-analytics__chart-svg" width="100%" height="300" viewBox="0 0 350 300">
                    <g transform="translate(175,150)">
                      {/* Buko Pie - 35% (126 degrees) */}
                      <path 
                        d="M 0,-110 A 110,110 0 0,1 106.5,29.0 L 0,0 Z" 
                        fill="#3b82f6" 
                        stroke="white" 
                        strokeWidth="3"
                      />
                      
                      {/* Coffee Beans - 28% (100.8 degrees) */}
                      <path 
                        d="M 106.5,29.0 A 110,110 0 0,1 19.1,108.4 L 0,0 Z" 
                        fill="#7ed957" 
                        stroke="white" 
                        strokeWidth="3"
                      />
                      
                      {/* Banana Chips - 22% (79.2 degrees) */}
                      <path 
                        d="M 19.1,108.4 A 110,110 0 0,1 -85.8,70.4 L 0,0 Z" 
                        fill="#f59e0b" 
                        stroke="white" 
                        strokeWidth="3"
                      />
                      
                      {/* Handmade Crafts - 15% (54 degrees) */}
                      <path 
                        d="M -85.8,70.4 A 110,110 0 0,1 0,-110 L 0,0 Z" 
                        fill="#8b5cf6" 
                        stroke="white" 
                        strokeWidth="3"
                      />
                      
                      {/* Percentage labels - positioned correctly for each segment */}
                      <text x="25" y="-50" fontSize="14" fill="white" fontWeight="700" textAnchor="middle" className="admin-analytics__pie-label">35%</text>
                      <text x="65" y="55" fontSize="14" fill="white" fontWeight="700" textAnchor="middle" className="admin-analytics__pie-label">28%</text>
                      <text x="-40" y="75" fontSize="14" fill="white" fontWeight="700" textAnchor="middle" className="admin-analytics__pie-label">22%</text>
                      <text x="-50" y="-20" fontSize="14" fill="white" fontWeight="700" textAnchor="middle" className="admin-analytics__pie-label">15%</text>
                    </g>
                  </svg>
                </div>
                
                <div className="admin-analytics__product-owners">
                  <h4 className="admin-analytics__owners-title">Product Sellers</h4>
                  <div className="admin-analytics__owners-grid">
                    <div className="admin-analytics__owner-item">
                      <div className="admin-analytics__owner-indicator admin-analytics__owner-indicator--blue"></div>
                      <div className="admin-analytics__owner-info">
                        <span className="admin-analytics__owner-name">Maria's Kitchen</span>
                        <span className="admin-analytics__owner-product">Buko Pie</span>
                      </div>
                      <div className="admin-analytics__owner-stats">
                       
                        <span className="admin-analytics__owner-rating">4.8★</span>
                      </div>
                    </div>
                    
                    <div className="admin-analytics__owner-item">
                      <div className="admin-analytics__owner-indicator admin-analytics__owner-indicator--green"></div>
                      <div className="admin-analytics__owner-info">
                        <span className="admin-analytics__owner-name">Verde Farms Co.</span>
                        <span className="admin-analytics__owner-product">Coffee Beans</span>
                      </div>
                      <div className="admin-analytics__owner-stats">
                       
                        <span className="admin-analytics__owner-rating">4.6★</span>
                      </div>
                    </div>
                    
                    <div className="admin-analytics__owner-item">
                      <div className="admin-analytics__owner-indicator admin-analytics__owner-indicator--orange"></div>
                      <div className="admin-analytics__owner-info">
                        <span className="admin-analytics__owner-name">Island Delights</span>
                        <span className="admin-analytics__owner-product">Banana Chips</span>
                      </div>
                      <div className="admin-analytics__owner-stats">
                        
                        <span className="admin-analytics__owner-rating">4.4★</span>
                      </div>
                    </div>
                    
                    <div className="admin-analytics__owner-item">
                      <div className="admin-analytics__owner-indicator admin-analytics__owner-indicator--purple"></div>
                      <div className="admin-analytics__owner-info">
                        <span className="admin-analytics__owner-name">Artisan Hands</span>
                        <span className="admin-analytics__owner-product">Handmade Crafts</span>
                      </div>
                      <div className="admin-analytics__owner-stats">
                        
                        <span className="admin-analytics__owner-rating">4.2★</span>
                      </div>
                    </div>
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
