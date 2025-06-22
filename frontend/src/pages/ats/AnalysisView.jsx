import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScoreVisualization from '../../components/ats/ScoreVisualization';
import KeywordMatch from '../../components/ats/KeywordMatch';
import SuggestionsList from '../../components/ats/SuggestionsList';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { getAnalysisById } from '../../services/atsService';

const AnalysisView = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [analysis]);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const data = await getAnalysisById(analysisId);
        setAnalysis(data);
      } catch (err) {
        setError('Failed to load analysis results. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [analysisId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
          <LoadingState message="Loading analysis results..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
          <Card className="text-center max-w-md">
            <ErrorMessage message={error || "Analysis not found"} />
            <div className="mt-6">
              <Link to="/ats/tracker">
                <Button text="Back to ATS Tracker" className="w-full" />
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'keywords', label: 'Keywords', icon: '🔍' },
    { id: 'suggestions', label: 'Suggestions', icon: '💡' }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div 
            ref={(el) => (elementsRef.current[0] = el)}
            className="opacity-0 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-3">
                Resume Analysis
              </h1>
              <p className="text-lg text-text-secondary">
                Analysis for <span className="text-accent-primary font-medium">{analysis.resumeName}</span> against{' '}
                <span className="text-text-primary font-medium">{analysis.jobTitle}</span>
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <Link to="/ats/tracker">
                <Button 
                  text="New Analysis" 
                  className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow" 
                />
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <Card 
            ref={(el) => (elementsRef.current[1] = el)}
            className="opacity-0 mb-8 bg-gradient-card-light dark:bg-gradient-card-dark overflow-hidden"
          >
            <div className="border-b border-accent-neutral/20">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`relative px-6 py-4 font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'text-accent-primary'
                        : 'text-text-secondary hover:text-accent-primary'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </span>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Score Section */}
                  <div 
                    ref={(el) => (elementsRef.current[2] = el)}
                    className="opacity-0"
                  >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-6">
                      ATS Score
                    </h2>
                    <ScoreVisualization 
                      score={analysis.score}
                      categories={analysis.categoryScores} 
                    />
                  </div>
                  
                  {/* Details Grid */}
                  <div 
                    ref={(el) => (elementsRef.current[3] = el)}
                    className="opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Format Analysis */}
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-4">Resume Format</h3>
                      <div className="bg-background-secondary p-6 rounded-xl border border-accent-neutral/20">
                        <div className="space-y-4">
                          <p className="text-text-primary">
                            <span className="font-semibold">Format:</span>{' '}
                            <span className="text-accent-primary">{analysis.format.type}</span>
                          </p>
                          <div className="flex items-center">
                            <span className="font-semibold text-text-primary">ATS Compatibility:</span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                              analysis.format.isCompatible 
                                ? 'bg-green-400/20 text-green-400' 
                                : 'bg-accent-error/20 text-accent-error'
                            }`}>
                              {analysis.format.isCompatible ? 'Compatible' : 'Needs Improvement'}
                            </span>
                          </div>
                          {analysis.format.issues && analysis.format.issues.length > 0 && (
                            <div>
                              <p className="text-text-primary font-semibold mb-2">Issues:</p>
                              <ul className="space-y-1">
                                {analysis.format.issues.map((issue, index) => (
                                  <li key={index} className="text-text-secondary flex items-start">
                                    <span className="text-accent-error mr-2">•</span>
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Key Metrics */}
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-4">Key Metrics</h3>
                      <div className="bg-background-secondary p-6 rounded-xl border border-accent-neutral/20">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Keyword Match', value: `${analysis.keywordMatchPercentage}%` },
                            { label: 'Skills Match', value: `${analysis.skillsMatchPercentage}%` },
                            { label: 'Key Phrases', value: analysis.keyPhraseCount },
                            { label: 'Readability', value: `${analysis.readabilityScore}/10` }
                          ].map((metric, index) => (
                            <div key={index} className="text-center">
                              <p className="text-text-secondary text-sm mb-1">{metric.label}</p>
                              <p className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                                {metric.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'keywords' && (
                <div ref={(el) => (elementsRef.current[4] = el)} className="opacity-0">
                  <KeywordMatch 
                    matchedKeywords={analysis.matchedKeywords}
                    missingKeywords={analysis.missingKeywords}
                    jobDescription={analysis.jobDescription}
                  />
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div ref={(el) => (elementsRef.current[5] = el)} className="opacity-0">
                  <SuggestionsList suggestions={analysis.improvementSuggestions} />
                </div>
              )}
            </div>
          </Card>

          {/* Next Steps */}
          <Card 
            ref={(el) => (elementsRef.current[6] = el)}
            className="opacity-0 bg-gradient-card-light dark:bg-gradient-card-dark"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
                Next Steps
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link 
                to="/resume/builder" 
                className="group bg-background-secondary border border-accent-neutral/20 hover:border-accent-primary p-6 rounded-xl transition-all duration-300 hover:shadow-hover"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center group-hover:animate-bounce-gentle">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold mb-2 group-hover:text-accent-primary transition-colors">
                      Update Your Resume
                    </h3>
                    <p className="text-text-secondary">Use our Resume Builder to implement the suggestions</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/ats/tracker" 
                className="group bg-background-secondary border border-accent-neutral/20 hover:border-accent-secondary p-6 rounded-xl transition-all duration-300 hover:shadow-hover"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-secondary to-accent-primary rounded-lg flex items-center justify-center group-hover:animate-bounce-gentle">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold mb-2 group-hover:text-accent-secondary transition-colors">
                      Try Another Job Description
                    </h3>
                    <p className="text-text-secondary">Analyze your resume against different job postings</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalysisView;