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
        rootMargin: '50px 0px -100px 0px',
      }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      if (divRef.current) {
        observer.unobserve(divRef.current);
      }
    };
  }, [isVisible, disableAnimation]);

  // Enhanced mouse move handler with smoother spotlight tracking
  const handleMouseMove = (e) => {
    if (!divRef.current || !enableSpotlight) return;
    
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Smooth position updates using requestAnimationFrame
    requestAnimationFrame(() => {
      setPosition({ x, y });
    });
  };

  const handleMouseEnter = () => { 
    if (enableSpotlight) {
      setOpacity(1);
    }
  };

  const handleMouseLeave = () => { 
    if (enableSpotlight) {
      setOpacity(0);
    }
  };

  // Enhanced spotlight effect with dynamic colors
  const spotlightStyle = enableSpotlight ? {
    opacity,
    background: `radial-gradient(
      800px circle at ${position.x}px ${position.y}px, 
      rgb(var(--color-accent-primary) / 0.15) 0%,
      rgb(var(--color-accent-secondary) / 0.08) 40%,
      transparent 70%
    )`,
    transition: 'opacity 0.3s ease-out',
  } : {};

  // Enhanced motion variants with better easing
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60, 
      scale: 0.9,
      rotateX: 10,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }
    }
  };

  // Enhanced hover animations
  const hoverVariants = {
    hover: {
      y: -12,
      scale: 1.03,
      rotateX: -2,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const CardContent = (
    <>
      {enableSpotlight && (
        <div 
          className="card-spotlight" 
          style={spotlightStyle}
        />
      )}
      
      <div className="card-noise" />
      
      <div className="card-content">
        {post ? (
          <Link 
            to={`/posts/${post.id}`} 
            className="card-post-link"
            onClick={onClick}
          >
            {post.image && (
              <motion.img 
                src={post.image} 
                alt={post.title}
                className="card-post-img"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            )}
            
            <div className="card-post-content">
              <motion.h3 
                className="card-post-title"
                whileHover={{ x: 6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {post.title}
              </motion.h3>
              
              <motion.p 
                className="card-post-desc"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {post.excerpt || post.description}
              </motion.p>
              
              <motion.span 
                className="card-post-button"
                whileHover={{ x: 8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                Read More
              </motion.span>
            </div>
          </Link>
        ) : (
          <div className="p-6">
            {children}
          </div>
        )}
      </div>
    </>
  );

  // Conditional wrapper based on animation preference
  if (disableAnimation) {
    return (
      <div
        ref={divRef}
        className={`card-wrapper ${onClick ? 'card-clickable' : ''} ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{ opacity: 1, transform: 'none' }}
      >
        {CardContent}
      </div>
    );
  }

  return (
    <motion.div
      ref={divRef}
      className={`card-wrapper ${onClick ? 'card-clickable' : ''} ${className} ${isVisible ? 'animate-in' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
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