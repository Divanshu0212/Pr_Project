import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBriefcase, FiFileText, FiActivity, FiChevronRight, FiHelpCircle, FiMessageSquare, FiPlus, FiTrello, FiUsers, FiPieChart, FiBarChart2, FiSearch } from 'react-icons/fi';
import './Sidebar.css';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const Sidebar = ({ user, isOpen, onClose }) => {
    const location = useLocation();
    const sidebarRef = useRef(null);
    const { portfolioDetails } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);

    // FIXED: Move menuItems to useMemo to prevent recreation on every render
    const menuItems = useMemo(() => [
        {
            title: 'Dashboard',
            path: '/home',
            icon: <FiHome className="sidebar-icon-svg" />
        },
        {
            title: 'Portfolio',
            path: '/portfolio', // Corrected: main portfolio dashboard
            icon: <FiBriefcase className="sidebar-icon-svg" />,
            subItems: [
                { title: 'My Portfolio', path: '/portfolio', icon: <FiHome size={14} /> }, // Direct link to main dashboard
                { title: 'Profile Settings', path: '/portfolio/settings', icon: <FiUsers size={14} /> }, // New: Profile settings page
                { title: 'My Projects', path: '/portfolio/projects', icon: <FiTrello size={14} /> }, // Corrected: All projects list
                { title: 'Add Project', path: '/portfolio/projects/add', icon: <FiPlus size={14} /> }, // Corrected: specific add path
                { title: 'My Skills', path: '/portfolio/skills', icon: <FiBriefcase size={14} /> }, // Corrected: Skills management page
                { title: 'My Certificates', path: '/portfolio/certificates', icon: <FiFileText size={14} /> }, // New: Certificates page
                { title: 'My Experience', path: '/portfolio/experience', icon: <FiActivity size={14} /> }, // New: Experience page
                // { title: 'Team Collaboration', path: '/portfolio/team', icon: <FiUsers size={14} /> }
            ]
        },
        {
            title: 'Resume',
            path: '/resume', // Corrected: main resume builder home
            icon: <FiFileText className="sidebar-icon-svg" />,
            subItems: [
                { title: 'Build Resume', path: '/resume/build', icon: <FiPlus size={14} /> }, // Corrected: primary builder page
                { title: 'My Resumes', path: '/resume/my-resumes', icon: <FiFileText size={14} /> }, // New: My Resumes page
                { title: 'Templates', path: '/resume/templates', icon: <FiTrello size={14} /> } // Corrected: templates gallery
            ]
        },
        {
            title: 'ATS Tracker',
            path: '/ats', // Corrected: main ATS home
            icon: <FiActivity className="sidebar-icon-svg" />,
            subItems: [
                { title: 'ATS Home', path: '/ats', icon: <FiHome size={14} /> }, // Direct link to ATS home
                { title: 'Analysis History', path: '/ats/history', icon: <FiBarChart2 size={14} /> }, // New: Analysis history page
                { title: 'Keyword Tool', path: '/ats/keywords', icon: <FiPieChart size={14} /> } // Corrected: keyword tool
            ]
        }
    ], []); // Empty dependency array since these are static

    const isActive = (path) => {
        // Correctly checks if the current location is exactly the path or starts with the path
        // This is important for highlighting parent menu items when a sub-item is active
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const [expandedItems, setExpandedItems] = useState({});

    const toggleSubMenu = (title) => {
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
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

    // FIXED: Auto-expand sections based on current path
    useEffect(() => {
        const newExpandedState = {};

        menuItems.forEach(item => {
            if (item.subItems) {
                const shouldExpand = isActive(item.path) ||
                    item.subItems.some(subItem => isActive(subItem.path));

                if (shouldExpand) {
                    newExpandedState[item.title] = true;
                }
            }
        });

        setExpandedItems(prev => {
            const hasChanges = Object.keys(newExpandedState).some(
                key => newExpandedState[key] !== prev[key]
            );

            if (hasChanges) {
                return { ...prev, ...newExpandedState };
            }

            return prev;
        });
    }, [location.pathname, menuItems]); // menuItems is now stable, so this dependency is fine

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
                                            // Close sidebar on click on mobile
                                            onClick={onClose}
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
                                                        className={`sidebar-sublink ${location.pathname === subItem.path ? 'active' : ''}`}
                                                        // Close sidebar on click on mobile
                                                        onClick={onClose}
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
                            <Link to="/faqs" className="footer-link" onClick={onClose}>
                                <FiHelpCircle size={16} />
                                <span>Help & FAQs</span>
                            </Link>
                            <Link to="/contact-us" className="footer-link" onClick={onClose}>
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