import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function DataTest() {
  const [stores, setStores] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [hotPicks, setHotPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      console.log('Fetching from:', API_BASE_URL);
      
      // Fetch all data in parallel
      const [storesRes, topStoresRes, hotPicksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stores`),
        fetch(`${API_BASE_URL}/api/top-stores?limit=6`),
        fetch(`${API_BASE_URL}/api/hot-picks?limit=4`)
      ]);

      const [storesData, topStoresData, hotPicksData] = await Promise.all([
        storesRes.json(),
        topStoresRes.json(),
        hotPicksRes.json()
      ]);

      console.log('Stores data:', storesData);
      console.log('Top stores data:', topStoresData);
      console.log('Hot picks data:', hotPicksData);

      if (storesData.success) {
        setStores(storesData.stores);
      }
      if (topStoresData.success) {
        setTopStores(topStoresData.stores);
      }
      if (hotPicksData.success) {
        setHotPicks(hotPicksData.products);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading MongoDB Data...</h2>
        <p>Fetching data from: {API_BASE_URL}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h2>Error Loading Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#007bff' }}>📊 MongoDB Data Test</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>🏪 Stores ({stores.length})</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {stores.map((store, index) => (
            <div key={index} style={{
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>{store.businessName}</h3>
              <p><strong>Category:</strong> {store.category}</p>
              <p><strong>Rating:</strong> {store.averageRating} ⭐ ({store.totalRatings} reviews)</p>
              <p><strong>Products:</strong> {store.productCount}</p>
              <p><strong>Followers:</strong> {store.followerCount}</p>
              <p><strong>Description:</strong> {store.dashboard?.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🏆 Top Stores ({topStores.length})</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {topStores.map((store, index) => (
            <div key={index} style={{
              border: '2px solid #28a745',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#f8fff8'
            }}>
              <h4>{store.businessName} - {store.averageRating}⭐</h4>
              <p>{store.dashboard?.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>🔥 Hot Picks ({hotPicks.length})</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {hotPicks.map((product, index) => (
            <div key={index} style={{
              border: '2px solid #dc3545',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#fff8f8'
            }}>
              <h4>{product.productName} - ₱{product.price}</h4>
              <p>{product.description}</p>
              <p><strong>Rating:</strong> {product.averageRating}⭐ ({product.totalReviews} reviews)</p>
              <p><strong>Category:</strong> {product.category}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <a href="/" style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default DataTest;