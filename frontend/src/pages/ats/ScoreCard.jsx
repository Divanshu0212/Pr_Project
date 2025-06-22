import React from 'react';
import PropTypes from 'prop-types';

const ScoreCard = ({ score, label = "Overall ATS Score", color }) => {
  const getScoreColor = (currentScore) => {
    if (currentScore >= 80) return 'text-accent-primary';
    if (currentScore >= 60) return 'text-accent-secondary';
    return 'text-accent-error';
  };

  const getGradientClass = (currentScore) => {
    if (currentScore >= 80) return 'bg-gradient-to-r from-blue-500 to-cyan-400';
    if (currentScore >= 60) return 'bg-gradient-to-r from-purple-500 to-blue-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const scoreColorClass = color || getScoreColor(score);
  const gradientClass = getGradientClass(score);

  // Calculate circumference for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-background-secondary border border-accent-neutral/20 rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 group">
      <h3 className="text-lg font-semibold text-text-primary mb-6 text-center">
        {label}
      </h3>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgb(var(--color-accent-neutral) / 0.2)"
              strokeWidth="8"
            />
            {/* Progress circle with gradient */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Gradient definition */}
          <svg className="absolute inset-0">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={score >= 80 ? '#3182CE' : score >= 60 ? '#805AD5' : '#EF4444'} />
                <stop offset="100%" stopColor={score >= 80 ? '#00FFFF' : score >= 60 ? '#3182CE' : '#F87171'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className={`text-3xl font-bold ${scoreColorClass} animate-scale-in`}>
                {score}
              </span>
              <div className="text-sm text-text-secondary">/ 100</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Score interpretation */}
      <div className="text-center">
        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${gradientClass} text-white`}>
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
        </div>
      </div>
    </div>
  );
};

ScoreCard.propTypes = {
  score: PropTypes.number.isRequired,
  label: PropTypes.string,
  color: PropTypes.string,
};

export default ScoreCard;