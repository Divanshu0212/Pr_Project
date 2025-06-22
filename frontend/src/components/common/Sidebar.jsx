import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBriefcase, FiFileText, FiActivity, FiChevronRight, FiHelpCircle, FiMessageSquare, FiPlus, FiTrello, FiUsers, FiPieChart, FiBarChart2, FiSearch } from 'react-icons/fi';
import './Sidebar.css';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext

const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const { portfolioDetails } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); // Consume the theme context

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/home',
      icon: <FiHome className="sidebar-icon-svg" />
    },
    {
      title: 'Portfolio',
      path: '/portfolioHome',
      icon: <FiBriefcase className="sidebar-icon-svg" />,
      subItems: [
        { title: 'Add Skills', path: '/portfolio/skills', icon: <FiPlus size={14} /> },
        { title: 'Add Project', path: '/portfolio/add', icon: <FiPlus size={14} /> },
        { title: 'Project Tracking', path: '/portfolio/tracking', icon: <FiTrello size={14} /> },
        { title: 'Team Collaboration', path: '/portfolio/team', icon: <FiUsers size={14} /> }
      ]
    },
    {
      title: 'Resume',
      path: '/resume-builder-home',
      icon: <FiFileText className="sidebar-icon-svg" />,
      subItems: [
        { title: 'Create Resume', path: '/resume-builder', icon: <FiPlus size={14} /> },
        { title: 'Templates', path: '/resume/templates', icon: <FiFileText size={14} /> }
      ]
    },
    {
      title: 'ATS Tracker',
      path: '/ats/home',
      icon: <FiActivity className="sidebar-icon-svg" />,
      subItems: [
        { title: 'ATS Home', path: '/ats/home', icon: <FiHome size={14} /> },
        { title: 'Tracker', path: '/ats/tracker', icon: <FiTrello size={14} /> },
        { title: 'Analysis', path: '/ats/analysis', icon: <FiPieChart size={14} /> },
        { title: 'Results', path: '/ats/results', icon: <FiBarChart2 size={14} /> },
        { title: 'Keywords', path: '/ats/keywords', icon: <FiSearch size={14} /> },
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const [expandedItems, setExpandedItems] = useState({});

  const toggleSubMenu = (title) => {
    setExpandedItems({
      ...expandedItems,
      [title]: !expandedItems[title]
    });
  };

  // Click outside handler to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && onClose && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Determine if any paths in a section are active to auto-expand that section
  useEffect(() => {
    const newExpandedState = {};

    menuItems.forEach(item => {
      if (item.subItems) {
        // Auto-expand if current path is in this section
        const shouldExpand = isActive(item.path) ||
          item.subItems.some(subItem => isActive(subItem.path));

        if (shouldExpand) {
          newExpandedState[item.title] = true;
        }
      }
    });

    // Only update if we have new sections to expand
    if (Object.keys(newExpandedState).length > 0) {
      setExpandedItems(prev => ({ ...prev, ...newExpandedState }));
    }
  }, [location.pathname, menuItems]); // Added menuItems to dependency array for completeness

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && onClose && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <aside 
        ref={sidebarRef}
        // Apply the 'dark' or 'light' class based on the theme context
        className={`sidebar ${isOpen ? 'open' : ''} ${theme}`} 
        aria-label="Main navigation"
      >
        <div className="sidebar-container">
          {/* User Profile Section */}
          <div className="sidebar-header">
            <div className="sidebar-user">
              {user?.profileImage?.url ? (
                <img
                  src={user.profileImage.url}
                  alt="Profile"
                  className="sidebar-avatar"
                />
              ) : (
                <div className="sidebar-default-avatar">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="sidebar-user-info">
                <h3 className="sidebar-username">
                  {user?.displayName || 'Welcome'}
                </h3>
                <p className="sidebar-role">{portfolioDetails?.jobTitle || 'Developer'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-content">
            <ul className="sidebar-menu">
              {menuItems.map((item) => (
                <li key={item.path} className="sidebar-item">
                  <div className="sidebar-link-container">
                    <Link
                      to={item.path}
                      className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <span className="sidebar-icon">{item.icon}</span>
                      <span className="sidebar-link-text">{item.title}</span>
                    </Link>

                    {item.subItems && (
                      <button
                        className={`sidebar-toggle ${expandedItems[item.title] ? 'expanded' : ''}`}
                        onClick={() => toggleSubMenu(item.title)}
                        aria-label={`Toggle ${item.title} submenu`}
                        aria-expanded={expandedItems[item.title] || false}
                      >
                        <FiChevronRight className="toggle-icon" />
                      </button>
                    )}
                  </div>

                  {item.subItems && (
                    <ul 
                      className={`sidebar-submenu ${expandedItems[item.title] ? 'expanded' : ''}`}
                      aria-hidden={!expandedItems[item.title]}
                    >
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path} className="sidebar-subitem">
                          <Link
                            to={subItem.path}
                            className={`sidebar-sublink ${isActive(subItem.path) ? 'active' : ''}`}
                          >
                            <span className="subitem-icon">{subItem.icon}</span>
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="sidebar-footer">
            <div className="sidebar-footer-links">
              <Link to="/faqs" className="footer-link">
                <FiHelpCircle size={16} />
                <span>Help & FAQs</span>
              </Link>
              <Link to="/contact-us" className="footer-link">
                <FiMessageSquare size={16} />
                <span>Contact</span>
              </Link>
            </div>
            <div className="sidebar-copyright">
              <p>TrackFolio © 2025</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  user: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func
};

export default Sidebar;