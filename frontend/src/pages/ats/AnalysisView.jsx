import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScoreVisualization from '../../components/ats/ScoreVisualization'; // Corrected path
import KeywordMatch from '../../components/ats/KeywordMatch'; // Corrected path
import SuggestionsList from '../../components/ats/SuggestionsList'; // Corrected path
import LoadingState from '../../components/ats/LoadingState'; // Corrected path
import ErrorMessage from '../../components/ats/ErrorMessage'; // Corrected path
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { getAnalysisById } from '../../services/atsService'; // Assuming this service call exists
import { useTheme } from '../../context/ThemeContext'; // Import useTheme
import '../../styles/animations.css'; // Global animations

const AnalysisView = () => {
    const { analysisId } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const elementsRef = useRef([]); // For stagger animations
    const { isDark } = useTheme(); // Use theme for dynamic colors

    // Add Intersection Observer for scroll animations (retains existing logic)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Stagger the animations for a cascade effect
                        // Using 'visible' class as defined in animations.css for animate-on-scroll
                        entry.target.classList.add('visible');
                    }
                    // Optional: remove 'visible' if you want animations to replay when scrolling back up
                    // else { entry.target.classList.remove('visible'); }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        elementsRef.current.forEach((el) => {
            if (el) {
                // Initial state for animate-on-scroll managed by CSS
                // el.style.opacity = '0';
                // el.style.transform = 'translateY(30px)';
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, [analysis]); // Re-observe when analysis data loads

    // Fetch analysis data
    useEffect(() => {
        async function fetchAnalysis() {
            try {
                setLoading(true);
                setError('');
                const data = await getAnalysisById(analysisId); // Ensure this function handles token
                setAnalysis(data);
            } catch (err) {
                console.error("Error fetching analysis:", err);
                setError('Failed to load analysis results. Please ensure the backend is running and the analysis ID is valid.');
            } finally {
                setLoading(false);
            }
        }

        fetchAnalysis();
    }, [analysisId]); // Depend on analysisId from URL params

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gradient-to-br from-rgb(13,17,23) to-rgb(22,27,34) dark:from-rgb(13,17,23) dark:to-rgb(22,27,34) flex items-center justify-center">
                    <div className="animate-pulse-glow"> {/* Ensure this class is defined in animations.css */}
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
                            <Link to="/ats/scan"> {/* Navigate back to scan page */}
                                <Button
                                    text="Back to ATS Analyzer"
                                    className="w-full bg-gradient-to-r from-rgb(0,255,255) to-rgb(156,39,176) hover:from-rgb(156,39,176) hover:to-rgb(0,255,255) transition-all duration-300 text-rgb(13,17,23) font-bold"
                                />
                            </Link>
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    // Tabs for different sections of the analysis report
    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'keywords', label: 'Keywords', icon: '🔍' },
        { id: 'suggestions', label: 'Suggestions', icon: '💡' }
    ];

    // Helper for rendering score gauges (from original new.jsx, adapted)
    const renderScoreGauge = (score, label, index) => (
        <div className="mb-6 animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex justify-between items-center mb-3">
                <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {label}
                </span>
                <span className={`font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent`}>
                    {Math.round(score)}%
                </span>
            </div>
            <div className={`w-full h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700/50' : 'bg-gray-200/70'} backdrop-blur-sm`}>
                <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out animate-pulse-glow"
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );


    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-rgb(13,17,23) via-rgb(22,27,34) to-rgb(13,17,23) dark:from-rgb(13,17,23) dark:via-rgb(22,27,34) dark:to-rgb(13,17,23) relative">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-rgb(0,255,255)/5 rounded-full blur-3xl animate-float-standard"></div> {/* Using standard float */}
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-rgb(156,39,176)/5 rounded-full blur-3xl animate-float-standard animation-delay-2s"></div> {/* Using standard float and delay */}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    {/* Header */}
                    <div
                        ref={(el) => (elementsRef.current[0] = el)}
                        className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between animate-on-scroll scroll-reveal-delay-0" // Using animate-on-scroll
                    >
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-black mb-4 animate-gradient-text">
                                <span className="bg-gradient-to-r from-rgb(0,255,255) via-rgb(156,39,176) to-rgb(0,255,255) bg-clip-text text-transparent bg-300% animate-gradient-shift">
                                    Resume Analysis
                                </span>
                            </h1>
                            <p className="text-lg text-rgb(229,229,229) dark:text-rgb(229,229,229) leading-relaxed">
                                Analysis for{' '}
                                <span className="text-rgb(0,255,255) dark:text-rgb(0,255,255) font-semibold animate-glow"> {/* Using standard glow */}
                                    {analysis.resumeName || 'Your Resume'}
                                </span>{' '}
                                against{' '}
                                <span className="text-rgb(156,39,176) dark:text-rgb(156,39,176) font-semibold">
                                    {analysis.jobTitle}
                                </span>
                            </p>
                        </div>
                        <div className="mt-6 lg:mt-0">
                            <Link to="/ats/scan"> {/* Link back to the scan initiation page */}
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
                        className="mb-8 backdrop-blur-lg bg-rgb(22,27,34)/80 dark:bg-rgb(22,27,34)/80 border-rgb(0,255,255)/20 overflow-hidden animate-on-scroll scroll-reveal-delay-100" // Using animate-on-scroll
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

                        <div className="p-6 min-h-[400px]">
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    {/* Overall Score Section */}
                                    <div
                                        ref={(el) => (elementsRef.current[2] = el)}
                                        className="animate-on-scroll scroll-reveal-delay-200" // Using animate-on-scroll
                                    >
                                        <h2 className="text-3xl font-bold mb-6">
                                            <span className="bg-gradient-to-r from-rgb(0,255,255) via-rgb(156,39,176) to-rgb(0,255,255) bg-clip-text text-transparent bg-300% animate-gradient-shift">
                                                Overall ATS Score
                                            </span>
                                        </h2>
                                        <div className="backdrop-blur-sm bg-rgb(22,27,34)/60 dark:bg-rgb(22,27,34)/60 rounded-2xl p-6 border border-rgb(0,255,255)/10">
                                            <ScoreCard // Using ScoreCard component
                                                score={analysis.overall_score}
                                                label="Overall ATS Score"
                                            />
                                        </div>
                                    </div>

                                    {/* Score Breakdown */}
                                    <div
                                        ref={(el) => (elementsRef.current[3] = el)}
                                        className="mb-12 animate-on-scroll scroll-reveal-delay-300" // Using animate-on-scroll
                                    >
                                        <h3 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            📊 Score Breakdown
                                        </h3>
                                        <div className="backdrop-blur-sm bg-rgb(22,27,34)/60 dark:bg-rgb(22,27,34)/60 rounded-2xl p-6 border border-rgb(0,255,255)/10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {Object.entries(analysis.detailed_scores).map(([category, score], index) => (
                                                    <div key={category} className="animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
                                                        {renderScoreGauge(score, `${category.charAt(0).toUpperCase() + category.slice(1)}`, index)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Format Analysis Section */}
                                    <div
                                        ref={(el) => (elementsRef.current[4] = el)}
                                        className="animate-on-scroll scroll-reveal-delay-400" // Using animate-on-scroll
                                    >
                                        <FormatAnalysis format={analysis.format} /> {/* Using FormatAnalysis component */}
                                    </div>

                                </div>
                            )}

                            {activeTab === 'keywords' && (
                                <div ref={(el) => (elementsRef.current[5] = el)} className="animate-on-scroll scroll-reveal-delay-0">
                                    <KeywordMatch
                                        matchedKeywords={analysis.matchedKeywords}
                                        missingKeywords={analysis.missingKeywords}
                                        jobDescription={analysis.jobDescription}
                                    />
                                </div>
                            )}

                            {activeTab === 'suggestions' && (
                                <div ref={(el) => (elementsRef.current[6] = el)} className="animate-on-scroll scroll-reveal-delay-0">
                                    <SuggestionsList suggestions={analysis.improvementSuggestions} />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Next Steps */}
                    <Card
                        ref={(el) => (elementsRef.current[7] = el)}
                        className="backdrop-blur-lg bg-rgb(22,27,34)/80 dark:bg-rgb(22,27,34)/80 border-rgb(0,255,255)/20 transition-all duration-700 animate-on-scroll scroll-reveal-delay-500" // Using animate-on-scroll
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
                                to="/resume/build" {/* Link to the primary resume builder page */}
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
                                to="/ats/scan" {/* Link back to the scan initiation page */}
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

AnalysisView.propTypes = {
    // analysis prop is no longer received directly; it's fetched internally.
    // However, if you want to define the *shape* of the analysis data, you can still do so.
    analysisId: PropTypes.string // analysisId is obtained from useParams
};

export default AnalysisView;