import React from 'react';
import PropTypes from 'prop-types';

const ScoreCard = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-neon-cyan border-neon-cyan';
    if (score >= 60) return 'text-electric-purple border-electric-purple';
    return 'text-red-500 border-red-500';
  };

  return (
    <div className="bg-midnight-blue text-white rounded-lg shadow-lg p-6 border border-neon-cyan">
      <h2 className="text-xl font-semibold mb-4 text-electric-purple">Overall ATS Score</h2>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">Score</span>
        <span className={`text-4xl font-bold px-4 py-2 rounded-full ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
    </div>
  );
};

ScoreCard.propTypes = {
  score: PropTypes.number.isRequired,
};

export default ScoreCard;