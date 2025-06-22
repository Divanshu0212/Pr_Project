import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
    
    // Smooth the position updates
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

  // Enhanced shine effect with better gradient
  const shineStyle = enableShine && isHovered ? {
    background: `radial-gradient(circle at ${position.x}px ${position.y}px, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0.1) 30%, 
      transparent 70%)`,
    transition: 'background 0.1s ease-out',
  } : {};

  return (
    <button
      ref={buttonRef}
      type={type}
      className={`
        button
        button-${variant}
        button-${size}
        ${fullWidth ? 'button-full-width' : ''}
        ${enableShine ? 'button-shine-enabled' : ''}
        ${isLoading ? 'button-loading' : ''}
        ${isVisible ? 'animate-in' : ''}
      `}
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        animationDelay: isVisible ? '0s' : 'initial',
      }}
    >
      {enableShine && (
        <div 
          className="button-shine" 
          style={shineStyle}
          aria-hidden="true"
        />
      )}
      
      {isLoading ? (
        <span className="button-loader" aria-label="Loading..."></span>
      ) : (
        <span className="button-content">
          {icon && (
            <span 
              className="button-icon"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          {children}
        </span>
      )}
    </button>
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