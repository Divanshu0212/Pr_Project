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
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px',
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

  // Enhanced mouse move handler for spotlight effect
  const handleMouseMove = (e) => {
    if (!divRef.current || !enableSpotlight) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    requestAnimationFrame(() => {
      setPosition({ x, y });
    });
  };

  const handleMouseEnter = () => { 
    if (enableSpotlight) setOpacity(1);
  };

  const handleMouseLeave = () => { 
    if (enableSpotlight) setOpacity(0);
  };

  // Spotlight style - now fully CSS variable driven
  const spotlightStyle = {
    opacity,
    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, 
      var(--card-spotlight-primary),
      var(--card-spotlight-secondary),
      transparent 70%
    )`,
    transition: 'opacity 0.3s ease',
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -10,
      scale: 1.02,
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      }
    }
  };

  const glowVariants = {
    hover: {
      // Box shadow is now handled by CSS classes
      transition: { duration: 0.3 }
    }
  };
  
  const CardContent = (
    <>
      {enableSpotlight && <div className="card-spotlight" style={spotlightStyle} />}
      <div className="card-noise" />
      <div className="card-content">
        {post ? (
          <Link to={`/posts/${post.id}`} className="card-link">
            <motion.div 
              className="card-image-wrapper"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              {post.image && (
                <img src={post.image} alt={post.title} className="card-image" />
              )}
              <div className="card-overlay" />
            </motion.div>
            <div className="card-text-content">
              <motion.h3 
                className="card-title gradient-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {post.title}
              </motion.h3>
              <motion.p 
                className="card-description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {post.excerpt || post.description}
              </motion.p>
              <motion.span 
                className="card-read-more"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ x: 8 }}
              >
                Read More →
              </motion.span>
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
      className={`card panel ${onClick ? 'is-clickable' : ''} ${className}`.trim()}
      variants={cardVariants}
      initial={disableAnimation ? "visible" : "hidden"}
      animate={isVisible || disableAnimation ? "visible" : "hidden"}
      whileHover={onClick ? { ...hoverVariants.hover, ...glowVariants.hover } : glowVariants.hover}
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