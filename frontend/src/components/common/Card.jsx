import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({
  post,
  children,
  className = '',
  onClick = null,
  enableSpotlight = true,
  disableAnimation = false,
}) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (disableAnimation) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
      }
    );

    const currentRef = divRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible, disableAnimation]);

  // Mouse move handler for spotlight effect
  const handleMouseMove = (e) => {
    if (!divRef.current || !enableSpotlight) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => { 
    if (enableSpotlight) setOpacity(1);
  };

  const handleMouseLeave = () => { 
    if (enableSpotlight) setOpacity(0);
  };

  // Spotlight style with theme-aware colors
  const spotlightStyle = {
    opacity,
    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, 
      rgba(var(--color-accent-primary), 0.1),
      transparent 80%
    )`,
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };
  
  const CardContent = (
    <>
      {enableSpotlight && <div className="card-spotlight" style={spotlightStyle} />}
      <div className="card-noise" />
      <div className="card-content">
        {post ? (
          <Link to={`/posts/${post.id}`} className="card-link">
            {post.image && (
              <img src={post.image} alt={post.title} className="card-image" />
            )}
            <div className="card-text-content">
              <h3 className="card-title">{post.title}</h3>
              <p className="card-description">{post.excerpt || post.description}</p>
              <span className="card-read-more">Read More →</span>
            </div>
          </Link>
        ) : (
          children
        )}
      </div>
    </>
  );

  return (
    <motion.div
      ref={divRef}
      // Added .panel class for consistent theming!
      className={`card panel ${onClick ? 'is-clickable' : ''} ${className}`}
      variants={cardVariants}
      initial={disableAnimation ? "visible" : "hidden"}
      animate={isVisible || disableAnimation ? "visible" : "hidden"}
      whileHover={onClick ? "hover" : ""}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {CardContent}
    </motion.div>
  );
};

Card.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
  }),
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  enableSpotlight: PropTypes.bool,
  disableAnimation: PropTypes.bool,
};

export default Card;