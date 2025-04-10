import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScoreVisualization from '../../components/ats/ScoreVisualization';
import KeywordMatch from '../../components/ats/KeywordMatch';
import SuggestionsList from '../../components/ats/SuggestionsList';
import Button from '../../components/common/Button';

const AnalysisResults = ({ analysis }) => {
  if (!analysis) {
    return (
    
        <div className="p-6 text-center">
          <p className="text-[#E5E5E5] mb-4">No analysis data available.</p>
          <Link to="/ats/tracker">
            <Button text="Start New Analysis" />
          </Link>
        </div>
   
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#E5E5E5] mb-2">Analysis Results</h1>
              <p className="text-gray-400">
                Score: <span className="text-[#00FFFF] font-medium">{analysis.score}%</span> •
                Job: <span className="text-[#E5E5E5]">{analysis.jobTitle}</span>
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button text="Download PDF Report" variant="secondary" />
              <Link to="/ats/tracker">
                <Button text="New Analysis" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-[#161B22] rounded-lg p-6 mb-6">
              <h2 className="text-xl text-[#00FFFF] mb-4">Score Breakdown</h2>
              <ScoreVisualization
                score={analysis.score}
                categories={analysis.categoryScores}
              />
            </div>

            <div className="bg-[#161B22] rounded-lg p-6">
              <h2 className="text-xl text-[#00FFFF] mb-4">Keyword Analysis</h2>
              <KeywordMatch
                keywords={analysis.keywords} // Assuming 'keywords' prop now contains the necessary info
                resumeContent={analysis.resumeContent} // Assuming resume content is available
              />
            </div>
          </div>

          <div>
            <div className="bg-[#161B22] rounded-lg p-6 mb-6">
              <h2 className="text-xl text-[#00FFFF] mb-4">Resume Format</h2>
              <div className="bg-[#0D1117] p-4 rounded-md">
                <div className="flex items-center mb-3">
                  <div className={`w-3 h-3 rounded-full mr-2 ${analysis.format.isCompatible ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <p className="text-[#E5E5E5]">
                    {analysis.format.isCompatible ? 'ATS Compatible' : 'Format Issues Detected'}
                  </p>
                </div>

                <p className="text-[#E5E5E5] mb-2">
                  <span className="font-medium">Format:</span> {analysis.format.type}
                </p>

                {analysis.format.issues && analysis.format.issues.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[#E5E5E5] font-medium">Issues:</p>
                    <ul className="list-disc list-inside text-gray-400">
                      {analysis.format.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#161B22] rounded-lg p-6">
              <h2 className="text-xl text-[#00FFFF] mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0D1117] p-3 rounded-md text-center">
                  <p className="text-gray-400 text-sm">Keyword Match</p>
                  <p className="text-2xl text-[#E5E5E5]">{analysis.keywordMatchPercentage}%</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-md text-center">
                  <p className="text-gray-400 text-sm">Skills Match</p>
                  <p className="text-2xl text-[#E5E5E5]">{analysis.skillsMatchPercentage}%</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-md text-center">
                  <p className="text-gray-400 text-sm">Key Phrases</p>
                  <p className="text-2xl text-[#E5E5E5]">{analysis.keyPhraseCount}</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-md text-center">
                  <p className="text-gray-400 text-sm">Readability</p>
                  <p className="text-2xl text-[#E5E5E5]">{analysis.readabilityScore}/10</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-lg p-6">
          <h2 className="text-xl text-[#00FFFF] mb-4">Improvement Suggestions</h2>
          <SuggestionsList suggestions={analysis.improvementSuggestions} />
        </div>
      </div>
    </DashboardLayout>
  );
};

AnalysisResults.propTypes = {
  analysis: PropTypes.shape({
    score: PropTypes.number.isRequired,
    jobTitle: PropTypes.string.isRequired,
    categoryScores: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
      })
    ).isRequired,
    keywords: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        found: PropTypes.bool.isRequired,
        importance: PropTypes.number.isRequired,
      })
    ).isRequired,
    resumeContent: PropTypes.string.isRequired,
    format: PropTypes.shape({
      isCompatible: PropTypes.bool.isRequired,
      type: PropTypes.string.isRequired,
      issues: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    keywordMatchPercentage: PropTypes.number.isRequired,
    skillsMatchPercentage: PropTypes.number.isRequired,
    keyPhraseCount: PropTypes.number.isRequired,
    readabilityScore: PropTypes.number.isRequired,
    improvementSuggestions: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        example: PropTypes.string,
      })
    ).isRequired,
  }),
};

export default AnalysisResults;