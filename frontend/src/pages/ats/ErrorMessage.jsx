import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message, className }) => {
  const baseStyles = "p-4 rounded-lg flex items-center";
  const oldStyles = "bg-[#161B22] text-[#9C27B0] border border-[#00FFFF]";
  const newStyles = "bg-red-500 bg-opacity-20 border border-red-400 text-[#E5E5E5] mb-6 items-start";
  const svgOldStyle = "h-5 w-5 mr-3 text-[#00FFFF]";
  const svgNewStyle = "w-5 h-5 text-red-400 mr-2 mt-0.5";

  const combinedClassName = `${baseStyles} ${className || oldStyles}`;
  const svgClassName = className ? svgNewStyle : svgOldStyle;
  const textColorClass = className ? "" : "text-[#E5E5E5]"; // New has default text color

  return (
    <div className={combinedClassName}>
      <svg
        className={svgClassName}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span className={textColorClass}>{message}</span>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ErrorMessage;