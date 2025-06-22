import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        {/* Animated background particles */}
        <div className="loader-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
        
        {/* Main loader content */}
        <div className="loader-content">
          <div className="loader-logo">
            <div className="logo-ring logo-ring-1"></div>
            <div className="logo-ring logo-ring-2"></div>
            <div className="logo-ring logo-ring-3"></div>
            <div className="logo-center">
              <span className="logo-text">T</span>
            </div>
          </div>
          
          <div className="loader-text-container">
            <h2 className="loader-title">TrackFolio</h2>
            <div className="loader-progress">
              <div className="progress-bar"></div>
            </div>
            <p className="loader-subtitle">Loading your workspace...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;