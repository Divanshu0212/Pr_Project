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
    const [contentShifted, setContentShifted] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            // Auto-open sidebar on desktop, but keep state on mobile
            if (!mobile) {
                setIsSidebarOpen(true);
                setContentShifted(true);
            } else {
                setContentShifted(false);
            }
        };

        // Initialize on component mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to handle content shift when sidebar opens/closes
    useEffect(() => {
        if (!isMobile) {
            setContentShifted(true);
        } else {
            setContentShifted(isSidebarOpen);
        }
    }, [isSidebarOpen, isMobile]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={isMobile ? toggleSidebar : undefined}
            />

            <div
                className={`dashboard-content ${contentShifted ? 'content-shifted' : ''}`}
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