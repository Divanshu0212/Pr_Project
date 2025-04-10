import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScoreVisualization from '../../components/ats/ScoreVisualization';
import KeywordMatch from '../../components/ats/KeywordMatch';
import SuggestionsList from '../../components/ats/SuggestionsList';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';
import Button from '../../components/common/Button';
import { getAnalysisById } from '../../services/atsService';

const AnalysisView = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const data = await getAnalysisById(analysisId);
        setAnalysis(data);
      } catch (err) {
        setError('Failed to load analysis results. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [analysisId]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading analysis results..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage message={error} />
        <div className="flex justify-center mt-6">
          <Link to="/ats/tracker">
            <Button text="Back to ATS Tracker" />
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <ErrorMessage message="Analysis not found" />
        <div className="flex justify-center mt-6">
          <Link to="/ats/tracker">
            <Button text="Back to ATS Tracker" />
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#E5E5E5] mb-2">Resume Analysis</h1>
            <p className="text-gray-400">
              Analysis for {analysis.resumeName} against {analysis.jobTitle}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/ats/tracker">
              <Button text="New Analysis" variant="secondary" />
            </Link>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-lg overflow-hidden mb-8">
          <div className="border-b border-[#30363D]">
            <nav className="flex">
              <button
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]'
                    : 'text-[#E5E5E5] hover:text-[#00FFFF]'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'keywords'
                    ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]'
                    : 'text-[#E5E5E5] hover:text-[#00FFFF]'
                }`}
                onClick={() => setActiveTab('keywords')}
              >
                Keywords
              </button>
              <button
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'suggestions'
                    ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]'
                    : 'text-[#E5E5E5] hover:text-[#00FFFF]'
                }`}
                onClick={() => setActiveTab('suggestions')}
              >
                Suggestions
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl text-[#00FFFF] mb-4">ATS Score</h2>
                  <ScoreVisualization 
                    score={analysis.score}
                    categories={analysis.categoryScores} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg text-[#E5E5E5] mb-3">Resume Format</h3>
                    <div className="bg-[#0D1117] p-4 rounded-md">
                      <p className="text-[#E5E5E5] mb-2">
                        <span className="font-medium">Format:</span> {analysis.format.type}
                      </p>
                      <p className="text-[#E5E5E5] mb-2">
                        <span className="font-medium">ATS Compatibility:</span>{' '}
                        <span className={analysis.format.isCompatible ? 'text-green-400' : 'text-red-400'}>
                          {analysis.format.isCompatible ? 'Compatible' : 'Needs Improvement'}
                        </span>
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
                  
                  <div>
                    <h3 className="text-lg text-[#E5E5E5] mb-3">Key Metrics</h3>
                    <div className="bg-[#0D1117] p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 mb-1">Keyword Match</p>
                          <p className="text-2xl text-[#E5E5E5]">{analysis.keywordMatchPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Skills Match</p>
                          <p className="text-2xl text-[#E5E5E5]">{analysis.skillsMatchPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Key Phrases</p>
                          <p className="text-2xl text-[#E5E5E5]">{analysis.keyPhraseCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Readability</p>
                          <p className="text-2xl text-[#E5E5E5]">{analysis.readabilityScore}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div>
                <KeywordMatch 
                  matchedKeywords={analysis.matchedKeywords}
                  missingKeywords={analysis.missingKeywords}
                  jobDescription={analysis.jobDescription}
                />
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div>
                <SuggestionsList suggestions={analysis.improvementSuggestions} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#161B22] rounded-lg p-6">
          <h2 className="text-xl text-[#00FFFF] mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/resume/builder" 
              className="bg-[#0D1117] border border-[#30363D] hover:border-[#00FFFF] p-4 rounded-md transition-all"
            >
              <h3 className="text-[#E5E5E5] font-medium mb-2">Update Your Resume</h3>
              <p className="text-gray-400">Use our Resume Builder to implement the suggestions</p>
            </Link>
            <Link 
              to="/ats/tracker" 
              className="bg-[#0D1117] border border-[#30363D] hover:border-[#00FFFF] p-4 rounded-md transition-all"
            >
              <h3 className="text-[#E5E5E5] font-medium mb-2">Try Another Job Description</h3>
              <p className="text-gray-400">Analyze your resume against different job postings</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalysisView;