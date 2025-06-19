import React, { useRef, useState } from 'react';
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
}) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled || !enableShine) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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

  const shineStyle = enableShine && isHovered ? {
    background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.1) 0%, transparent 60%)`,
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
      `}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {enableShine && (
        <div
          className="button-shine"
          style={shineStyle}
        />
      )}
      <div className="button-content">
        {icon && <span className="button-icon">{icon}</span>}
        {children}
      </div>
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
};

export default Button;