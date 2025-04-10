import React from 'react';
import PropTypes from 'prop-types'; // Import prop-types
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

// Define prop types for AnalysisResults
AnalysisResults.propTypes = {
  results: PropTypes.shape({
    overallScore: PropTypes.number.isRequired,
    keywordMatch: PropTypes.number.isRequired,
    keywords: PropTypes.shape({
      matched: PropTypes.arrayOf(PropTypes.string).isRequired,
      missing: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    formatScore: PropTypes.number.isRequired,
    sections: PropTypes.arrayOf(PropTypes.string).isRequired,
    formatIssues: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default AnalysisResults;