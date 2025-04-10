import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../../components/common/Loader'; // Assuming this path is correct
import Card from '../../components/common/Card';     // Assuming this path is correct

const LoadingState = ({ message = 'Analyzing your resume...', type = 'spinner' }) => {
  if (type === 'basic-spinner') {
    return (
      <div className="bg-[#0D1117] text-[#00FFFF] p-4 rounded-lg flex items-center justify-center border border-[#9C27B0]">
        <svg
          className="animate-spin h-5 w-5 mr-3 text-[#00FFFF]"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-[#E5E5E5]">{message}</span>
      </div>
    );
  }

  return (
    <Card className="analysis-loading-card">
      <div className="loading-state-container">
        <Loader type={type} size="lg" text={message} />

        {type === 'spinner' && (
          <div className="loading-tips fade-in">
            <h4>While you wait...</h4>
            <p>Did you know that most ATS systems scan for keywords that match the job description?</p>
          </div>
        )}
      </div>
    </Card>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['spinner', 'dots', 'bars', 'basic-spinner']), // Add other Loader types if applicable
};

export default LoadingState;