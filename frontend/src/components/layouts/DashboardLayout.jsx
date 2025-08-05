import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../common/Sidebar';
import Footer from '../Footer';
import './DashboardLayout.css';

const DashboardLayout = ({ children, user }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Portfolio theme management - adds/removes portfolio-theme class based on route
    useEffect(() => {
        const isPortfolioPage = location.pathname.startsWith('/portfolio');
        
        if (isPortfolioPage) {
            document.body.classList.add('portfolio-theme');
        } else {
            document.body.classList.remove('portfolio-theme');
        }

        // Cleanup function to ensure class is removed when component unmounts
        return () => {
            document.body.classList.remove('portfolio-theme');
        };
    }, [location.pathname]);

    const handleResize = useCallback(() => {
        const mobile = window.innerWidth <= 768;
        if (isMobile !== mobile) {
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            }
        }
        if(window.innerWidth > 1024 && !isSidebarOpen) {
            setIsSidebarOpen(true);
        }
    }, [isMobile, isSidebarOpen]);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Scroll animation observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [children]);

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

            <div className={`dashboard-content ${isSidebarOpen && !isMobile ? 'content-shifted' : ''}`}>
                <Navbar user={user} onToggleSidebar={toggleSidebar} />
                <main className="dashboard-main scroll-animate animate-in">
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