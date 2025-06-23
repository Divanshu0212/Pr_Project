import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import './TestimonialCard.css';
import defaultTeamImage from '../../assets/img/auth_Lady_img.jpg'; // Assuming path is correct

const TestimonialCard = ({ testimonial, animationOrder = 0 }) => {
  const { name, role, testimonial: testimonialText } = testimonial;
  const cardRef = useRef(null);

  // NOTE: Intersection Observer is now handled by the parent component or CSS.
  // The 'animationOrder' prop is used for CSS animation-delay.
  
  return (
    <div 
      ref={cardRef}
      className="testimonial-card panel"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="testimonial-header">
        <div className="quote-icon-wrapper">
          <FaQuoteLeft className="quote-icon" />
        </div>
        <div className="rating-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="star-icon" />
          ))}
        </div>
      </div>
      
      <div className="testimonial-content">
        <p className="testimonial-text">
          {testimonialText}
        </p>
      </div>
      
      <div className="testimonial-footer">
        <div className="author-image-wrapper">
          <img src={defaultTeamImage} alt={name} className="author-image" />
          <div className="author-image-glow"></div>
        </div>
        <div className="author-info">
          <h4 className="author-name">{name}</h4>
          <p className="author-role">{role}</p>
        </div>
      </div>
    </div>
  );
};

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    testimonial: PropTypes.string.isRequired,
  }).isRequired,
  animationOrder: PropTypes.number,
};

export default TestimonialCard;