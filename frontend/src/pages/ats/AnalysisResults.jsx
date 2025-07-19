import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScoreVisualization from '../../components/ats/ScoreVisualization';
import KeywordMatch from '../../components/ats/KeywordMatch';
import SuggestionsList from '../../components/ats/SuggestionsList';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useTheme } from '../../context/ThemeContext';
// Ensure your animations.css is imported somewhere globally or at a relevant component level,
// for example, in your App.js or main index.js, or directly in this component if necessary.
// import '../../styles/animations.css'; // Uncomment if not already globally imported

const AnalysisResults = ({ analysis }) => {
  const { isDark } = useTheme();
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    elementsRef.current.forEach((el, index) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transitionDelay = `${index * 150}ms`;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen flex items-center justify-center ${
          isDark
            ? 'bg-[rgb(13,17,23)]'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50'
        }`}>
          <Card className={`text-center max-w-md shadow-2xl border-0 ${
            isDark
              ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(30,35,42)] border border-cyan-500/20'
              : 'bg-white/90 backdrop-blur-sm'
          }`}>
            <div className="mb-6">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDark
                  ? 'bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-cyan-400/25'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25'
              } animate-pulse`}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className={`text-xl font-bold mb-2 ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent'
                  : 'text-gray-800'
              }`}>
                No Analysis Available
              </h2>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Get started by analyzing your resume against a job description.
              </p>
            </div>
            <Link to="/ats/tracker">
              <Button text="Start New Analysis" className={`w-full transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:shadow-lg hover:shadow-cyan-400/25'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25'
              }`} />
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${
        isDark
          ? 'bg-[rgb(13,17,23)]'
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div
            ref={(el) => (elementsRef.current[0] = el)}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className={`text-4xl lg:text-5xl font-black mb-3 ${
                  isDark
                    ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'
                } animate-pulse`}>
                  Analysis Results
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-lg">
                  <div className="flex items-center">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score:</span>
                    <span className={`ml-2 text-2xl font-bold animate-pulse ${
                      isDark ? 'text-cyan-400' : 'text-blue-600'
                    }`}>
                      {analysis.score}%
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    isDark ? 'bg-gray-600' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex items-center">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Job:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {analysis.jobTitle}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  text="Download PDF Report"
                  variant="secondary"
                  className={`transition-all duration-300 ${
                    isDark
                      ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/25'
                      : 'border-blue-500/50 text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/25'
                  }`}
                />
                <Link to="/ats/tracker">
                  <Button
                    text="New Analysis"
                    className={`transition-all duration-300 ${
                      isDark
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:shadow-lg hover:shadow-cyan-400/25'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25'
                    }`}
                  />
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
                className={`shadow-xl border-0 backdrop-blur-sm ${
                  isDark
                    ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(30,35,42)] border border-cyan-500/20'
                    : 'bg-white/80'
                }`}
              >
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                  }`}>
                    Score Breakdown
                  </h2>
                  <div className={`w-20 h-1 rounded-full ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}></div>
                </div>
                <ScoreVisualization
                  score={analysis.score}
                  categories={analysis.categoryScores}
                />
              </Card>

              {/* Keyword Analysis */}
              <Card
                ref={(el) => (elementsRef.current[2] = el)}
                className={`shadow-xl border-0 backdrop-blur-sm ${
                  isDark
                    ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(30,35,42)] border border-cyan-500/20'
                    : 'bg-white/80'
                }`}
              >
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                  }`}>
                    Keyword Analysis
                  </h2>
                  <div className={`w-20 h-1 rounded-full ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}></div>
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
                className={`shadow-xl border-0 backdrop-blur-sm ${
                  isDark
                    ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(30,35,42)] border border-cyan-500/20'
                    : 'bg-white/80'
                }`}
              >
                <div className="mb-6">
                  <h2 className={`text-xl font-bold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    Resume Format
                  </h2>
                  <div className={`w-16 h-1 rounded-full ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}></div>
                </div>
                <div className={`p-5 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? 'bg-[rgb(13,17,23)]/50 border-cyan-500/10 hover:border-cyan-500/30'
                    : 'bg-gray-50/50 border-gray-200/50 hover:border-gray-300/70'
                }`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-4 h-4 rounded-full mr-3 animate-pulse ${
                      analysis.format.isCompatible
                        ? 'bg-green-400 shadow-lg shadow-green-400/50'
                        : 'bg-red-400 shadow-lg shadow-red-400/50'
                    }`}></div>
                    <p className={`font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {analysis.format.isCompatible ? 'ATS Compatible' : 'Format Issues Detected'}
                    </p>
                  </div>
                  <p className={`mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <span className="font-semibold">Format:</span>
                    <span className={`ml-2 ${
                      isDark ? 'text-cyan-400' : 'text-blue-600'
                    }`}>
                      {analysis.format.type}
                    </span>
                  </p>
                  {analysis.format.issues && analysis.format.issues.length > 0 && (
                    <div className="mt-4">
                      <p className={`font-semibold mb-2 ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Issues:
                      </p>
                      <ul className="space-y-1">
                        {analysis.format.issues.map((issue, index) => (
                          <li key={index} className={`flex items-start ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="text-red-400 mr-2">•</span>
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
                className={`shadow-xl border-0 backdrop-blur-sm ${
                  isDark
                    ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(30,35,42)] border border-cyan-500/20'
                    : 'bg-white/80'
                }`}
              >
                <div className="mb-6">
                  <h2 className={`text-xl font-bold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    Key Metrics
                  </h2>
                  <div className={`w-16 h-1 rounded-full ${
                    isDark
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Keyword Match', value: `${analysis.keywordMatchPercentage}%` },
                    { label: 'Skills Match', value: `${analysis.skillsMatchPercentage}%` },
                    { label: 'Key Phrases', value: analysis.keyPhraseCount },
                    { label: 'Readability', value: `${analysis.readabilityScore}/10` }
                  ].map((metric, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border text-center transition-all duration-300 hover:scale-105 cursor-pointer ${
                        isDark
                          ? 'bg-[rgb(13,17,23)]/50 border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-400/25'
                          : 'bg-gray-50/50 border-gray-200/50 hover:border-gray-300/70 hover:shadow-lg hover:shadow-blue-500/25'
                      }`}
                      style={{
                        animationDelay: `${(index + 1) * 100}ms`,
                        opacity: '0',
                        // Ensure 'fadeInUp' animation is available in a global CSS file
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <p className={`text-sm mb-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {metric.label}
                      </p>
                      <p className={`text-2xl font-bold ${
                        isDark
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                      }`}>
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
            className={`mt-8 shadow-xl border-0 backdrop-blur-sm ${
              isDark
                ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(30,35,42)] border border-cyan-500/20'
                : 'bg-white/80'
            }`}
          >
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
              }`}>
                Improvement Suggestions
              </h2>
              <div className={`w-20 h-1 rounded-full ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}></div>
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