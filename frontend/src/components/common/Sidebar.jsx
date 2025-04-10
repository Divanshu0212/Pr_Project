import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();
  
  const menuItems = [
    { 
      title: 'Dashboard', 
      path: '/home',
      icon: '📊'
    },
    { 
      title: 'Portfolio', 
      path: '/portfolioHome',
      icon: '📁',
      subItems: [
        { title: 'Add Project', path: '/portfolio/add' },
        { title: 'Project Tracking', path: '/portfolio/tracking' },
        { title: 'Team Collaboration', path: '/portfolio/team' }
      ]
    },
    {
      title: 'Resume', 
      path: '/resume-builder-home',
      icon: '📝',
      subItems: [
        { title: 'Create Resume', path: '/resume/create' },
        { title: 'Templates', path: '/resume/templates' }
      ]
    },
    {
      title: 'ATS Tracker', 
      path: '/ats',
      icon: '📈',
      subItems: [
        { title: 'ATS Home', path: '/ats/home' }
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const [expandedItems, setExpandedItems] = React.useState({});

  const toggleSubMenu = (title) => {
    setExpandedItems({
      ...expandedItems,
      [title]: !expandedItems[title]
    });
  };

  // Determine if any paths in a section are active to auto-expand that section
  React.useEffect(() => {
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
      setExpandedItems(prev => ({...prev, ...newExpandedState}));
    }
  }, [location.pathname]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && onClose && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        ></div>
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-container">
          {/* User Profile Section */}
          <div className="sidebar-header">
            <div className="sidebar-user">
              {user?.photos?.[0]?.value ? (
                <img 
                  src={user.photos[0].value} 
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
                <p className="sidebar-role">Developer</p>
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
                      >
                        <span className="toggle-icon"></span>
                      </button>
                    )}
                  </div>
                  
                  {item.subItems && (
                    <ul className={`sidebar-submenu ${expandedItems[item.title] ? 'expanded' : ''}`}>
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path} className="sidebar-subitem">
                          <Link 
                            to={subItem.path}
                            className={`sidebar-sublink ${isActive(subItem.path) ? 'active' : ''}`}
                          >
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
              <Link to="/faqs" className="footer-link">Help & FAQs</Link>
              <Link to="/contact-us" className="footer-link">Contact</Link>
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