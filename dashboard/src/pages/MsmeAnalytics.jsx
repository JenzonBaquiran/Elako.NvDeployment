import React, { useState } from 'react';
import MsmeSidebar from './MsmeSidebar';
import '../css/MsmeAnalytics.css';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

const MsmeAnalytics = () => {
  const [sidebarState, setSidebarState] = useState({ isOpen: true, isMobile: false });

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
            <div className="msme-analytics__stat-value">1,847</div>
            <div className="msme-analytics__stat-label">Profile Views</div>
            <div className="msme-analytics__stat-change positive">+12% This week</div>
          </div>
          <div className="msme-analytics__stat-box">
            <div className="msme-analytics__stat-value">456</div>
            <div className="msme-analytics__stat-label">Followers</div>
            <div className="msme-analytics__stat-change positive">+5% New followers</div>
          </div>
          <div className="msme-analytics__stat-box">
            <div className="msme-analytics__stat-value">4.8</div>
            <div className="msme-analytics__stat-label">Avg Rating</div>
            <div className="msme-analytics__stat-change positive">+0.2 improvement</div>
          </div>
          <div className="msme-analytics__stat-box">
            <div className="msme-analytics__stat-value">89%</div>
            <div className="msme-analytics__stat-label">Customer Satisfaction</div>
            <div className="msme-analytics__stat-change positive">+3% This month</div>
          </div>
        </div>

        <div className="msme-analytics__charts-grid">
          <div className="msme-analytics__chart-card">
            <div className="msme-analytics__chart-header">
              <h3>Monthly Performance Trends</h3>
              <p>Track your business metrics over time</p>
            </div>
            <div className="msme-analytics__chart-container">
              <BarChart
                width={600}
                height={300}
                series={[
                  {
                    data: [1200, 1350, 1500, 1650, 1750, 1847],
                    label: 'Profile Views',
                    color: '#313131',
                  },
                  {
                    data: [320, 350, 380, 410, 430, 456],
                    label: 'Followers',
                    color: '#7ed957',
                  },
                ]}
                xAxis={[
                  {
                    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    scaleType: 'band',
                  },
                ]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              />
            </div>
          </div>

          <div className="msme-analytics__chart-card">
            <div className="msme-analytics__chart-header">
              <h3>Product Performance</h3>
              <p>Sales performance by product category</p>
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
