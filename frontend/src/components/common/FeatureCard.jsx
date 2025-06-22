import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './FeatureCard.css';

const FeatureCard = ({ feature, animationOrder = 0 }) => {
  const { title, description, icon, link, isSpecial } = feature;

  return (
    <div
      className={`feature-card ${isSpecial ? 'feature-card-special' : ''}`}
      style={{ 
        animationDelay: `${animationOrder * 0.15}s`,
        opacity: 0 
      }}
    >
      <div className="feature-card-glow"></div>
      {icon && (
        <div className="feature-icon-wrapper">
          {icon}
        </div>
      )}
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
        {link && (
          <Link to={link} className="feature-link">
            <span>Learn More</span>
            <svg className="feature-link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 8L8 14M14 8H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

FeatureCard.propTypes = {
  feature: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.node.isRequired,
    icon: PropTypes.node,
    link: PropTypes.string,
    isSpecial: PropTypes.bool,
  }).isRequired,
  animationOrder: PropTypes.number,
};

export default FeatureCard;