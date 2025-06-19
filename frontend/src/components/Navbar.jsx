import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiBell, FiSettings, FiChevronDown, 
  FiInfo, FiHelpCircle, FiFolder, FiFileText, FiTarget, FiGrid 
} from 'react-icons/fi';
import './Navbar.css';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { currentUser: user, isAuthenticated, logout } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Sample notifications
  const notifications = [
    { id: 1, type: 'info', message: 'Welcome to TrackFolio!', time: '2 hours ago', read: false },
    { id: 2, type: 'success', message: 'Resume successfully updated', time: '1 day ago', read: true },
    { id: 3, type: 'warning', message: 'Complete your portfolio to improve visibility', time: '3 days ago', read: false }
  ];

  // --- Effect hooks remain the same ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); };
  const toggleNotifications = () => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); };

  const handleToggleSidebar = () => {
    if (onToggleSidebar) onToggleSidebar();
    if (isMobile) setMenuOpen(false);
  };

  const handleLogout = () => logout();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/home') return 'Dashboard';
    if (path.startsWith('/portfolio')) return 'Portfolio';
    if (path.startsWith('/resume')) return 'Resume Builder';
    if (path.startsWith('/ats')) return 'ATS Tracker';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/help')) return 'Help Center';

    const segments = path.split('/').filter(Boolean);
    if (segments.length) {
      const lastSegment = segments[segments.length - 1];
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
    return 'TrackFolio';
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          {/* --- UPDATED --- */}
          {/* This button will now ONLY appear if 'onToggleSidebar' is provided as a prop. */}
          {/* This makes the Navbar smarter; it won't show a non-functional button. */}
          {isAuthenticated && onToggleSidebar && (
            <button className="sidebar-toggle-btn desktop-only" onClick={handleToggleSidebar} aria-label="Toggle sidebar">
              <FiMenu className="toggle-icon" />
            </button>
          )}
          <Link to="/" className="navbar-brand">
            <span className="brand-text">TrackFolio</span>
          </Link>
          {isAuthenticated && (
            <div className="page-title-container">
              <h1 className="page-title relative top-3">{getPageTitle()}</h1>
            </div>
          )}
        </div>

        <div className="navbar-middle"></div>

        <div className="navbar-right">
          {isAuthenticated && (
            <div className="navbar-actions">
              <div className="notification-wrapper" ref={notificationsRef}>
                <button className={`notification-btn ${notificationsOpen ? 'active' : ''}`} onClick={toggleNotifications} aria-label="Notifications">
                  <FiBell />
                  {notifications.some(n => !n.read) && <span className="notification-indicator"></span>}
                </button>
                {/* --- UPDATED --- */}
                {/* Hardcoded notifications UI is restored here */}
                {notificationsOpen && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      <button className="mark-all-read">Mark all read</button>
                    </div>
                    <div className="notifications-list">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
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
              <Link to="/settings" className="settings-btn" aria-label="Settings">
                <FiSettings />
              </Link>
            </div>
          )}

          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-profile" ref={userMenuRef}>
                 <button className="user-info-btn" onClick={toggleUserMenu} aria-expanded={userMenuOpen} aria-haspopup="true">
                  {user?.profileImage?.url ? (
                    <img src={user.profileImage.url} alt="Profile" className="user-avatar" />
                  ) : (
                    <div className="user-default-avatar">{user?.displayName?.charAt(0) || 'U'}</div>
                  )}
                  <span className="username">{user?.displayName || 'User'}</span>
                  <FiChevronDown className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      {/* Placeholder for user info in dropdown header if needed */}
                    </div>
                    <div className="dropdown-content">
                      <Link to="/profile" className="dropdown-item"><FiUser className="dropdown-icon" /><span>Profile</span></Link>
                      <Link to="/settings" className="dropdown-item"><FiSettings className="dropdown-icon" /><span>Settings</span></Link>
                      <Link to="/help" className="dropdown-item"><FiHelpCircle className="dropdown-icon" /><span>Help Center</span></Link>
                      <Link to="/about" className="dropdown-item"><FiInfo className="dropdown-icon" /><span>About</span></Link>
                    </div>
                    <div className="dropdown-footer">
                      <button onClick={handleLogout} className="logout-btn"><FiLogOut className="dropdown-icon" /><span>Logout</span></button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/signup" className="signup-btn">Sign Up</Link>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <>
              <button className={`mobile-menu-btn ${menuOpen ? 'active' : ''}`} onClick={toggleMobileMenu} aria-label="Toggle menu">
                {menuOpen ? <FiX className="menu-icon" /> : <FiMenu className="menu-icon" />}
              </button>
              {/* --- UPDATED --- */}
              {/* Same logic applied to the mobile sidebar toggle */}
              {onToggleSidebar && (
                <button className="sidebar-toggle-btn mobile-only" onClick={handleToggleSidebar} aria-label="Toggle sidebar">
                  <FiMenu className="toggle-icon" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="mobile-user">
             {/* Placeholder for mobile user info */}
          </div>
          <nav className="mobile-nav">
            <Link to="/home" className={`mobile-nav-link ${isActive('/home') ? 'active' : ''}`}><FiGrid className="mobile-nav-icon" /><span>Dashboard</span></Link>
            <Link to="/profile" className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}><FiUser className="mobile-nav-icon" /><span>Profile</span></Link>
            <Link to="/portfolioHome" className={`mobile-nav-link ${isActive('/portfolioHome') ? 'active' : ''}`}><FiFolder className="mobile-nav-icon" /><span>Portfolio</span></Link>
            <Link to="/resume-builder-home" className={`mobile-nav-link ${isActive('/resume-builder-home') ? 'active' : ''}`}><FiFileText className="mobile-nav-icon" /><span>Resume</span></Link>
            <Link to="/ats/home" className={`mobile-nav-link ${isActive('/ats') ? 'active' : ''}`}><FiTarget className="mobile-nav-icon" /><span>ATS</span></Link>
            <Link to="/settings" className={`mobile-nav-link ${isActive('/settings') ? 'active' : ''}`}><FiSettings className="mobile-nav-icon" /><span>Settings</span></Link>
            <Link to="/help" className={`mobile-nav-link ${isActive('/help') ? 'active' : ''}`}><FiHelpCircle className="mobile-nav-icon" /><span>Help</span></Link>
          </nav>
          <button onClick={logout} className="mobile-logout"><FiLogOut className="mobile-nav-icon" /><span>Logout</span></button>
        </div>
      )}
      
      {menuOpen && <div className="mobile-overlay" onClick={toggleMobileMenu}></div>}
    </header>
  );
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func,
};

export default Navbar;