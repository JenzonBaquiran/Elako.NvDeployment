import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import defaultStoreImg from '../assets/pic.jpg';
import foodStoreImg from '../assets/shakshouka.jpg';

const StoreImage = ({ store, className, alt }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getImageUrl = (store) => {
    // Debug logging
    console.log('StoreImage - Store data:', {
      businessName: store.businessName,
      dashboard: store.dashboard,
      storeLogo: store.dashboard?.storeLogo,
      coverPhoto: store.dashboard?.coverPhoto,
      category: store.category
    });

    // If we've already had an error, use fallback immediately
    if (imageError) {
      console.log('Using fallback due to previous error');
      return getFallbackImage(store);
    }

    // Priority: storeLogo > coverPhoto > fallback
    if (store.dashboard?.storeLogo) {
      const logoUrl = `${API_BASE_URL}/uploads/${store.dashboard.storeLogo}`;
      console.log('Using storeLogo:', logoUrl);
      return logoUrl;
    }
    
    if (store.dashboard?.coverPhoto) {
      const coverUrl = `${API_BASE_URL}/uploads/${store.dashboard.coverPhoto}`;
      console.log('Using coverPhoto:', coverUrl);
      return coverUrl;
    }
    
    console.log('No uploaded images found, using fallback');
    return getFallbackImage(store);
  };

  const getFallbackImage = (store) => {
    if (store.category === 'food') {
      return foodStoreImg;
    } else if (store.category === 'artisan') {
      return defaultStoreImg;
    }
    return defaultStoreImg;
  };

  const handleImageError = () => {
    console.log('Image error for store:', store.businessName);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded for store:', store.businessName);
    setIsLoading(false);
  };

  return (
    <div className={`store-image-container ${className || ''}`}>
      {isLoading && (
        <div className="store-image-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img 
        src={getImageUrl(store)}
        alt={alt || store.businessName} 
        className={`store-image ${isLoading ? 'loading' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default StoreImage;