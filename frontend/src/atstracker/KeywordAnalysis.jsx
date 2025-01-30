import React from 'react';

const KeywordAnalysis = ({ score, matched, missing }) => {
  return (
    <div className="bg-[#0D1117] text-[#E5E5E5] rounded-lg shadow-lg p-6 border border-[#161B22]">
      <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Keyword Analysis</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Keyword Match</span>
            <span className="font-semibold text-[#9C27B0]">{score}%</span>
          </div>
          <div className="h-2 bg-[#161B22] rounded-full">
            <div
              className="h-full bg-[#00FFFF] rounded-full"
              style={{ width: `${score}` }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2 text-[#9C27B0]">Matched Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {matched.map(keyword => (
              <span
                key={keyword}
                className="px-2 py-1 bg-[#161B22] text-[#00FFFF] border border-[#00FFFF] rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2 text-[#9C27B0]">Missing Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {missing.map(keyword => (
              <span
                key={keyword}
                className="px-2 py-1 bg-[#161B22] text-[#9C27B0] border border-[#9C27B0] rounded-full text-sm"
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