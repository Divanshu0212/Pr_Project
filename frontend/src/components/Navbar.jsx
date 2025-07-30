import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// 1. Update imports - Replace the existing icon imports with these better ones
import {
  FiMenu, FiX, FiUser, FiLogOut, FiBell, FiChevronDown,
  FiInfo, FiHelpCircle, FiTarget, FiSun, FiMoon, FiChevronRight,
  FiChevronLeft, FiHome, FiSettings, FiSearch,
  FiArrowLeft,
  FiArrowRight
} from 'react-icons/fi';

import {
  HiSparkles, HiLightningBolt, HiViewGrid, HiDocumentText,
  HiCollection, HiCog, HiTrendingUp, HiMenuAlt3, HiOutlineHome,
  HiOutlineCog, HiOutlineUser, HiOutlineQuestionMarkCircle
} from 'react-icons/hi';

import {
  RiMenuFoldLine, RiMenuUnfoldLine, RiHomeLine, RiHome3Line
} from 'react-icons/ri';


import './Navbar.css';
import SummaryApi from '../config';

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

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  // Update the handleSearch function in Navbar.jsx
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SummaryApi.portfolio.search.url}?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });


      if (response.data.success && Array.isArray(response.data.users)) {
        const validUsers = response.data.users.filter(user => user.username);
        setSearchResults(validUsers);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add this to your Navbar component to verify the search results
  useEffect(() => {
  }, [searchResults]);

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

  // 2. Update the mobile nav items array to include Home logic
  const getMobileNavItems = () => {
    const baseItems = [
      { to: '/home', icon: HiOutlineHome, label: 'Dashboard', delay: 0.15 },
      { to: '/profile', icon: HiOutlineUser, label: 'Profile', delay: 0.2 },
      { to: '/settings', icon: HiOutlineCog, label: 'Settings', delay: 0.35 },
      { to: '/help', icon: HiOutlineQuestionMarkCircle, label: 'Help', delay: 0.4 }
    ];

    // Add Home link if user is authenticated
    if (isAuthenticated) {
      return [
        { to: '/', icon: RiHome3Line, label: 'Home', delay: 0.1 },
        ...baseItems
      ];
    }

    return baseItems;
  };

  // 3. Update the dropdown items to include Home
  const getDropdownItems = () => {
    const baseItems = [
      { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
      { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
      { to: '/help', icon: HiOutlineQuestionMarkCircle, label: 'Help Center' },
      { to: '/about', icon: FiInfo, label: 'About' }
    ];

    // Add Home link if user is authenticated
    if (isAuthenticated) {
      return [
        { to: '/home', icon: RiHome3Line, label: 'Home' },
        ...baseItems
      ];
    }

    return baseItems;
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
          {/* 4. Replace the sidebar toggle button section with better responsiveness */}
          {isAuthenticated && onToggleSidebar && (
            <motion.button
              className="sidebar-toggle-btn desktop-only"
              onClick={handleToggleSidebar}
              aria-label={getSidebarTooltip()}
              whileHover={{
                scale: 1.1,
                rotate: sidebarCollapsed ? 8 : -8,
              }}
              whileTap={{ scale: 0.9 }}
              title={getSidebarTooltip()}
            >
              <motion.div
                animate={{
                  rotate: sidebarCollapsed ? 0 : 180,
                  scale: sidebarCollapsed ? 1 : 1.1
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeInOut"
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sidebarCollapsed ? 'collapsed' : 'expanded'}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {sidebarCollapsed ? (
                      <FiChevronRight className="sidebar-icon" />
                    ) : (
                      <FiChevronLeft className="sidebar-icon" />
                    )}
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
            <motion.form
              onSubmit={handleSearch}
              className="!rounded-lg search-container"
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: searchOpen ? 1 : 0,
                width: searchOpen ? 200 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              {searchOpen && (
                <motion.div className="!rounded-full search-input-wrapper">
                  <motion.input
                    type="text"
                    className='!rounded-lg'
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim() === '') {
                        setSearchResults([]);
                      }
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    autoFocus
                  />
                  <button type="submit" className="ml-4 search-submit-btn">
                    <FiArrowRight />
                  </button>
                </motion.div>
              )}
            </motion.form>
          )}
          {searchOpen && (
            <motion.div
              className="search-results-dropdown glass-panel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: isMobile ? 0 : 'auto',
                left: isMobile ? 0 : 'auto',
                width: isMobile ? '100%' : '300px',
                zIndex: 1000
              }}
            >
              {searchLoading ? (
                <div className="search-loading">
                  <div className="spinner"></div>
                  <span>Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="search-results-header">
                    <h4>Search Results</h4>
                    <span>{searchResults.length} users found</span>
                  </div>
                  <div className="search-results-list">
                    {searchResults.map((user) => {
                      if (!user.username) return null; // Skip users without usernames

                      return (
                        <Link
                          key={user._id}
                          to={`/portfolio/public/${user.username}`}
                          className="search-result-item"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                        >
                          <div className="result-avatar">
                            {user.profileImage?.url ? (
                              <img
                                src={user.profileImage.url}
                                alt={user.displayName}
                                onError={(e) => {
                                  e.target.src = '/default-avatar.png';
                                }}
                              />
                            ) : (
                              <div className="default-avatar">
                                {user.displayName?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="result-info">
                            <h5>{user.displayName || 'User'}</h5>
                            <p>{user.portfolioDetails?.jobTitle || 'No title'}</p>
                            {user.portfolioDetails?.skills && (
                              <div className="result-skills">
                                {user.portfolioDetails.skills.slice(0, 3).map((skill, i) => (
                                  <span key={i} className="skill-tag">{skill}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                </>
              ) : (
                <div className="no-results">
                  {searchQuery.trim() && !searchLoading ? 'No users found' : 'Search for users by name, title or skills'}
                </div>
              )}
            </motion.div>
          )}
          <motion.button
            className="search-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiSearch />
          </motion.button>
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
                whileHover={{
                  scale: 1.15,
                  rotate: [0, 10, -10, 0], // Changed from 360 to a subtle wobble
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.85 }}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme === 'dark' ? 'sun' : 'moon'}
                    initial={{ y: -30, opacity: 0, rotate: -180, scale: 0.5 }} // Added scale initial
                    animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }} // Added scale animate
                    exit={{ y: 30, opacity: 0, rotate: 180, scale: 0.5 }} // Added scale exit
                    transition={{
                      duration: 0.35,
                      ease: "easeInOut"
                    }}
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
                {/* 8. Enhanced notification button with better animation */}
                <motion.button
                  className={`notification-btn ${notificationsOpen ? 'active' : ''}`}
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                  whileHover={{
                    scale: 1.1,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={notifications.some(n => !n.read) ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, -10, 10, 0] // Added rotation for bell effect
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <FiBell />
                  </motion.div>
                  {notifications.some(n => !n.read) && (
                    <motion.span
                      className="notification-indicator"
                      initial={{ scale: 0, opacity: 0 }} // Added opacity initial
                      animate={{
                        scale: [0, 1.2, 1], // Bounce animation
                        opacity: 1
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut"
                      }}
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
                      {/* 5. Update the dropdown content rendering for better responsiveness */}
                      <div className="dropdown-content">
                        {getDropdownItems().map((item) => (
                          <motion.div key={item.to} variants={itemVariants}>
                            <Link to={item.to} className="dropdown-item">
                              <item.icon className="dropdown-icon" />
                              <span>{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
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
                  whileHover={{ scale: 1.15, rotate: [0, 10, -10, 0] }} // Changed from 360 to a subtle wobble
                  whileTap={{ scale: 0.85 }}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={theme === 'dark' ? 'sun' : 'moon'}
                      initial={{ y: -30, opacity: 0, rotate: -180, scale: 0.5 }} // Added scale initial
                      animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }} // Added scale animate
                      exit={{ y: 30, opacity: 0, rotate: 180, scale: 0.5 }} // Added scale exit
                      transition={{
                        duration: 0.35,
                        ease: "easeInOut"
                      }}
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
                // 7. Enhanced mobile sidebar toggle with better icons
                <motion.button
                  className="sidebar-toggle-btn mobile-only"
                  onClick={handleToggleSidebar}
                  aria-label={getSidebarTooltip()}
                  whileHover={{
                    scale: 1.1,
                    rotate: sidebarCollapsed ? 12 : -12
                  }}
                  whileTap={{ scale: 0.9 }}
                  title={getSidebarTooltip()}
                >
                  <motion.div
                    animate={{
                      rotate: sidebarCollapsed ? 0 : 180, // Rotates the container
                      scale: 1
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={sidebarCollapsed ? 'mobile-collapsed' : 'mobile-expanded'}
                        initial={{ opacity: 0, rotate: -90 }} // Initial state for icon
                        animate={{ opacity: 1, rotate: 0 }} // Animate to visible
                        exit={{ opacity: 0, rotate: 90 }} // Exit state for icon
                        transition={{ duration: 0.15 }}
                      >
                        {sidebarCollapsed ? (
                          <RiMenuUnfoldLine className="sidebar-icon" />
                        ) : (
                          <RiMenuFoldLine className="sidebar-icon" />
                        )}
                      </motion.div>
                    </AnimatePresence>
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
              {/* 6. Update mobile navigation rendering */}
              <nav className="mobile-nav">
                {getMobileNavItems().map((item) => (
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
