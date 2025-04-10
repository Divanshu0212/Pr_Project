import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Card.css';

const FeatureCard = ({ feature }) => {
  const { title, description, icon, image, link, isSpecial } = feature;

  return (
    <div className={`feature-card ${isSpecial ? 'special-feature-card' : ''}`}>
      {icon && (
        <div className="feature-icon">
          {icon}
        </div>
      )}
      <div className={`feature-content ${isSpecial ? 'special-feature-content' : ''}`}>
        <h3>{title}</h3>
        {typeof description === 'string' ? (
          <p>{description}</p>
        ) : (
          // Check if description is a React element (JSX)
          React.isValidElement(description) ? (
            description
          ) : (
            // Fallback if description is neither a string nor a React element
            <p>Error: Invalid description format.</p>
          )
        )}
        {image && (
          <div className="feature-img">
            <img src={image} alt={`${title} Preview`} />
          </div>
        )}
        {link && (
          <Link to={link} className="feature-link">
            Learn More
          </Link>
        )}
      </div>
    </div>
  );
};

FeatureCard.propTypes = {
  feature: PropTypes.shape({
    title: PropTypes.string.isRequired,
    // Update description prop type to allow string or React node
    description: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node, // Allows React elements (JSX)
    ]).isRequired,
    icon: PropTypes.node,
    image: PropTypes.string,
    link: PropTypes.string,
    isSpecial: PropTypes.bool,
    animationOrder: PropTypes.number
  }).isRequired,
};

export default FeatureCard;