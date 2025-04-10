import React from 'react';
import PropTypes from 'prop-types';

const ScoreVisualization = ({ score, categories }) => {
  // Function to determine color based on score
  const getScoreColor = (value) => {
    if (value >= 80) return '#4CAF50'; // Green for high scores
    if (value >= 60) return '#FFC107'; // Yellow for medium scores
    return '#F44336'; // Red for low scores
  };

  return (
    <div className="bg-[#161B22] rounded-xl p-6 shadow-lg">
      <div className="flex flex-col items-center mb-8">
        <h3 className="text-[#E5E5E5] text-xl font-semibold mb-4">Overall ATS Score</h3>

        <div className="relative w-48 h-48">
          {/* Circular background */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#2D3748"
              strokeWidth="10"
            />

            {/* Score circle with score-dependent coloring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={getScoreColor(score)}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 45 * (score / 100)} ${2 * Math.PI * 45 * (1 - score / 100)}`}
              strokeDashoffset={2 * Math.PI * 45 * 0.25} // Start at top
              transform="rotate(-90 50 50)"
            />
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: getScoreColor(score) }}>
              {score}
            </span>
            <span className="text-[#E5E5E5] text-sm">out of 100</span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-4">
        <h4 className="text-[#E5E5E5] text-lg font-semibold mb-3">Category Breakdown</h4>

        {categories.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#E5E5E5]">{category.name}</span>
              <span className="text-[#E5E5E5]">{category.score}/100</span>
            </div>

            <div className="w-full bg-[#0D1117] rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${category.score}%`,
                  backgroundColor: getScoreColor(category.score),
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick insights */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h4 className="text-[#E5E5E5] text-lg font-semibold mb-4">Quick Insights</h4>

        <ul className="space-y-3">
          {score >= 80 ? (
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[#E5E5E5]">Your resume is highly optimized for ATS systems</span>
            </li>
          ) : score >= 60 ? (
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-[#E5E5E5]">Your resume has adequate ATS compatibility with room for improvement</span>
            </li>
          ) : (
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-[#E5E5E5]">Your resume may be filtered out by ATS systems - see our recommendations</span>
            </li>
          )}

          {categories.map((category) => {
            if (category.score < 60) {
              return (
                <li key={`insight-${category.name}`} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00FFFF] mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#E5E5E5]">Focus on improving your {category.name.toLowerCase()} score</span>
                </li>
              );
            }
            return null;
          }).filter(Boolean)}
        </ul>
      </div>
    </div>
  );
};

ScoreVisualization.propTypes = {
  score: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ScoreVisualization;