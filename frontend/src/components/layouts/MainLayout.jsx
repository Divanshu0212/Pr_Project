// MainLayout.jsx - Enhanced
import React from 'react';
import PropTypes from 'prop-types';
import Navbar from '../Navbar';
import Footer from '../Footer';
import './MainLayout.css'; // Create this file for the styles

const MainLayout = ({ children, user }) => {
  return (
    <div className="main-layout min-h-screen flex flex-col bg-[#0D1117] text-[#E5E5E5]">
      <Navbar user={user} />
      <main className="main-content flex-grow px-4 sm:px-6 py-4">
        <div className="main-container max-w-6xl mx-auto w-full">
          <div className="content-animation">
            {children}
          </div>
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