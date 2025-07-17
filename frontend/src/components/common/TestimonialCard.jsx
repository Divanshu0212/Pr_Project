import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import './TestimonialCard.css';
import defaultTeamImage from '../../assets/img/auth_Lady_img.jpg';

const TestimonialCard = ({ testimonial, animationOrder = 0 }) => {
  const { name, role, testimonial: testimonialText } = testimonial;
  const { theme } = useTheme();
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  return (
    <div 
      ref={cardRef}
      className={`testimonial-card ${theme} ${isVisible ? 'animate-in' : ''}`}
      style={{ '--animation-order': animationOrder }}
    >
      <div className="testimonial-gradient-border">
        <div className="testimonial-content-wrapper">
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