import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaChevronUp } from 'react-icons/fa';
import './Footer.css'; // Ensure this path is correct

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      <div className="footer-glow"></div>

      <div className="footer-content footer-container">
        <div className="footer-brand">
          <h2 className="footer-logo">TrackFolio</h2>
          <p className="footer-description">
            Your all-in-one platform for portfolio management, resume building, and ATS optimization.
          </p>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Explore</h3>
          <ul className="footer-links">
            <li><Link to="/home">Dashboard</Link></li>
            <li><Link to="/portfolioHome">Portfolio</Link></li>
            <li><Link to="/resume-builder-home">Resume</Link></li>
            <li><Link to="/ats">ATS Scanner</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Connect</h3>
          <p className="footer-description">
            Stay updated with our latest features and news. Follow us on social media!
          </p>
          {/* Social links are already above */}
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} TrackFolio. All rights reserved.</p>
        <button onClick={scrollToTop} className="scroll-top-button">
          <FaChevronUp /> Back to Top
        </button>
      </div>
    </footer>
  );
};

export default Footer;