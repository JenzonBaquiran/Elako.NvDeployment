import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroPic from '../pictures/IMG_6125.jpg';
import crafts1 from '../pictures/CRAFTS1.png';
import bukoPie from '../pictures/BUKO PIE.png';
import paintings from '../pictures/PAINTINGS.png';
import weaving from '../pictures/WEAVING.png';
import '../css/BlogHero.css';

const BlogHero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);

  // Fetch blog posts from API
  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/blog-posts/published');
      const data = await response.json();
      if (data.success) {
        setBlogPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Fallback to default posts if API fails
      setBlogPosts([
        {
          _id: 1,
          category: "SUCCESS STORIES",
          title: "From Local Craft to Global Market",
          subtitle: "Traditional Filipino weaving meets digital innovation",
          createdAt: "2025-10-02",
          author: "ELAKO TEAM",
          readTime: "5 MIN READ",
          mediaType: "image",
          mediaUrl: "WEAVING.png",
          description: "Maria's weaving story proves that traditional crafts and digital innovation create perfect harmony for business success.",
          featured: true
        }
      ]);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % blogPosts.length);
      setIsDescriptionExpanded(false); // Reset description when auto-sliding
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [blogPosts.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    setIsDescriptionExpanded(false); // Reset description when changing slides
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const currentPost = blogPosts[currentSlide];
  
  // Helper function to get media URL
  const getMediaUrl = (post) => {
    if (!post) return heroPic;
    
    switch (post.mediaType) {
      case 'youtube':
        return post.mediaUrl;
      case 'video':
        return `http://localhost:1337/uploads/${post.mediaUrl}`;
      case 'image':
      default:
        // Check if it's a local image from our pictures folder
        if (['WEAVING.png', 'BUKO PIE.png', 'CRAFTS1.png', 'PAINTINGS.png'].includes(post.mediaUrl)) {
          switch (post.mediaUrl) {
            case 'WEAVING.png': return weaving;
            case 'BUKO PIE.png': return bukoPie;
            case 'CRAFTS1.png': return crafts1;
            case 'PAINTINGS.png': return paintings;
            default: return heroPic;
          }
        }
        return `http://localhost:1337/uploads/${post.mediaUrl}`;
    }
  };

  // Helper function to render media
  const renderMedia = (post) => {
    if (!post) return <img src={heroPic} alt="Default" className="blog-hero-image" />;
    
    switch (post.mediaType) {
      case 'youtube':
        let videoId;
        if (post.mediaUrl.includes('youtube.com')) {
          videoId = post.mediaUrl.split('v=')[1]?.split('&')[0];
        } else if (post.mediaUrl.includes('youtu.be')) {
          videoId = post.mediaUrl.split('/').pop().split('?')[0];
        } else {
          videoId = post.mediaUrl.split('/').pop();
        }
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            frameBorder="0"
            allow="encrypted-media"
            allowFullScreen
            className="blog-hero-image"
          ></iframe>
        );
      case 'video':
        return (
          <video
            src={getMediaUrl(post)}
            className="blog-hero-image"
            autoPlay
            muted
            loop
            playsInline
          />
        );
      case 'image':
      default:
        return (
          <img
            src={getMediaUrl(post)}
            alt={post.title}
            className="blog-hero-image"
          />
        );
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  };

  if (blogPosts.length === 0) {
    return (
      <section className="blog-hero">
        <div className="blog-hero-container">
          <div className="blog-hero-content">
            <div className="empty-hero-state">
              <h1>Welcome to ELAKO</h1>
              <p>Empowering Filipino MSMEs through digital innovation</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-hero">
      <div className="blog-hero-container">
        <div className="blog-hero-content">
          <div className="blog-hero-image-section">
            <div className="blog-hero-image-container">
              {renderMedia(currentPost)}
              <div className="blog-hero-overlay">
                <div className="blog-hero-category-badge">
                  {currentPost.category}
                </div>
                {currentPost.featured && (
                  <div className="blog-hero-featured-badge">
                    FEATURED
                  </div>
                )}
                
                {/* Video-like caption overlay */}
                <div className="blog-hero-video-caption">
                  <div className="caption-text">
                    <h3 className="caption-title">{currentPost.title}</h3>
                    <p className="caption-subtitle">{currentPost.subtitle}</p>
                  </div>
                  <div className="caption-progress">
                    <div 
                      className="progress-bar"
                      style={{
                        animationDuration: '5s',
                        animationDelay: `${currentSlide * 5}s`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Slide indicators */}
            <div className="blog-hero-indicators">
              {blogPosts.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => handleSlideChange(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="blog-hero-text-section">
            <div className="blog-hero-meta">
              <span className="blog-hero-date">{currentPost ? formatDate(currentPost.createdAt) : ''}</span>
              <span className="blog-hero-divider">•</span>
              <span className="blog-hero-author">BY {currentPost?.author || 'ELAKO TEAM'}</span>
              <span className="blog-hero-divider">•</span>
              <span className="blog-hero-read-time">{currentPost?.readTime || '5 MIN READ'}</span>
            </div>

            <h1 className="blog-hero-title">
              {currentPost?.title || 'Welcome to ELAKO'}
            </h1>

            <h2 className="blog-hero-subtitle">
              {currentPost?.subtitle || 'Empowering Filipino MSMEs'}
            </h2>

            <div className="blog-hero-description-container">
              <p className={`blog-hero-description ${isDescriptionExpanded ? 'expanded' : 'collapsed'}`}>
                {currentPost?.description || 'Discover amazing success stories from Filipino entrepreneurs.'}
              </p>
              {currentPost?.description && currentPost.description.length > 120 && (
                <button 
                  className="read-more-btn"
                  onClick={toggleDescription}
                >
                  {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button 
          className="blog-hero-nav prev"
          onClick={() => handleSlideChange((currentSlide - 1 + blogPosts.length) % blogPosts.length)}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button 
          className="blog-hero-nav next"
          onClick={() => handleSlideChange((currentSlide + 1) % blogPosts.length)}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default BlogHero;