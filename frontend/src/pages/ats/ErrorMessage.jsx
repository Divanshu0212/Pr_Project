import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message, className }) => {
  return (
    <div className={`
      group relative overflow-hidden rounded-xl p-4 
      bg-gradient-to-r from-red-500/10 via-red-400/5 to-red-500/10
      border border-red-400/30 backdrop-blur-sm
      animate-fade-in-up hover:shadow-glow
      transition-all duration-400 ease-smooth
      ${className || ''}
    `}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-400/5 animate-gradient-x opacity-50" />
      
      {/* Content */}
      <div className="relative flex items-start gap-3">
        <div className="flex-shrink-0 animate-bounce-gentle">
          <svg
            className="w-5 h-5 text-red-400 animate-pulse-slow"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <p className="text-text-primary font-medium leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ErrorMessage;