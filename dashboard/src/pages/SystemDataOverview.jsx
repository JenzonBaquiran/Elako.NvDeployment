import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function SystemDataOverview() {
  const [data, setData] = useState({
    stores: [],
    products: [],
    customers: [],
    reviews: [],
    messages: [],
    topStores: [],
    hotPicks: [],
    badges: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllSystemData();
  }, []);

  const fetchAllSystemData = async () => {
    try {
      console.log('🔍 Fetching comprehensive system data from:', API_BASE_URL);
      setLoading(true);

      // Fetch all available data endpoints
      const endpoints = [
        { key: 'stores', url: `${API_BASE_URL}/api/stores` },
        { key: 'products', url: `${API_BASE_URL}/api/products` },
        { key: 'topStores', url: `${API_BASE_URL}/api/top-stores?limit=10` },
        { key: 'hotPicks', url: `${API_BASE_URL}/api/hot-picks?limit=10` },
        { key: 'availableProducts', url: `${API_BASE_URL}/api/products/available` },
      ];

      const results = {};

      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Fetching ${endpoint.key}...`);
          const response = await fetch(endpoint.url);
          const result = await response.json();
          results[endpoint.key] = result;
          console.log(`✅ ${endpoint.key}:`, result);
        } catch (err) {
          console.error(`❌ Error fetching ${endpoint.key}:`, err);
          results[endpoint.key] = { error: err.message };
        }
      }

      setData(results);
    } catch (err) {
      console.error('❌ Error fetching system data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDataSection = (title, data, count) => (
    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
      <h3 style={{ color: '#007bff', marginBottom: '15px' }}>
        {title} ({count || 'Loading...'})
      </h3>
      <pre style={{ 
        background: '#fff', 
        padding: '15px', 
        borderRadius: '5px', 
        overflow: 'auto', 
        maxHeight: '300px',
        fontSize: '12px',
        border: '1px solid #eee'
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  const getDataCount = (dataObj) => {
    if (!dataObj) return 0;
    if (dataObj.stores) return dataObj.stores.length;
    if (dataObj.products) return dataObj.products.length;
    if (dataObj.customers) return dataObj.customers.length;
    if (dataObj.reviews) return dataObj.reviews.length;
    if (Array.isArray(dataObj)) return dataObj.length;
    return Object.keys(dataObj).length;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#007bff' }}>🔍 Loading System Data...</h1>
        <p>Fetching all available data from MongoDB database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#dc3545' }}>❌ Error Loading Data</h1>
        <p>{error}</p>
        <button onClick={fetchAllSystemData} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#007bff', textAlign: 'center', marginBottom: '30px' }}>
          📊 ELAKO.NV System Data Overview
        </h1>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ color: '#28a745', marginBottom: '20px' }}>🎯 Database Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', background: '#e7f3ff', borderRadius: '5px', textAlign: 'center' }}>
              <strong>🏪 Stores</strong><br />
              {getDataCount(data.stores)} active stores
            </div>
            <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '5px', textAlign: 'center' }}>
              <strong>📦 Products</strong><br />
              {getDataCount(data.products)} total products
            </div>
            <div style={{ padding: '15px', background: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
              <strong>🏆 Top Stores</strong><br />
              {getDataCount(data.topStores)} featured
            </div>
            <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '5px', textAlign: 'center' }}>
              <strong>🔥 Hot Picks</strong><br />
              {getDataCount(data.hotPicks)} trending
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ marginBottom: '20px' }}>
          {['overview', 'stores', 'products', 'topStores', 'hotPicks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                margin: '0 5px',
                background: activeTab === tab ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Data Display */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ color: '#007bff', marginBottom: '20px' }}>📋 System Overview</h3>
              <p>This dashboard shows all the data available in your ELAKO.NV system:</p>
              <ul style={{ lineHeight: '1.8' }}>
                <li><strong>Stores:</strong> MSME businesses registered in the system</li>
                <li><strong>Products:</strong> Items listed by stores for customers to browse</li>
                <li><strong>Top Stores:</strong> Highest-rated stores based on customer feedback</li>
                <li><strong>Hot Picks:</strong> Trending products with high engagement</li>
                <li><strong>Available Products:</strong> Currently active and visible products</li>
              </ul>
              <div style={{ marginTop: '20px', padding: '15px', background: '#e9ecef', borderRadius: '5px' }}>
                <strong>🔗 API Base URL:</strong> {API_BASE_URL}
              </div>
            </div>
          )}

          {activeTab === 'stores' && renderDataSection('🏪 All Stores', data.stores, getDataCount(data.stores))}
          {activeTab === 'products' && renderDataSection('📦 All Products', data.products, getDataCount(data.products))}
          {activeTab === 'topStores' && renderDataSection('🏆 Top Rated Stores', data.topStores, getDataCount(data.topStores))}
          {activeTab === 'hotPicks' && renderDataSection('🔥 Hot Pick Products', data.hotPicks, getDataCount(data.hotPicks))}
        </div>

        {/* Navigation Links */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', marginBottom: '15px' }}>🧭 Navigation Test</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            <a href="/" style={{ padding: '8px 16px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>🏠 Home</a>
            <a href="/customer-favorites" style={{ padding: '8px 16px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>❤️ Favorites</a>
            <a href="/customer/top-stores" style={{ padding: '8px 16px', background: '#dc3545', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>🏆 Top Stores</a>
            <a href="/customer/hot-picks" style={{ padding: '8px 16px', background: '#fd7e14', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>🔥 Hot Picks</a>
            <a href="/customer/stores" style={{ padding: '8px 16px', background: '#6f42c1', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>🏪 All Stores</a>
            <a href="/data-test" style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>📊 Data Test</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemDataOverview;