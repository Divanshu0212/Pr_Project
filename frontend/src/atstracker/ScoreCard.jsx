import React from 'react';

const ScoreCard = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Overall ATS Score</h2>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">Score</span>
        <span className={`text-4xl font-bold px-4 py-2 rounded-full ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
    </div>
  );
};

export default ScoreCard;