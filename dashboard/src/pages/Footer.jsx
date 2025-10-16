import React, { useState } from 'react';
import '../css/Footer.css';
import logoDarkText from '../logos/Icon on dark with text.png';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';

function Footer() {
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showAboutPopup, setShowAboutPopup] = useState(false);

  const handleEmailMarketingClick = (e) => {
    e.preventDefault();
    setShowEmailPopup(true);
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    setShowTermsPopup(true);
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setShowAboutPopup(true);
  };

  const closeEmailPopup = () => {
    setShowEmailPopup(false);
  };

  const closeTermsPopup = () => {
    setShowTermsPopup(false);
  };

  const closeAboutPopup = () => {
    setShowAboutPopup(false);
  };
  return (
 <footer className="footer">
  <div className="footer-container">

    <div className="footer-brand">
      <img src={logoDarkText} alt="ELako.NV Logo" className="footer-logo" />
      <p> Digital Marketing  Solution For The Micro, Small, and 
        Medium Enterprises MSME's in Nueva Vizcaya</p>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: 10, justifyContent: 'flex-start' }}>
          <a href="https://www.facebook.com/ELako.NV" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
            <FacebookIcon style={{ color: 'white', fontSize: 30, cursor: 'pointer', transition: 'color 0.3s ease' }} 
                         onMouseEnter={(e) => e.target.style.color = '#7ed957'}
                         onMouseLeave={(e) => e.target.style.color = 'white'} />
          </a>
          <a href="https://www.instagram.com/elako.nv/" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
            <InstagramIcon style={{ color: 'white', fontSize: 30, cursor: 'pointer', transition: 'color 0.3s ease' }} 
                          onMouseEnter={(e) => e.target.style.color = '#7ed957'}
                          onMouseLeave={(e) => e.target.style.color = 'white'} />
          </a>
          <a href="mailto:elakonv@gmail.com" style={{ color: 'white' }}>
            <EmailIcon style={{ color: 'white', fontSize: 30, cursor: 'pointer', transition: 'color 0.3s ease' }} 
                      onMouseEnter={(e) => e.target.style.color = '#7ed957'}
                      onMouseLeave={(e) => e.target.style.color = 'white'} />
          </a>
        </div>

    </div>

    <div className="footer-links">
      <div className="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="#">Content Marketing</a></li>
          <li><a href="#" onClick={handleEmailMarketingClick}>Email Marketing</a></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#" onClick={handleAboutClick}>About Us</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#" onClick={handleTermsClick}>Terms and Agreement</a></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Contact</h4> 
        <ul>
          <li>Email: <a href="mailto:elakonv@gmail.com">elakonv@gmail.com</a></li>
          <li>Phone: 09686926952</li>
        </ul>
      </div>
    </div>
  </div>

  <div className="footer-bottom">
    © 2025 ELako.NV. All rights reserved.
  </div>

  {/* Email Marketing Popup */}
  {showEmailPopup && (
    <div className="email-popup-overlay" onClick={closeEmailPopup}>
      <div className="email-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="email-popup-header">
          <h3>ELako.Nv Email Marketing</h3>
          <button className="email-popup-close" onClick={closeEmailPopup}>×</button>
        </div>
        <div className="email-popup-body">
          <p>
            When you follow a store, you'll automatically receive emails whenever that store adds new products, 
            restocks an item, launches a promo, or changes product prices—whether it's an increase or a decrease.
          </p>
          <p>
            <strong>Stay updated and never miss any important store updates from ELako.Nv!</strong>
          </p>
        </div>
        <div className="email-popup-footer">
          <button className="email-popup-btn" onClick={closeEmailPopup}>Got it!</button>
        </div>
      </div>
    </div>
  )}

  {/* Terms and Agreement Popup */}
  {showTermsPopup && (
    <div className="terms-popup-overlay" onClick={closeTermsPopup}>
      <div className="terms-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="terms-popup-header">
          <h3>Terms and Agreement</h3>
          <button className="terms-popup-close" onClick={closeTermsPopup}>×</button>
        </div>
        <div className="terms-popup-body">
          <div className="terms-section">
            <p><strong>Effective Date:</strong> September 5, 2025</p>
            <p><strong>Terms Acceptance:</strong> By signing up for ELako.Nv, you automatically accept these terms on the date of your account creation.</p>
            <p>Welcome to <strong>ELako.Nv</strong>, a digital marketing platform designed to help Micro, Small, and Medium Enterprises (MSMEs) in Nueva Vizcaya promote and grow their businesses online. By creating an account, accessing, or using our platform, you agree to the terms below.</p>
          </div>

          <div className="terms-section">
            <h4>1. Purpose of the Platform</h4>
            <p>• ELako.Nv provides digital tools and services that allow MSMEs to showcase their products, connect with customers, and enhance their visibility online.</p>
            <p>• Our mission is to empower local businesses through innovative marketing solutions.</p>
          </div>
          
          <div className="terms-section">
            <h4>2. Acceptance of Terms</h4>
            <p>• By using ELako.Nv, you agree to follow these Terms and Agreement.</p>
            <p>• If you do not agree with any part of these terms, please do not use the platform.</p>
          </div>
          
          <div className="terms-section">
            <h4>3. Account Registration</h4>
            <p>• You must provide accurate and up-to-date information during registration.</p>
            <p>• You are responsible for keeping your login details secure.</p>
            <p>• ELako.Nv reserves the right to suspend or remove accounts that contain false information, are inactive, or violate our policies.</p>
          </div>
          
          <div className="terms-section">
            <h4>4. User Responsibilities</h4>
            <p>All users, including MSME owners and customers, agree to:</p>
            <p>• Use the system only for lawful and legitimate purposes.</p>
            <p>• Avoid posting false, harmful, or misleading content.</p>
            <p>• Not upload materials containing viruses, spam, or offensive language.</p>
            <p>• Respect the rights of other users and businesses.</p>
          </div>
          
          <div className="terms-section">
            <h4>5. Content Ownership and Usage</h4>
            <p>• MSME owners retain full ownership of the content they upload (e.g., photos, logos, descriptions).</p>
            <p>• By uploading content, you allow ELako.Nv to display and promote it within the platform for marketing or system purposes.</p>
            <p>• ELako.Nv may remove content that violates these terms or contains inappropriate material.</p>
          </div>
          
          <div className="terms-section">
            <h4>6. Privacy Policy</h4>
            <p><strong>Information We Collect:</strong> Account details, uploaded content, and technical information.</p>
            <p><strong>How We Use Your Information:</strong> To operate the platform, personalize experience, send updates, and promote MSME visibility.</p>
            <p><strong>Data Security:</strong> We use reasonable security measures to protect your information.</p>
            <p><strong>User Rights:</strong> You can view, update, or request deletion of your personal data.</p>
          </div>
          
          <div className="terms-section">
            <h4>7. Service Availability & Limitation of Liability</h4>
            <p>• ELako.Nv strives to keep the system running smoothly but temporary downtime may occur.</p>
            <p>• ELako.Nv is not responsible for technical issues, content posted by users, or misuse caused by user negligence.</p>
            <p>• Use of the platform is at your own risk.</p>
          </div>
          
          <div className="terms-section">
            <h4>8. Contact Information</h4>
            <p>If you have questions about these Terms, please contact us:</p>
            <p>📩 <strong>elakonv@gmail.com</strong></p>
            <p>📍 <strong>Nueva Vizcaya, Philippines</strong></p>
          </div>
        </div>
        <div className="terms-popup-footer">
          <button className="terms-popup-btn" onClick={closeTermsPopup}>I Understand</button>
        </div>
      </div>
    </div>
  )}

  {/* About Us Popup */}
  {showAboutPopup && (
    <div className="about-popup-overlay" onClick={closeAboutPopup}>
      <div className="about-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="about-popup-header">
          <h3>What is ELako.Nv?</h3>
          <button className="about-popup-close" onClick={closeAboutPopup}>×</button>
        </div>
        <div className="about-popup-body">
          <div className="about-section">
            <p>
              <strong>ELako.Nv</strong> is a digital marketing platform designed to support and empower 
              Micro, Small, and Medium Enterprises (MSMEs) in Nueva Vizcaya. Our goal is to help local 
              businesses grow by providing them with a modern online space where they can promote their 
              products, reach more customers, and strengthen their digital presence.
            </p>
          </div>

          <div className="about-section">
            <p>
              We believe that every local business deserves a chance to thrive in the digital age. 
              Through ELako.Nv, MSMEs can easily showcase their products, connect with customers, 
              and stay competitive in today's fast-changing market. From product listings to promotions 
              and email updates, ELako.Nv makes it simple, accessible, and effective for both businesses 
              and consumers to connect.
            </p>
          </div>

          <div className="about-section">
            <h4>Development Team</h4>
            <p>This platform was developed by students as part of their thesis project:</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Baquiran, Jenzon Emerald N.</li>
              <li>Dela Peña, Nicolai Benedict D.</li>
              <li>Lacaden, Adrian Deo B.</li>
              <li>Layno, Zeth Laurence R.</li>
              <li>Valentin, Ferylene C.</li>
            </ul>
          </div>

          <div className="about-section">
            <p>
              The project started in <strong>August 2024</strong> with the goal of providing a digital 
              solution that bridges the gap between consumers and local businesses, supporting growth, 
              opportunity, and innovation within the province of Nueva Vizcaya.
            </p>
          </div>
        </div>
        <div className="about-popup-footer">
          <button className="about-popup-btn" onClick={closeAboutPopup}>Close</button>
        </div>
      </div>
    </div>
  )}
</footer>

  );
}

export default Footer;
