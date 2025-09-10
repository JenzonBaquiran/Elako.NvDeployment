import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Add, Message, Analytics, Settings } from '@mui/icons-material';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeDashboard.css';

const MsmeDashboard = () => {
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });
  const [businessName, setBusinessName] = useState('');
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
  }, []);

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
            <button className="msme-dashboard__customize-btn">Customize Dashboard</button>
          </div>
        </div>
        
        <div className="msme-dashboard__stats">
          <div className="msme-dashboard__stat-box">
            <div className="msme-dashboard__stat-value">2,847</div>
            <div className="msme-dashboard__stat-label">Page Views</div>
            <div className="msme-dashboard__stat-change positive">+8% from last month</div>
          </div>
          <div className="msme-dashboard__stat-box">
            <div className="msme-dashboard__stat-value">4.8</div>
            <div className="msme-dashboard__stat-label">Average Rating</div>
            <div className="msme-dashboard__stat-change neutral">Based on 181 reviews</div>
          </div>
          <div className="msme-dashboard__stat-box">
            <div className="msme-dashboard__stat-value">124</div>
            <div className="msme-dashboard__stat-label">New Customers</div>
            <div className="msme-dashboard__stat-change positive">+15% this week</div>
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
