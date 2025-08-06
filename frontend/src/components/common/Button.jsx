import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon = null,
  enableShine = true,
  isLoading = false,
}) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
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

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current);
      }
    };
  }, [isVisible]);

  // Enhanced mouse move handler with smoother tracking
  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled || !enableShine) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    requestAnimationFrame(() => {
      setPosition({ x, y });
    });
  };

  const handleMouseEnter = () => { 
    if (!disabled && enableShine) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => { 
    if (enableShine) {
      setIsHovered(false);
    }
  };

  // Shine effect style - now fully CSS variable driven
  const shineStyle = enableShine && isHovered ? {
    background: `radial-gradient(circle at ${position.x}px ${position.y}px, 
      var(--button-shine-primary) 0%, 
      var(--button-shine-secondary) 30%, 
      transparent 70%)`,
    transition: 'background 0.15s ease-out',
  } : {};

  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.9 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1] 
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -3,
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
      y: 0,
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const iconVariants = {
    hover: {
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      className={`
        button
        button-${variant}
        button-${size}
        ${fullWidth ? 'button-full-width' : ''}
        ${enableShine ? 'button-shine-enabled' : ''}
        ${isLoading ? 'button-loading' : ''}
      `.trim()}
      variants={buttonVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      whileHover={!disabled && !isLoading ? "hover" : ""}
      whileTap={!disabled && !isLoading ? "tap" : ""}
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {enableShine && (
        <div 
          className="button-shine" 
          style={shineStyle}
          aria-hidden="true"
        />
      )}
      
      {isLoading ? (
        <div className="button-loader">
          <motion.div 
            className="loader-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <motion.span 
          className="button-content"
          variants={hoverVariants}
        >
          {icon && (
            <motion.span 
              className="button-icon"
              variants={iconVariants}
              aria-hidden="true"
            >
              {icon}
            </motion.span>
          )}
          <span className="button-text">{children}</span>
        </motion.span>
      )}
      
      {/* Gradient border effect */}
      <div className="button-gradient-border" aria-hidden="true" />
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  enableShine: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default Button;