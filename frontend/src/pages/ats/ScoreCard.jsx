import React from 'react';
import PropTypes from 'prop-types';

const ScoreCard = ({ score, label = "Overall ATS Score", color }) => {
  const getScoreColor = (currentScore) => {
    if (currentScore >= 80) return '#00FFFF'; // neon-cyan
    if (currentScore >= 60) return '#9C27B0'; // electric-purple
    return '#F44336'; // red-500
  };

  const determinedColor = color || getScoreColor(score);

  return (
    <div className="bg-midnight-blue text-white rounded-lg shadow-lg p-6 border" style={{ borderColor: determinedColor }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#9C27B0' }}>{label}</h2>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">Score</span>
        <span className={`text-4xl font-bold px-4 py-2 rounded-full`} style={{ backgroundColor: determinedColor }}>
          {score}%
        </span>
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