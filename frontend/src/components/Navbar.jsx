import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';



import { 
  FiMenu, FiX, FiUser, FiLogOut, FiBell, FiChevronDown, 
  FiInfo, FiHelpCircle, FiTarget,  FiSun, FiMoon,   FiChevronRight, FiChevronLeft  // Add these
} from 'react-icons/fi';
import { 
  HiSparkles, HiLightningBolt,  HiViewGrid,
  HiDocumentText, HiCollection,  HiCog, HiTrendingUp,
  HiMenuAlt3,} from 'react-icons/hi';
import {  RiMenuFoldLine, RiMenuUnfoldLine,} from 'react-icons/ri';


import './Navbar.css';
const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const Navbar = ({ onToggleSidebar, sidebarCollapsed = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { currentUser: user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Enhanced notifications with better icons
  const notifications = [
    { id: 1, type: 'info', message: 'Welcome to TrackFolio!', time: '2 hours ago', read: false, icon: HiSparkles },
    { id: 2, type: 'success', message: 'Resume successfully updated', time: '1 day ago', read: true, icon: HiLightningBolt },
    { id: 3, type: 'warning', message: 'Complete your portfolio to improve visibility', time: '3 days ago', read: false, icon: HiTrendingUp }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768 && menuOpen) setMenuOpen(false); };
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
  const handleToggleSidebar = () => { if (onToggleSidebar) onToggleSidebar(); if (isMobile) setMenuOpen(false); };
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

  // Enhanced sidebar icon logic with better animations and icons
const getSidebarIcon = () => {
  if (sidebarCollapsed) {
    return <FiChevronRight className="sidebar-icon" />;
  } else {
    return <FiChevronLeft className="sidebar-icon" />;
  }
};

  // Alternative icon set for different visual styles
  const getSidebarIconAlt = () => {
    if (sidebarCollapsed) {
      return <RiMenuUnfoldLine className="sidebar-icon" />;
    } else {
      return <RiMenuFoldLine className="sidebar-icon" />;
    }
  };

  // Get appropriate tooltip text
  const getSidebarTooltip = () => {
    return sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar";
  };

  return (
    <motion.header 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-container">
        <div className="navbar-left">
          {isAuthenticated && onToggleSidebar && (
            <motion.button 
              className="sidebar-toggle-btn desktop-only" 
              onClick={handleToggleSidebar} 
              aria-label={getSidebarTooltip()}
              whileHover={{ 
                scale: 1.1, 
                rotate: sidebarCollapsed ? 12 : -12,
              }}
              whileTap={{ scale: 0.95 }}
              title={getSidebarTooltip()}
            >
              <motion.div
                animate={{ 
                  rotate: sidebarCollapsed ? 0 : 0,
                  scale: sidebarCollapsed ? 1.1 : 1
                }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.16, 1, 0.3, 1],
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sidebarCollapsed ? 'collapsed' : 'expanded'}
                    initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getSidebarIcon()}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.button>
          )}
          <Link to="/" className="navbar-brand">
            <motion.span 
              className="brand-text gradient-text"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              TrackFolio
            </motion.span>
          </Link>

           {/* Add the vertical separator */}
            {isAuthenticated && (
              <motion.div 
                className="brand-separator-gradient"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
              )}


          {isAuthenticated && (         
            <motion.div 
              className="page-title-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="page-title animated-text">{getPageTitle()}</h1>
            </motion.div>
          )}
        </div>

        <div className="navbar-middle"></div>

        <div className="navbar-right">
          {isAuthenticated && (
            <motion.div 
              className="navbar-actions"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <motion.button
                onClick={toggleTheme}
                className="theme-toggle-btn "
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                 whileHover={{ scale: 1.15, rotate: 360 }} 
                whileTap={{ scale: 0.85 }}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme === 'dark' ? 'sun' : 'moon'}
                    initial={{ y: -20, opacity: 0, rotate: -180 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="theme-icon-wrapper"
                  >
                    {theme === 'dark' ? (
                      <FiSun className="theme-icon sun-icon" />
                    ) : (
                      <FiMoon className="theme-icon moon-icon" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              <div className="notification-wrapper" ref={notificationsRef}>
                <motion.button 
                  className={`notification-btn  ${notificationsOpen ? 'active' : ''}`} 
                  onClick={toggleNotifications} 
                  aria-label="Notifications"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={notifications.some(n => !n.read) ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FiBell />
                  </motion.div>
                  {notifications.some(n => !n.read) && (
                    <motion.span 
                      className="notification-indicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div 
                      className="notifications-dropdown glass-panel"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="notifications-header">
                        <h3 className="gradient-text">Notifications</h3>
                        <button className="mark-all-read">Mark all read</button>
                      </div>
                      <div className="notifications-list">
                        {notifications.length > 0 ? (
                          notifications.map((notification, index) => (
                            <motion.div 
                              key={notification.id} 
                              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="notification-icon">
                                <notification.icon />
                              </div>
                              <div className="notification-content">
                                <p>{notification.message}</p>
                                <span className="notification-time">{notification.time}</span>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="no-notifications">
                            <HiSparkles className="no-notifications-icon" />
                            <p>No new notifications</p>
                          </div>
                        )}
                      </div>
                      <div className="notifications-footer">
                        <Link to="/notifications">View all notifications</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-profile" ref={userMenuRef}>
                <motion.button 
                  className="user-info-btn " 
                  onClick={toggleUserMenu} 
                  aria-expanded={userMenuOpen}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {user?.profileImage?.url ? (
                    <motion.img 
                      src={user.profileImage.url} 
                      alt="Profile" 
                      className="user-avatar"
                      whileHover={{ scale: 1.1 }}
                    />
                  ) : (
                    <motion.div 
                      className="user-default-avatar gradient-bg"
                      whileHover={{ scale: 1.1 }}
                    >
                      {user?.displayName?.charAt(0) || 'U'}
                    </motion.div>
                  )}
                  <span className="username">{user?.displayName || 'User'}</span>
                  <motion.div
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="dropdown-arrow-wrapper"
                  >
                    <FiChevronDown className="dropdown-arrow" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      className="user-dropdown glass-panel"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <motion.div className="dropdown-header" variants={itemVariants}>
                        <h4 className="gradient-text">{user?.displayName}</h4>
                        <p>{user?.email}</p>
                      </motion.div>
                      <div className="dropdown-content">
                        <motion.div variants={itemVariants}>
                          <Link to="/profile" className="dropdown-item">
                            <FiUser className="dropdown-icon" />
                            <span>Profile</span>
                          </Link>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Link to="/settings" className="dropdown-item">
                            <HiCog className="dropdown-icon" />
                            <span>Settings</span>
                          </Link>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Link to="/help" className="dropdown-item">
                            <FiHelpCircle className="dropdown-icon" />
                            <span>Help Center</span>
                          </Link>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Link to="/about" className="dropdown-item">
                            <FiInfo className="dropdown-icon" />
                            <span>About</span>
                          </Link>
                        </motion.div>
                      </div>
                      <motion.div className="dropdown-footer" variants={itemVariants}>
                        <button onClick={handleLogout} className="logout-btn">
                          <FiLogOut className="dropdown-icon" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                className="auth-buttons"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="login-btn glass-effect">Login</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup" className="signup-btn gradient-bg">Sign Up</Link>
                </motion.div>
                  <motion.button
                onClick={toggleTheme}
                className="theme-toggle-btn "
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                 whileHover={{ scale: 1.15, rotate: 360 }} 
                whileTap={{ scale: 0.85 }}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme === 'dark' ? 'sun' : 'moon'}
                    initial={{ y: -20, opacity: 0, rotate: -180 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="theme-icon-wrapper"
                  >
                    {theme === 'dark' ? (
                      <FiSun className="theme-icon sun-icon" />
                    ) : (
                      <FiMoon className="theme-icon moon-icon" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              </motion.div>
            )}
          </div>

          {isAuthenticated && (
            <>
              <motion.button 
                className={`mobile-menu-btn glass-effect ${menuOpen ? 'active' : ''}`} 
                onClick={toggleMobileMenu} 
                aria-label="Toggle menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={menuOpen ? 'close' : 'menu'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {menuOpen ? <FiX className="menu-icon" /> : <HiMenuAlt3 className="menu-icon" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              {onToggleSidebar && (
                <motion.button 
                  className="sidebar-toggle-btn mobile-only " 
                  onClick={handleToggleSidebar} 
                  aria-label={getSidebarTooltip()}
                  whileHover={{ scale: 1.1, rotate: sidebarCollapsed ? 12 : -12  }}
                  whileTap={{ scale: 0.95 }}
                  title={getSidebarTooltip()}
                >
                  <motion.div
                    animate={{ rotate: sidebarCollapsed ? 5 : -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getSidebarIconAlt()}
                  </motion.div>
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              className="mobile-menu glass-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div 
                className="mobile-user"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {user?.profileImage?.url ? (
                  <img src={user.profileImage.url} alt="Profile" className="mobile-avatar" />
                ) : (
                  <div className="mobile-default-avatar gradient-bg">{user?.displayName?.charAt(0) || 'U'}</div>
                )}
                <span className="mobile-username gradient-text">{user?.displayName}</span>
              </motion.div>
              <nav className="mobile-nav">
                {[
                  { to: '/home', icon: HiViewGrid, label: 'Dashboard', delay: 0.15 },
                  { to: '/profile', icon: FiUser, label: 'Profile', delay: 0.2 },
                  { to: '/settings', icon: HiCog, label: 'Settings', delay: 0.4 },
                  { to: '/help', icon: FiHelpCircle, label: 'Help', delay: 0.45 }
                ].map((item) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.delay }}
                  >
                    <Link 
                      to={item.to} 
                      className={`mobile-nav-link ${isActive(item.to) ? 'active gradient-bg' : ''}`}
                    >
                      <item.icon className="mobile-nav-icon" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <motion.button 
                onClick={handleLogout} 
                className="mobile-logout"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut className="mobile-nav-icon" />
                <span>Logout</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {menuOpen && (
        <motion.div 
          className="mobile-overlay" 
          onClick={toggleMobileMenu}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.header>
  );
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func,
  sidebarCollapsed: PropTypes.bool,
};

export default Navbar;