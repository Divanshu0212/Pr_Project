import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import './TestimonialCard.css';
import defaultTeamImage from '../../assets/img/auth_Lady_img.jpg';

const TestimonialCard = ({ testimonial, animationOrder = 0 }) => {
  const { name, role, testimonial: testimonialText } = testimonial;
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, animationOrder * 150);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [animationOrder]);

  return (
    <div 
      ref={cardRef}
      className={`testimonial-card ${isVisible ? 'visible' : ''}`}
      style={{ animationDelay: `${animationOrder * 0.15}s` }}
    >
      <div className="card-gradient-bg"></div>
      
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
          <span className="quote-mark">"</span>
          {testimonialText}
          <span className="quote-mark">"</span>
        </p>
      </div>
      
      <div className="testimonial-footer">
        <div className="author-section">
          <div className="author-image-wrapper">
            <img src={defaultTeamImage} alt={name} className="author-image" />
            <div className="image-glow"></div>
          </div>
          
          <div className="author-info">
            <h4 className="author-name">{name}</h4>
            <p className="author-role">{role}</p>
          </div>
        </div>
      </div>
      
      <div className="card-shine"></div>
    </div>
  );
};

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    testimonial: PropTypes.string.isRequired,
  }).isRequired,
  animationOrder: PropTypes.number,
};

export default TestimonialCard;