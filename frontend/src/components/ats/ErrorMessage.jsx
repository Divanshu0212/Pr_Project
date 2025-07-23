import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message, className }) => {
  return (
    <div className={`
      group relative overflow-hidden rounded-xl p-4 
      bg-gradient-to-r from-red-500/10 via-red-400/5 to-red-500/10
      dark:bg-gradient-to-r dark:from-red-400/15 dark:via-red-500/8 dark:to-red-400/15
      border border-red-400/30 dark:border-red-400/40 backdrop-blur-sm
      animate-fade-in-up hover:shadow-glow
      transition-all duration-400 ease-smooth
      hover:scale-[1.02] hover:border-red-400/50
      ${className || ''}
    `}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-400/5 dark:from-red-400/8 dark:to-red-500/8 animate-gradient-x opacity-50" />
      
      {/* Glowing edge effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-shimmer" />
      
      {/* Content */}
      <div className="relative flex items-start gap-3">
        <div className="flex-shrink-0 animate-bounce-gentle">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400/20 to-red-500/20 flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-5 h-5 text-red-400 dark:text-red-300 animate-pulse-slow"
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
        </div>
        
        <div className="flex-1">
          <p className="text-text-primary dark:text-text-primary font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-red-400/30 rounded-full animate-ping" />
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-red-500/40 rounded-full animate-pulse-slow" />
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ErrorMessage;