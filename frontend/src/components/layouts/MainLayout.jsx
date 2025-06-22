import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Navbar from '../Navbar';
import Footer from '../Footer';
import './MainLayout.css';

const MainLayout = ({ children, user }) => {
  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, index * 100); // Stagger the animations
          }
        });
      },
      { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
      }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [children]);

  return (
    <div className="main-layout">
      <Navbar user={user} />
      <main className="main-content">
        <div className="main-container scroll-animate">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
};

export default MainLayout;