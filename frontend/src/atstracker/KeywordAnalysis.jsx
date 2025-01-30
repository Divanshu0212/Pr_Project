import React from 'react';

const KeywordAnalysis = ({ score, matched, missing }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Keyword Analysis</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Keyword Match</span>
            <span className="font-semibold">{score}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Matched Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {matched.map(keyword => (
              <span
                key={keyword}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Missing Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {missing.map(keyword => (
              <span
                key={keyword}
                className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysis;