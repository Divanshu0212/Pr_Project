// MainLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Navbar from '../Navbar';
import Footer from '../Footer';

const MainLayout = ({ children, user }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D1117] text-[#E5E5E5]">
      <Navbar user={user} />
      <main className="flex-grow px-6 py-4">{children}</main> {/* Added flex-grow back */}
      <Footer />
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
};

export default MainLayout;