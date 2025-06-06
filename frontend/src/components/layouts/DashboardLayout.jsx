import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Navbar from '../Navbar';
import Sidebar from '../common/Sidebar';
import Footer from '../Footer';
import './DashboardLayout.css';

const DashboardLayout = ({ children, user }) => {
    // Initialize sidebar state based on screen size
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Memoize the resize handler to prevent unnecessary recreations
    const handleResize = useCallback(() => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
    }, [isSidebarOpen]);

    useEffect(() => {
        // Initialize on component mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    const toggleSidebar = () => {
        setIsTransitioning(true);
        setIsSidebarOpen(prev => !prev);
        
        // Reset transitioning state after animation completes
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300); // Match transition time from CSS
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={isMobile ? toggleSidebar : undefined}
            />

            <div
                className={`dashboard-content 
                    ${isSidebarOpen && !isMobile ? 'content-shifted' : ''} 
                    ${isTransitioning ? 'is-transitioning' : ''}`}
            >
                <Navbar user={user} onToggleSidebar={toggleSidebar} />

                <main className="dashboard-main">
                    <div className="dashboard-container">
                        <div className="content-wrapper">
                            {children}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

DashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
    user: PropTypes.object,
};

export default DashboardLayout;