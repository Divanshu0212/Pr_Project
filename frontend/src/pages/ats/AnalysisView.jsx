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
import '../../styles/animations.css';

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
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Stagger the animations for a cascade effect
            setTimeout(() => {
              entry.target.classList.add('slide-in-up', 'fade-in');
              entry.target.style.opacity = '1';
            }, index * 150);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elementsRef.current.forEach((el) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
      }
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
        <div className="min-h-screen bg-gradient-to-br from-rgb(13,17,23) to-rgb(22,27,34) dark:from-rgb(13,17,23) dark:to-rgb(22,27,34) flex items-center justify-center">
          <div className="animate-pulse-glow">
            <LoadingState message="Loading analysis results..." />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-rgb(13,17,23) to-rgb(22,27,34) dark:from-rgb(13,17,23) dark:to-rgb(22,27,34) flex items-center justify-center">
          <Card className="text-center max-w-md backdrop-blur-sm bg-rgb(22,27,34)/80 dark:bg-rgb(22,27,34)/80 border-rgb(0,255,255)/20">
            <ErrorMessage message={error || "Analysis not found"} />
            <div className="mt-6">
              <Link to="/ats/tracker">
                <Button 
                  text="Back to ATS Tracker" 
                  className="w-full bg-gradient-to-r from-rgb(0,255,255) to-rgb(156,39,176) hover:from-rgb(156,39,176) hover:to-rgb(0,255,255) transition-all duration-300 text-rgb(13,17,23) font-bold" 
                />
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
      <div className="min-h-screen bg-gradient-to-br from-rgb(13,17,23) via-rgb(22,27,34) to-rgb(13,17,23) dark:from-rgb(13,17,23) dark:via-rgb(22,27,34) dark:to-rgb(13,17,23) relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-rgb(0,255,255)/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-rgb(156,39,176)/5 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header */}
          <div 
            ref={(el) => (elementsRef.current[0] = el)}
            className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between transition-all duration-700"
          >
            <div>
              <h1 className="text-4xl lg:text-6xl font-black mb-4 animate-gradient-text">
                <span className="bg-gradient-to-r from-rgb(0,255,255) via-rgb(156,39,176) to-rgb(0,255,255) bg-clip-text text-transparent bg-300% animate-gradient-shift">
                  Resume Analysis
                </span>
              </h1>
              <p className="text-lg text-rgb(229,229,229) dark:text-rgb(229,229,229) leading-relaxed">
                Analysis for{' '}
                <span className="text-rgb(0,255,255) dark:text-rgb(0,255,255) font-semibold animate-glow-text">
                  {analysis.resumeName}
                </span>{' '}
                against{' '}
                <span className="text-rgb(156,39,176) dark:text-rgb(156,39,176) font-semibold">
                  {analysis.jobTitle}
                </span>
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <Link to="/ats/tracker">
                <Button 
                  text="New Analysis" 
                  className="bg-gradient-to-r from-rgb(0,255,255) to-rgb(156,39,176) hover:from-rgb(156,39,176) hover:to-rgb(0,255,255) transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-rgb(0,255,255)/25 text-rgb(13,17,23) font-bold px-8 py-3" 
                />
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <Card 
            ref={(el) => (elementsRef.current[1] = el)}
            className="mb-8 backdrop-blur-lg bg-rgb(22,27,34)/80 dark:bg-rgb(22,27,34)/80 border-rgb(0,255,255)/20 overflow-hidden transition-all duration-700"
          >
            <div className="border-b border-rgb(0,255,255)/20">
              <nav className="flex relative">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    className={`relative px-6 py-4 font-semibold transition-all duration-300 flex-1 group ${
                      activeTab === tab.id
                        ? 'text-rgb(0,255,255) dark:text-rgb(0,255,255)'
                        : 'text-rgb(229,229,229)/70 dark:text-rgb(229,229,229)/70 hover:text-rgb(156,39,176) dark:hover:text-rgb(156,39,176)'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="flex items-center justify-center space-x-2 transform group-hover:scale-105 transition-transform duration-200">
                      <span className="text-xl group-hover:animate-bounce-gentle">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </span>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rgb(0,255,255) to-rgb(156,39,176) animate-gradient-x"></div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-r from-rgb(0,255,255)/5 to-rgb(156,39,176)/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeTab === tab.id ? 'opacity-10' : ''}`}></div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Score Section */}
                  <div 
                    ref={(el) => (elementsRef.current[2] = el)}
                    className="transition-all duration-700"
                  >
                    <h2 className="text-3xl font-bold mb-6">
                      <span className="bg-gradient-to-r from-rgb(0,255,255) via-rgb(156,39,176) to-rgb(0,255,255) bg-clip-text text-transparent bg-300% animate-gradient-shift">
                        ATS Score
                      </span>
                    </h2>
                    <div className="backdrop-blur-sm bg-rgb(22,27,34)/60 dark:bg-rgb(22,27,34)/60 rounded-2xl p-6 border border-rgb(0,255,255)/10">
                      <ScoreVisualization 
                        score={analysis.score}
                        categories={analysis.categoryScores} 
                      />
                    </div>
                  </div>
                  
                  {/* Details Grid */}
                  <div 
                    ref={(el) => (elementsRef.current[3] = el)}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700"
                  >
                    {/* Format Analysis */}
                    <div className="group">
                      <h3 className="text-2xl font-bold text-rgb(229,229,229) dark:text-rgb(229,229,229) mb-4 group-hover:text-rgb(0,255,255) transition-colors duration-300">
                        Resume Format
                      </h3>
                      <div className="backdrop-blur-sm bg-rgb(22,27,34)/60 dark:bg-rgb(22,27,34)/60 p-6 rounded-2xl border border-rgb(0,255,255)/10 hover:border-rgb(0,255,255)/30 transition-all duration-300 hover:shadow-lg hover:shadow-rgb(0,255,255)/10">
                        <div className="space-y-4">
                          <p className="text-rgb(229,229,229) dark:text-rgb(229,229,229)">
                            <span className="font-semibold">Format:</span>{' '}
                            <span className="text-rgb(0,255,255) dark:text-rgb(0,255,255) font-medium">
                              {analysis.format.type}
                            </span>
                          </p>
                          <div className="flex items-center">
                            <span className="font-semibold text-rgb(229,229,229) dark:text-rgb(229,229,229)">
                              ATS Compatibility:
                            </span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                              analysis.format.isCompatible 
                                ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                                : 'bg-red-400/20 text-red-400 border border-red-400/30'
                            }`}>
                              {analysis.format.isCompatible ? 'Compatible' : 'Needs Improvement'}
                            </span>
                          </div>
                          {analysis.format.issues && analysis.format.issues.length > 0 && (
                            <div>
                              <p className="text-rgb(229,229,229) dark:text-rgb(229,229,229) font-semibold mb-2">
                                Issues:
                              </p>
                              <ul className="space-y-2">
                                {analysis.format.issues.map((issue, index) => (
                                  <li key={index} className="text-rgb(229,229,229)/80 dark:text-rgb(229,229,229)/80 flex items-start">
                                    <span className="text-rgb(156,39,176) dark:text-rgb(156,39,176) mr-2 mt-1">•</span>
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
                    <div className="group">
                      <h3 className="text-2xl font-bold text-rgb(229,229,229) dark:text-rgb(229,229,229) mb-4 group-hover:text-rgb(156,39,176) transition-colors duration-300">
                        Key Metrics
                      </h3>
                      <div className="backdrop-blur-sm bg-rgb(22,27,34)/60 dark:bg-rgb(22,27,34)/60 p-6 rounded-2xl border border-rgb(156,39,176)/10 hover:border-rgb(156,39,176)/30 transition-all duration-300 hover:shadow-lg hover:shadow-rgb(156,39,176)/10">
                        <div className="grid grid-cols-2 gap-6">
                          {[
                            { label: 'Keyword Match', value: `${analysis.keywordMatchPercentage}%`, gradient: 'from-rgb(0,255,255) to-rgb(156,39,176)' },
                            { label: 'Skills Match', value: `${analysis.skillsMatchPercentage}%`, gradient: 'from-rgb(156,39,176) to-rgb(0,255,255)' },
                            { label: 'Key Phrases', value: analysis.keyPhraseCount, gradient: 'from-rgb(0,255,255) to-rgb(156,39,176)' },
                            { label: 'Readability', value: `${analysis.readabilityScore}/10`, gradient: 'from-rgb(156,39,176) to-rgb(0,255,255)' }
                          ].map((metric, index) => (
                            <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300 p-3 rounded-xl hover:bg-gradient-to-br hover:from-rgb(0,255,255)/5 hover:to-rgb(156,39,176)/5">
                              <p className="text-rgb(229,229,229)/70 dark:text-rgb(229,229,229)/70 text-sm mb-2 font-medium">
                                {metric.label}
                              </p>
                              <p className={`text-3xl font-black bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
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
                <div ref={(el) => (elementsRef.current[4] = el)} className="transition-all duration-700">
                  <KeywordMatch 
                    matchedKeywords={analysis.matchedKeywords}
                    missingKeywords={analysis.missingKeywords}
                    jobDescription={analysis.jobDescription}
                  />
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div ref={(el) => (elementsRef.current[5] = el)} className="transition-all duration-700">
                  <SuggestionsList suggestions={analysis.improvementSuggestions} />
                </div>
              )}
            </div>
          </Card>

          {/* Next Steps */}
          <Card 
            ref={(el) => (elementsRef.current[6] = el)}
            className="backdrop-blur-lg bg-rgb(22,27,34)/80 dark:bg-rgb(22,27,34)/80 border-rgb(0,255,255)/20 transition-all duration-700"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-rgb(0,255,255) via-rgb(156,39,176) to-rgb(0,255,255) bg-clip-text text-transparent bg-300% animate-gradient-shift">
                  Next Steps
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-rgb(0,255,255) to-rgb(156,39,176) rounded-full animate-gradient-x"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link 
                to="/resume/builder" 
                className="group backdrop-blur-sm bg-rgb(22,27,34)/60 dark:bg-rgb(22,27,34)/60 border border-rgb(0,255,255)/20 hover:border-rgb(0,255,255)/60 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-rgb(0,255,255)/20 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-rgb(0,255,255) to-rgb(156,39,176) rounded-2xl flex items-center justify-center group-hover:animate-bounce-gentle shadow-lg">
                    <svg className="w-7 h-7 text-rgb(13,17,23)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-rgb(229,229,229) dark:text-rgb(229,229,229) font-bold text-xl mb-3 group-hover:text-rgb(0,255,255) transition-colors duration-300">
                      Update Your Resume
                    </h3>
                    <p className="text-rgb(229,229,229)/70 dark:text-rgb(229,229,229)/70 leading-relaxed">
                      Use our Resume Builder to implement the suggestions and improve your ATS score
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/ats/tracker" 
                className="group backdrop-blur-sm bg-rgb(22,27,34)/60 dark:bg-rgb(22,27,34)/60 border border-rgb(156,39,176)/20 hover:border-rgb(156,39,176)/60 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-rgb(156,39,176)/20 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-rgb(156,39,176) to-rgb(0,255,255) rounded-2xl flex items-center justify-center group-hover:animate-bounce-gentle shadow-lg">
                    <svg className="w-7 h-7 text-rgb(13,17,23)" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-rgb(229,229,229) dark:text-rgb(229,229,229) font-bold text-xl mb-3 group-hover:text-rgb(156,39,176) transition-colors duration-300">
                      Try Another Job Description
                    </h3>
                    <p className="text-rgb(229,229,229)/70 dark:text-rgb(229,229,229)/70 leading-relaxed">
                      Analyze your resume against different job postings for better optimization
                    </p>
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