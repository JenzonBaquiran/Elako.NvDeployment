import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingMessageIcon from '../components/FloatingMessageIcon';
import BlogHero from '../components/BlogHero';
import { useAuth } from '../contexts/AuthContext';
import { recordStoreView } from '../utils/storeViewTracker';
import heroPic from '../pictures/IMG_6125.jpg';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import '../css/Home.css';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newStores, setNewStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch new stores from backend with dashboard information
  useEffect(() => {
    fetchNewStores();
  }, []);

  const fetchNewStores = async () => {
    try {
      // Use the stores endpoint that properly filters for approved and visible stores
      const storesResponse = await fetch('http://localhost:1337/api/stores');
      const storesData = await storesResponse.json();
      
      if (storesData.success) {
        // Sort by creation date (newest first) and take first 6
        const sortedStores = storesData.stores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
        
        setNewStores(sortedStores);
      } else {
        console.error('Failed to fetch stores:', storesData.error);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate days since joining
  const getDaysAgo = (dateString) => {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 14) return "1 week ago";
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Example icons using Unicode (replace with SVG or icon library if needed)
  const starIcon = <span style={{color: "#0097a7", fontSize: "1rem", marginRight: "0.25rem"}}>★</span>;
  const arrowIcon = <span style={{marginLeft: "0.5rem", fontSize: "1rem"}}>→</span>;
  

  const cards = [
    {
      label: "Hot",
      labelClass: "hot",
      title: "Social Media Management Pro",
      desc: "Complete social media strategy and content creation",
      rating: "4.9 (234)",
      price: "$299/month"
    },
    {
      label: "Trending",
      labelClass: "trending",
      title: "SEO Optimization Suite",
      desc: "Boost your search rankings with advanced SEO tools",
      rating: "4.8 (189)",
      price: "$199/month"
    },
    {
      label: "Popular",
      labelClass: "popular",
      title: "Email Marketing Automation",
      desc: "Automated email campaigns that convert",
      rating: "4.7 (156)",
      price: "$149/month"
    },
    {
      label: "Hot",
      labelClass: "hot",
      title: "PPC Campaign Management",
      desc: "Expert Google Ads and Facebook Ads management",
      rating: "4.9 (298)",
      price: "$399/month"
    }
  ];

  return (
    <div>
      <Navbar />
      <BlogHero />
      <section className="hot-picks">
        <div className="hot-picks-header" data-aos="fade-right">
          {/* <span className="hot-pick-icon">🔥</span> */}
          <h1></h1>
          <h2>Hot Picks</h2>
          <div className="hot-picks-viewall">
            <button className="hero-button hero-button-outline">
              View All 
            </button>
          </div>
        </div>
     
        <div className="hot-picks-list-container">
          <div className="hot-picks-list">
            {cards.map((card, idx) => (
              <div className="hot-pick-card" key={idx} data-aos="zoom-in">
                <img src={heroPic} alt="Service" />
                <div className={`hot-pick-label ${card.labelClass}`}>{card.label}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <div className="hot-pick-rating">
                  {starIcon}
                  <span>{card.rating}</span>
                </div>
                <div className="hot-pick-price">
                  {card.price}
                </div>
                <button className="hero-button hero-button-primary" style={{width: "100%", marginTop: "1rem"}}>
                  View Product
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="top-stores">
  <div className="top-stores-header">
    {/* <span className="top-stores-icon">🏅</span> */}
    <h1></h1>
    <h2>Top Stores</h2>
    <div className="top-stores-viewall">
      <button 
        className="hero-button hero-button-outline"
        onClick={() => navigate('/customer/stores')}
      >
        View All
      </button>
    </div>
  </div>
  <div className="top-stores-list-container">
    <div className="top-stores-list">
      {/* Example cards, replace with dynamic data as needed */}
      <div className="top-stores-card">
        <img src={heroPic} alt="Content Creation Studio" />
        <div className="top-stores-label content">Content</div>
        <h3>Content Creation Studio</h3>
        <p>AI-powered content generation for all platforms</p>
        <div className="top-stores-rating">★ 4.9 (412 reviews)</div>
        <button 
          className="hero-button hero-button-outline" 
          style={{width: "100%", marginTop: "1rem"}}
          onClick={() => navigate('/customer/stores')}
        >
          Visit Store
        </button>
      </div>
      <div className="top-stores-card">
        <img src={heroPic} alt="Analytics Pro Dashboard" />
        <div className="top-stores-label analytics">Analytics</div>
        <h3>Analytics Pro Dashboard</h3>
        <p>Advanced marketing analytics and reporting</p>
        <div className="top-stores-rating">★ 4.8 (356 reviews)</div>
        <button 
          className="hero-button hero-button-outline" 
          style={{width: "100%", marginTop: "1rem"}}
          onClick={() => navigate('/customer/stores')}
        >
          Visit Store
        </button>
      </div>
      <div className="top-stores-card">
        <img src={heroPic} alt="Influencer Connect" />
        <div className="top-stores-label influencer">Influencer</div>
        <h3>Influencer Connect</h3>
        <p>Connect with top influencers in your niche</p>
        <div className="top-stores-rating">★ 4.7 (289 reviews)</div>
        <button 
          className="hero-button hero-button-outline" 
          style={{width: "100%", marginTop: "1rem"}}
          onClick={() => navigate('/customer/stores')}
        >
          Visit Store
        </button>
      </div>
      <div className="top-stores-card">
        <img src={heroPic} alt="Brand Design Suite" />
        <div className="top-stores-label design">Design</div>
        <h3>Brand Design Suite</h3>
        <p>Professional branding and design tools</p>
        <div className="top-stores-rating">★ 4.8 (234 reviews)</div>
        <button 
          className="hero-button hero-button-outline" 
          style={{width: "100%", marginTop: "1rem"}}
          onClick={() => navigate('/customer/stores')}
        >
          Visit Store
        </button>
      </div>
      <div className="top-stores-card">
        <img src={heroPic} alt="Video Marketing Hub" />
        <div className="top-stores-label video">Video</div>
        <h3>Video Marketing Hub</h3>
        <p>Create and distribute engaging video content</p>
        <div className="top-stores-rating">★ 4.9 (178 reviews)</div>
        <button 
          className="hero-button hero-button-outline" 
          style={{width: "100%", marginTop: "1rem"}}
          onClick={() => navigate('/customer/stores')}
        >
          Visit Store
        </button>
      </div>
      <div className="top-stores-card">
        <img src={heroPic} alt="Conversion Optimizer" />
        <div className="top-stores-label optimization">Optimization</div>
        <h3>Conversion Optimizer</h3>
        <p>A/B testing and conversion rate optimization</p>
        <div className="top-stores-rating">★ 4.6 (145 reviews)</div>
        <button 
          className="hero-button hero-button-outline" 
          style={{width: "100%", marginTop: "1rem"}}
          onClick={() => navigate('/customer/stores')}
        >
          Visit Store
        </button>
      </div>
    </div>
  </div>
</section>
<section className="service-providers-section">
  <div className="service-providers-header">
    <div className="service-providers-title">
      <h2>New Stores</h2>
    </div>
    <div className="recently-joined-viewall">
       <button 
         className="hero-button hero-button-outline"
         onClick={() => navigate('/customer/stores')}
       >
         View All
       </button>
    </div>
  </div>
 
  <div className="service-providers-grid">
    {loading ? (
      // Loading state
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gridColumn: '1 / -1' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>Loading new stores...</p>
      </div>
    ) : newStores.length === 0 ? (
      // No stores state
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gridColumn: '1 / -1' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>No new stores found.</p>
      </div>
    ) : (
      // Display fetched stores with new card design
      newStores.map((store) => {
        const dashboard = store.dashboard;
        const storeLogo = dashboard?.storeLogo 
          ? `http://localhost:1337/uploads/${dashboard.storeLogo}` 
          : heroPic;
        const businessName = dashboard?.businessName || store.businessName;
        const description = dashboard?.description || 'MSME business services';
        const location = dashboard?.location || store.address || 'Philippines';
        const joinedDays = getDaysAgo(store.createdAt);
        const isNew = joinedDays.includes('day') && parseInt(joinedDays) <= 7;
        
        return (
          <div className="new-store-card" key={store.id || store._id}>
            <div className="store-image-section">
              <img 
                className="store-main-image" 
                src={storeLogo} 
                alt={businessName}
                onError={(e) => {
                  e.target.src = heroPic; // Fallback to default image if logo fails to load
                }}
              />
              <div className={`store-category-badge ${store.category?.toLowerCase().replace(/\s+/g, '') || 'default'}`}>
                {store.category || 'Business'}
              </div>
              {isNew && (
                <div className="store-new-badge">New</div>
              )}
            </div>
            
            <div className="store-content">
              <h3 className="store-title">{businessName}</h3>
              <p className="store-description">{description}</p>
              
              <div className="store-rating">
                <span className="star">★</span>
                {dashboard?.rating ? (
                  <span>{dashboard.rating.toFixed(1)} ({dashboard.reviewCount || 0} reviews)</span>
                ) : (
                  <span>New Business (0 reviews)</span>
                )}
              </div>
              
              <div className="store-joined">
                Joined {joinedDays}
              </div>
              
              <div className="store-location">
                <LocationOnIcon className="location-icon" />
                <span>{location}</span>
              </div>
              
              <button 
                className="store-learn-btn"
                onClick={() => {
                  recordStoreView(store._id, user?._id, navigate);
                }}
              >
                Visit Store
              </button>
            </div>
          </div>
        );
      })
    )}
  </div>
</section>

      <Footer />
      <FloatingMessageIcon />
    </div>
  );
}

export default Home;