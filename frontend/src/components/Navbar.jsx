import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Navbar.css';

const Navbar = ({ user, onToggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isAuthenticated = !!user;
  const isMobile = window.innerWidth <= 768;

  // Listen for scroll events to add navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu when navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
    
    // On mobile, also close the menu when toggling sidebar
    if (isMobile && menuOpen) {
      setMenuOpen(false);
    }
  };

  const logout = () => {
    window.open("http://localhost:5000/auth/logout", "_self");
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          {isAuthenticated && (
            <button 
              className="sidebar-toggle-btn visible" 
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <span className="toggle-icon">
                <span className="toggle-line"></span>
              </span>
            </button>
          )}
          <Link to="/" className="navbar-brand">
            <span className="brand-text">TrackFolio</span>
          </Link>
        </div>

        <div className="navbar-right">
          {/* Desktop Navigation Links */}
          <nav className="navbar-nav">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/portfolioHome" 
                  className={`nav-link ${isActive('/portfolioHome') ? 'active' : ''}`}
                >
                  Portfolio
                </Link>
                <Link 
                  to="/resume-builder-home" 
                  className={`nav-link ${isActive('/resume-builder-home') ? 'active' : ''}`}
                >
                  Resume
                </Link>
                <Link 
                  to="/ats" 
                  className={`nav-link ${isActive('/ats') ? 'active' : ''}`}
                >
                  ATS
                </Link>
              </>
            ) : null}
          </nav>

          {/* User Profile or Auth Buttons */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-profile">
                <div className="user-info">
                  {user?.photos?.[0]?.value ? (
                    <img 
                      src={user.photos[0].value} 
                      alt="Profile" 
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-default-avatar">
                      {user?.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="username">{user?.displayName || 'User'}</span>
                </div>
                <button 
                  onClick={logout}
                  className="logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">
                  Login
                </Link>
                <Link to="/signup" className="signup-btn">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`mobile-menu-btn ${menuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="menu-icon">
              <span className="menu-icon-line"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <>
            <div className="mobile-user">
              {user?.photos?.[0]?.value ? (
                <img 
                  src={user.photos[0].value} 
                  alt="Profile" 
                  className="mobile-avatar"
                />
              ) : (
                <div className="mobile-default-avatar">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="mobile-username">{user?.displayName || 'User'}</span>
            </div>
            <nav className="mobile-nav">
              <Link 
                to="/portfolioHome" 
                className={`mobile-nav-link ${isActive('/portfolioHome') ? 'active' : ''}`}
              >
                Portfolio
              </Link>
              <Link 
                to="/resume-builder-home" 
                className={`mobile-nav-link ${isActive('/resume-builder-home') ? 'active' : ''}`}
              >
                Resume
              </Link>
              <Link 
                to="/ats" 
                className={`mobile-nav-link ${isActive('/ats') ? 'active' : ''}`}
              >
                ATS
              </Link>
            </nav>
            <button 
              onClick={logout}
              className="mobile-logout"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="mobile-auth">
            <Link to="/login" className="mobile-login">
              Login
            </Link>
            <Link to="/signup" className="mobile-signup">
              Sign Up
            </Link>
          </div>
        )}
      </div>
      
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </header>
  );
};

Navbar.propTypes = {
  user: PropTypes.object,
  onToggleSidebar: PropTypes.func,
};

export default Navbar;