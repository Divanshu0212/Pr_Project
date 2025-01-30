import React from 'react';
import ScoreCard from './ScoreCard';
import KeywordAnalysis from './KeywordAnalysis';
import FormatAnalysis from './FormatAnalysis';

const AnalysisResults = ({ results }) => {
  return (
    <div className="space-y-6 bg-[#0D1117] text-[#E5E5E5] p-6 rounded-2xl shadow-lg">
      <ScoreCard score={results.overallScore} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KeywordAnalysis
          score={results.keywordMatch}
          matched={results.keywords.matched}
          missing={results.keywords.missing}
        />
        <FormatAnalysis
          score={results.formatScore}
          sections={results.sections}
          issues={results.formatIssues}
        />
      </div>
    </div>
  );
};

export default AnalysisResults;
