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

  // Helper function to get YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    let videoId;
    if (url.includes('youtube.com')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be')) {
      videoId = url.split('/').pop().split('?')[0];
    } else {
      videoId = url.split('/').pop();
    }
    return videoId;
  };

  // Helper function to get YouTube thumbnail URL
  const getYouTubeThumbnail = (videoId) => {
    if (!videoId) return heroPic;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Helper function to handle YouTube click
  const handleYouTubeClick = (url) => {
    if (url) {
      window.open(url, '_blank');
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
    <section className="blog-hero" style={{backgroundImage: `url(${getMediaUrl(currentPost)})`}}>
      {/* Background image with overlay */}
      <div className="blog-hero-background">
        <div className="blog-hero-background-image">
          {renderMedia(currentPost)}
        </div>
      </div>
      
      <div className="blog-hero-container">
        <div className="blog-hero-content">
          <div className="blog-hero-text-section">
            {/* YouTube Thumbnail for YouTube videos */}
            {currentPost?.mediaType === 'youtube' && (
              <div 
                className="youtube-thumbnail-container"
                onClick={() => handleYouTubeClick(currentPost.mediaUrl)}
              >
                <img 
                  src={getYouTubeThumbnail(getYouTubeVideoId(currentPost.mediaUrl))}
                  alt={currentPost.title}
                  className="youtube-thumbnail"
                />
                <div className="youtube-play-button"></div>
                <div className="youtube-title">{currentPost.title}</div>
              </div>
            )}

            <h1 className="blog-hero-title">
              {currentPost?.title || 'Discovering Local Treasures: A Spotlight on Hidden Stores in Nueva Vizcaya'}
            </h1>

            {/* Category badge positioned below the title */}
            <div className="blog-hero-badges">
              <div className="blog-hero-category-badge">
                {currentPost?.category || 'FEATURED STORES'}
              </div>
            </div>

            <h2 className="blog-hero-subtitle">
              {currentPost?.subtitle || 'Exploring unique shops that bring culture and creativity closer to the community. Nueva Vizcaya is home to a variety of hidden gems—stores that not only sell products but also tell stories. From...'}
            </h2>

            <div className="blog-hero-actions">
              <button 
                className="blog-hero-cta-primary"
                onClick={() => {
                  if (currentPost?.mediaType === 'youtube') {
                    handleYouTubeClick(currentPost.mediaUrl);
                  } else {
                    navigate('/blog');
                  }
                }}
              >
                {currentPost?.mediaType === 'youtube' ? 'WATCH VIDEO' : 'READ MORE'}
                <span className="cta-arrow">→</span>
              </button>
            </div>
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
    </section>
  );
};

export default BlogHero;