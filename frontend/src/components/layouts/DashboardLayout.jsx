import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Navbar from '../Navbar';
import Sidebar from '../common/Sidebar';
import Footer from '../Footer';
import './DashboardLayout.css';

const DashboardLayout = ({ children, user }) => {
    // Initialize sidebar state based on screen size
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            // Auto-open sidebar on desktop, close on mobile by default
            if (!mobile && !isSidebarOpen) {
                setIsSidebarOpen(true);
            } else if (mobile && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };

        // Initialize on component mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={isMobile ? toggleSidebar : undefined}
            />

            <div
                className={`dashboard-content ${isSidebarOpen && !isMobile ? 'content-shifted' : ''}`}
            >
                <Navbar user={user} onToggleSidebar={toggleSidebar} />

                <main className="dashboard-main">
                    <div className="dashboard-container">
                        {children}
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