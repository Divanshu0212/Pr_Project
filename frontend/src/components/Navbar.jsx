import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiMenu, FiX, FiUser, FiLogOut, FiSearch, FiBell, FiSettings, 
         FiChevronDown, FiInfo, FiHelpCircle, FiFolder, FiFileText, FiTarget } from 'react-icons/fi';
import './Navbar.css';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser: user, isAuthenticated, logout } = useAuth();
  console.log(user)
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  // Sample notifications - in a real app, these would come from your backend
  const notifications = [
    { id: 1, type: 'info', message: 'Welcome to TrackFolio!', time: '2 hours ago', read: false },
    { id: 2, type: 'success', message: 'Resume successfully updated', time: '1 day ago', read: true },
    { id: 3, type: 'warning', message: 'Complete your portfolio to improve visibility', time: '3 days ago', read: false }
  ];

  // Listen for scroll events to add navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  // Close the mobile menu when navigating
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && event.target.className !== 'search-toggle') {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Focus the search input when opening
      setTimeout(() => {
        const searchInput = document.getElementById('navbar-search');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
    
    // On mobile, also close the menu when toggling sidebar
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Implement your search logic here - this is just a placeholder
      console.log('Searching for:', searchTerm);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    logout(); // This is the logout function from AuthContext
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/home') return 'Dashboard';
    if (path.startsWith('/portfolio')) return 'Portfolio';
    if (path.startsWith('/resume')) return 'Resume Builder';
    if (path.startsWith('/ats')) return 'ATS Tracker';
    // Default to capitalized last segment of the path
    const segments = path.split('/').filter(Boolean);
    if (segments.length) {
      return segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1);
    }
    return 'TrackFolio';
  };

  const getNavIcon = (path) => {
    if (path.includes('portfolio')) return <FiFolder className="nav-icon" />;
    if (path.includes('resume')) return <FiFileText className="nav-icon" />;
    if (path.includes('ats')) return <FiTarget className="nav-icon" />;
    return null;
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="brand-text">TrackFolio</span>
          </Link>

          {isAuthenticated && (
            <div className="page-title-container">
              <h1 className="page-title">{getPageTitle()}</h1>
            </div>
          )}
        </div>

        <div className="navbar-middle">
          {isAuthenticated && (
            <div ref={searchRef} className={`search-container ${searchOpen ? 'open' : ''}`}>
              {searchOpen ? (
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    id="navbar-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="search-input"
                  />
                  <button type="submit" className="search-submit">
                    <FiSearch />
                  </button>
                  <button type="button" className="search-close" onClick={toggleSearch}>
                    <FiX />
                  </button>
                </form>
              ) : (
                <button className="search-toggle" onClick={toggleSearch} aria-label="Open search">
                  <FiSearch />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="navbar-right">
          {/* Desktop Navigation Links - Only shown when authenticated */}
          {isAuthenticated && (
            <nav className="navbar-nav">
              <Link 
                to="/portfolioHome" 
                className={`nav-link ${isActive('/portfolioHome') ? 'active' : ''}`}
              >
                <FiFolder className="nav-icon" />
                <span>Portfolio</span>
              </Link>
              <Link 
                to="/resume-builder-home" 
                className={`nav-link ${isActive('/resume-builder-home') ? 'active' : ''}`}
              >
                <FiFileText className="nav-icon" />
                <span>Resume</span>
              </Link>
              <Link 
                to="/ats/home" 
                className={`nav-link ${isActive('/ats') ? 'active' : ''}`}
              >
                <FiTarget className="nav-icon" />
                <span>ATS</span>
              </Link>
            </nav>
          )}

          {/* Authenticated Actions */}
          {isAuthenticated && (
            <div className="navbar-actions">
              {/* Notifications */}
              <div className="notification-wrapper" ref={notificationsRef}>
                <button 
                  className={`notification-btn ${notificationsOpen ? 'active' : ''}`}
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                >
                  <FiBell />
                  {notifications.some(n => !n.read) && (
                    <span className="notification-indicator"></span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      <button className="mark-all-read">Mark all read</button>
                    </div>
                    <div className="notifications-list">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                          >
                            <div className="notification-content">
                              <p>{notification.message}</p>
                              <span className="notification-time">{notification.time}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-notifications">
                          <p>No new notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="notifications-footer">
                      <Link to="/notifications">View all notifications</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings button */}
              <Link to="/settings" className="settings-btn" aria-label="Settings">
                <FiSettings />
              </Link>
              
              {/* Sidebar toggle button - only visible on desktop */}
              <button 
                className="sidebar-toggle-btn desktop-only" 
                onClick={handleToggleSidebar}
                aria-label="Toggle sidebar"
              >
                <FiMenu className="toggle-icon" />
              </button>
            </div>
          )}

          {/* User Profile or Auth Buttons */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-profile" ref={userMenuRef}>
                <button 
                  className="user-info-btn"
                  onClick={toggleUserMenu}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
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
                  <span className="username">{user?.username || 'User'}</span>
                  <FiChevronDown className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-avatar">
                          {user?.photos?.[0]?.value ? (
                            <img src={user.photos[0].value} alt="Profile" />
                          ) : (
                            <div className="dropdown-default-avatar">
                              {user?.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="dropdown-user-details">
                          <h4>{user?.displayName || 'User'}</h4>
                          <p>{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-content">
                      <Link to="/profile" className="dropdown-item">
                        <FiUser className="dropdown-icon" />
                        <span>Profile</span>
                      </Link>
                      <Link to="/settings" className="dropdown-item">
                        <FiSettings className="dropdown-icon" />
                        <span>Settings</span>
                      </Link>
                      <Link to="/help" className="dropdown-item">
                        <FiHelpCircle className="dropdown-icon" />
                        <span>Help Center</span>
                      </Link>
                      <Link to="/about" className="dropdown-item">
                        <FiInfo className="dropdown-icon" />
                        <span>About</span>
                      </Link>
                    </div>
                    <div className="dropdown-footer">
                      <button 
                        onClick={handleLogout}
                        className="logout-btn"
                      >
                        <FiLogOut className="dropdown-icon" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
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

          {/* Mobile Menu Toggle Button - Only shown when authenticated */}
          {isAuthenticated && (
            <button
              className={`mobile-menu-btn ${menuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <FiX className="menu-icon" />
              ) : (
                <FiMenu className="menu-icon" />
              )}
            </button>
          )}
          
          {/* Mobile Sidebar Toggle Button - Shown only on mobile when authenticated */}
          {isAuthenticated && (
            <button 
              className="sidebar-toggle-btn mobile-only" 
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FiMenu className="toggle-icon" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isAuthenticated && (
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
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
          
          <div className="mobile-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="mobile-search-input"
              />
              <button type="submit" className="mobile-search-btn">
                <FiSearch />
              </button>
            </form>
          </div>
          
          <nav className="mobile-nav">
            <Link 
              to="/home" 
              className={`mobile-nav-link ${isActive('/home') ? 'active' : ''}`}
            >
              <FiSearch className="mobile-nav-icon" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/portfolioHome" 
              className={`mobile-nav-link ${isActive('/portfolioHome') ? 'active' : ''}`}
            >
              <FiFolder className="mobile-nav-icon" />
              <span>Portfolio</span>
            </Link>
            <Link 
              to="/resume-builder-home" 
              className={`mobile-nav-link ${isActive('/resume-builder-home') ? 'active' : ''}`}
            >
              <FiFileText className="mobile-nav-icon" />
              <span>Resume</span>
            </Link>
            <Link 
              to="/ats/home" 
              className={`mobile-nav-link ${isActive('/ats') ? 'active' : ''}`}
            >
              <FiTarget className="mobile-nav-icon" />
              <span>ATS</span>
            </Link>
            <Link 
              to="/settings" 
              className={`mobile-nav-link ${isActive('/settings') ? 'active' : ''}`}
            >
              <FiSettings className="mobile-nav-icon" />
              <span>Settings</span>
            </Link>
            <Link 
              to="/help" 
              className={`mobile-nav-link ${isActive('/help') ? 'active' : ''}`}
            >
              <FiHelpCircle className="mobile-nav-icon" />
              <span>Help</span>
            </Link>
          </nav>
          
          <button 
            onClick={logout}
            className="mobile-logout"
          >
            <FiLogOut className="mobile-nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      )}
      
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </header>
  );
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func,
};

export default Navbar;