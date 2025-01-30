import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-[#161B22] text-[#9C27B0] p-4 rounded-lg border border-[#00FFFF]">
      <div className="flex items-center">
        <svg
          className="h-5 w-5 mr-3 text-[#00FFFF]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-[#E5E5E5]">{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;