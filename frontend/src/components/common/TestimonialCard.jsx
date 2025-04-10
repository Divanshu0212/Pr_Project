// src/components/common/TestimonialCard.jsx

import React from 'react';
import PropTypes from 'prop-types';
import './Card.css'; // Assuming you have this
import defaultTeamImage from '../../assets/img/auth_Lady_img.jpg'; // Import the specific image

const TestimonialCard = ({ testimonial }) => {
  const { name, role, testimonial: testimonialText } = testimonial;

  return (
    <div className="testimonial-card">
      <div className="testimonial-content">
        <p>{testimonialText}</p>
      </div>
      <div className="testimonial-author">
        <img src={defaultTeamImage} alt={name} /> {/* Use the imported image for all */}
        <div>
          <h4>{name}</h4>
          <p>{role}</p>
        </div>
      </div>
    </div>
  );
};

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    // We are no longer using the 'image' property for the src for now
    testimonial: PropTypes.string.isRequired,
  }).isRequired,
};

export default TestimonialCard;