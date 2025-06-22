import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScoreVisualization from '../../components/ats/ScoreVisualization';
import KeywordMatch from '../../components/ats/KeywordMatch';
import SuggestionsList from '../../components/ats/SuggestionsList';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const AnalysisResults = ({ analysis }) => {
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
  }, []);

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
          <Card className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">No Analysis Available</h2>
              <p className="text-text-secondary">Get started by analyzing your resume against a job description.</p>
            </div>
            <Link to="/ats/tracker">
              <Button text="Start New Analysis" className="w-full" />
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div 
            ref={(el) => (elementsRef.current[0] = el)}
            className="opacity-0 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-3">
                  Analysis Results
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-lg">
                  <div className="flex items-center">
                    <span className="text-text-secondary">Score:</span>
                    <span className="ml-2 text-2xl font-bold text-accent-primary animate-pulse-slow">
                      {analysis.score}%
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-accent-neutral rounded-full"></div>
                  <div className="flex items-center">
                    <span className="text-text-secondary">Job:</span>
                    <span className="ml-2 text-text-primary font-medium">{analysis.jobTitle}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button text="Download PDF Report" variant="secondary" />
                <Link to="/ats/tracker">
                  <Button text="New Analysis" className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Score & Keywords */}
            <div className="xl:col-span-2 space-y-8">
              {/* Score Visualization */}
              <Card 
                ref={(el) => (elementsRef.current[1] = el)}
                className="opacity-0 bg-gradient-card-light dark:bg-gradient-card-dark"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
                    Score Breakdown
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"></div>
                </div>
                <ScoreVisualization
                  score={analysis.score}
                  categories={analysis.categoryScores}
                />
              </Card>

              {/* Keyword Analysis */}
              <Card 
                ref={(el) => (elementsRef.current[2] = el)}
                className="opacity-0 bg-gradient-card-light dark:bg-gradient-card-dark"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
                    Keyword Analysis
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"></div>
                </div>
                <KeywordMatch
                  keywords={analysis.keywords}
                  resumeContent={analysis.resumeContent}
                />
              </Card>
            </div>

            {/* Right Column - Metrics & Format */}
            <div className="space-y-8">
              {/* Format Analysis */}
              <Card 
                ref={(el) => (elementsRef.current[3] = el)}
                className="opacity-0 bg-gradient-card-light dark:bg-gradient-card-dark"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-text-primary mb-2">Resume Format</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"></div>
                </div>
                <div className="bg-background-secondary p-5 rounded-xl border border-accent-neutral/20">
                  <div className="flex items-center mb-4">
                    <div className={`w-4 h-4 rounded-full mr-3 ${analysis.format.isCompatible ? 'bg-green-400 shadow-glow' : 'bg-accent-error shadow-glow'} animate-pulse-slow`}></div>
                    <p className="text-text-primary font-medium">
                      {analysis.format.isCompatible ? 'ATS Compatible' : 'Format Issues Detected'}
                    </p>
                  </div>
                  <p className="text-text-primary mb-3">
                    <span className="font-semibold">Format:</span> 
                    <span className="ml-2 text-accent-primary">{analysis.format.type}</span>
                  </p>
                  {analysis.format.issues && analysis.format.issues.length > 0 && (
                    <div className="mt-4">
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
              </Card>

              {/* Key Metrics */}
              <Card 
                ref={(el) => (elementsRef.current[4] = el)}
                className="opacity-0 bg-gradient-card-light dark:bg-gradient-card-dark"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-text-primary mb-2">Key Metrics</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Keyword Match', value: `${analysis.keywordMatchPercentage}%`, delay: '100' },
                    { label: 'Skills Match', value: `${analysis.skillsMatchPercentage}%`, delay: '200' },
                    { label: 'Key Phrases', value: analysis.keyPhraseCount, delay: '300' },
                    { label: 'Readability', value: `${analysis.readabilityScore}/10`, delay: '400' }
                  ].map((metric, index) => (
                    <div key={index} className={`bg-background-secondary p-4 rounded-xl border border-accent-neutral/20 text-center hover:shadow-hover transition-all duration-300 animate-fade-in-up-delay-${metric.delay}`}>
                      <p className="text-text-secondary text-sm mb-2">{metric.label}</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Suggestions Section */}
          <Card 
            ref={(el) => (elementsRef.current[5] = el)}
            className="opacity-0 mt-8 bg-gradient-card-light dark:bg-gradient-card-dark"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
                Improvement Suggestions
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"></div>
            </div>
            <SuggestionsList suggestions={analysis.improvementSuggestions} />
          </Card>
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
