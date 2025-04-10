import React from 'react';
import PropTypes from 'prop-types'; // Import the prop-types library
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
}) => {
  return (
    <button
      type={type}
      className={`
        button
        button-${variant}
        button-${size}
        ${fullWidth ? 'button-full-width' : ''}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

// Define the expected prop types for the Button component
Button.propTypes = {
  children: PropTypes.node.isRequired, // Typically the button label
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']), // Expect one of these string values
  size: PropTypes.oneOf(['small', 'medium', 'large']), // Expect one of these string values
  onClick: PropTypes.func, // Expect a function
  disabled: PropTypes.bool, // Expect a boolean
  fullWidth: PropTypes.bool, // Expect a boolean
  type: PropTypes.oneOf(['button', 'submit', 'reset']), // Expect one of these string values
  icon: PropTypes.node, // Expect a React node (can be an element or text)
};

export default Button;