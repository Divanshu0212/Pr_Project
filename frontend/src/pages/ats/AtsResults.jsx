import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Target, 
    TrendingUp, 
    CheckCircle, 
    AlertTriangle, 
    Clock,
    FileText,
    Star,
    Zap,
    BarChart3,
    Download
} from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import CodingProfilesSection from '../../components/CodingProfilesClean';
import { useTheme } from '../../context/ThemeContext';

const AtsResults = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get analysis result from localStorage
        const storedResult = localStorage.getItem('atsAnalysisResult');
        if (storedResult) {
            try {
                const data = JSON.parse(storedResult);
                setAnalysisData(data);
            } catch (error) {
                console.error('Error parsing analysis result:', error);
                navigate('/ats');
            }
        } else {
            navigate('/ats');
        }
        setLoading(false);
    }, [navigate]);

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-green-500';
        if (score >= 70) return 'text-blue-500';
        if (score >= 55) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreGradient = (score) => {
        if (score >= 85) return 'from-green-500 to-emerald-500';
        if (score >= 70) return 'from-blue-500 to-cyan-500';
        if (score >= 55) return 'from-orange-500 to-yellow-500';
        return 'from-red-500 to-pink-500';
    };

    const downloadReport = () => {
        if (!analysisData) return;
        
        const reportData = {
            timestamp: new Date().toISOString(),
            analysis: analysisData
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ats-analysis-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!analysisData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="p-8 text-center">
                        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-4">No Analysis Data Found</h2>
                        <p className="text-gray-600 mb-6">Please upload a resume to get your ATS analysis.</p>
                        <Button onClick={() => navigate('/ats')} className="bg-blue-500 hover:bg-blue-600">
                            Start New Analysis
                        </Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={`min-h-screen transition-colors duration-300 ${
                isDark
                    ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
                    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'
            }`}>
                <div className="p-6 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <Button
                                onClick={() => navigate('/ats')}
                                variant="outline"
                                className="mr-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Upload
                            </Button>
                            <div>
                                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    ATS Analysis Results
                                </h1>
                                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Analysis completed on {new Date(analysisData.analysis_timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button onClick={downloadReport} variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                            <Button onClick={() => navigate('/ats')} className="bg-gradient-to-r from-cyan-500 to-purple-500">
                                <Zap className="w-4 h-4 mr-2" />
                                New Analysis
                            </Button>
                        </div>
                    </div>

                    {/* Quick Action Items */}
                    <Card className={`mb-8 backdrop-blur-sm ${
                        isDark ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30' : 'bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-200'
                    }`}>
                        <div className="p-6">
                            <h3 className={`text-xl font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                                Top Priority Actions
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Priority based on scores */}
                                {analysisData.detailed_scores && Object.entries(analysisData.detailed_scores)
                                    .filter(([, score]) => score < 75)
                                    .sort(([, a], [, b]) => a - b)
                                    .slice(0, 3)
                                    .map(([category, score], index) => (
                                    <div key={category} className={`p-4 rounded-lg ${
                                        isDark ? 'bg-gray-700/30 border border-gray-600/30' : 'bg-white/70 border border-gray-200'
                                    }`}>
                                        <div className="flex items-center mb-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                                score < 50 ? 'bg-red-500' : score < 70 ? 'bg-orange-500' : 'bg-yellow-500'
                                            }`}>
                                                <span className="text-white text-xs font-bold">{index + 1}</span>
                                            </div>
                                            <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {category}
                                            </span>
                                        </div>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Current Score: <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Overall Score */}
                    <Card className={`mb-8 backdrop-blur-sm ${
                        isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                    }`}>
                        <div className="p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Overall ATS Score
                                    </h2>
                                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {analysisData.score_level} • {analysisData.analysis_method}
                                    </p>
                                </div>
                                
                                <div className="text-center">
                                    <div className={`text-6xl font-bold mb-2 bg-gradient-to-r ${getScoreGradient(analysisData.overall_score)} bg-clip-text text-transparent`}>
                                        {analysisData.overall_score}
                                    </div>
                                    <div className={`text-sm font-medium ${getScoreColor(analysisData.overall_score)}`}>
                                        {analysisData.score_level}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className={`flex items-center p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                    <FileText className="w-8 h-8 text-blue-500 mr-3" />
                                    <div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Word Count</p>
                                        <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {analysisData.metrics?.word_count || analysisData.word_count}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className={`flex items-center p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                    <Clock className="w-8 h-8 text-green-500 mr-3" />
                                    <div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Analysis Time</p>
                                        <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {analysisData.metrics?.analysis_time_seconds || 'N/A'}s
                                        </p>
                                    </div>
                                </div>
                                
                                <div className={`flex items-center p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                    <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
                                    <div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Job Match</p>
                                        <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {analysisData.metrics?.text_similarity_to_job ? 
                                                `${Math.round(analysisData.metrics.text_similarity_to_job * 100)}%` : 
                                                'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Detailed Scores */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <Card className={`backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                        }`}>
                            <div className="p-6">
                                <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    <BarChart3 className="w-6 h-6 mr-2" />
                                    Score Breakdown
                                </h3>
                                
                                <div className="space-y-4">
                                    {Object.entries(analysisData.detailed_scores).map(([category, score]) => (
                                        <div key={category}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {category}
                                                </span>
                                                <span className={`font-bold ${getScoreColor(score)}`}>
                                                    {score}%
                                                </span>
                                            </div>
                                            <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : ''}`}>
                                                <div
                                                    className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Feedback Section */}
                        <Card className={`backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                        }`}>
                            <div className="p-6">
                                <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    <Star className="w-6 h-6 mr-2" />
                                    Key Insights
                                </h3>
                                
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {Object.entries(analysisData.feedback).map(([category, feedbackList]) => {
                                        // Handle different feedback types
                                        if (category === "Detailed Insights") {
                                            return (
                                                <div key={category} className="border-t pt-4">
                                                    <h4 className={`font-semibold mb-3 text-lg ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                                                        💡 {category}
                                                    </h4>
                                                    {Object.entries(feedbackList).map(([insightCategory, insights]) => (
                                                        <div key={insightCategory} className="mb-4">
                                                            <h5 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                {insightCategory}
                                                            </h5>
                                                            <div className="space-y-1 ml-2">
                                                                {insights.map((insight, index) => (
                                                                    <div key={index} className="flex items-start">
                                                                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                                                        <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                            {insight}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        } else if (category === "AI Analysis") {
                                            return (
                                                <div key={category} className="border-t pt-4">
                                                    <h4 className={`font-semibold mb-3 text-lg ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                                        🤖 {category}
                                                    </h4>
                                                    <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                                                        {feedbackList.map((feedback, index) => (
                                                            <div key={index} className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {feedback.replace(/^🤖\s*/, '')}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={category}>
                                                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                        {category}
                                                    </h4>
                                                    <div className="space-y-1">
                                                        {feedbackList.map((feedback, index) => (
                                                            <div key={index} className="flex items-start">
                                                                {feedback.startsWith('✓') ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                ) : (
                                                                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                )}
                                                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                    {feedback.replace(/^[✓⚠✗🤖]\s*/u, '')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Additional Metrics */}
                    {analysisData.metrics && (
                        <Card className={`backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                        }`}>
                            <div className="p-6">
                                <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    <Target className="w-6 h-6 mr-2" />
                                    Advanced Metrics
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sentence Count</p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {analysisData.metrics.sentence_count}
                                        </p>
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Sentence Length</p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {Math.round(analysisData.metrics.avg_sentence_length)}
                                        </p>
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Readability Score</p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {Math.round(analysisData.metrics.readability_score)}
                                        </p>
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Job Similarity</p>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {Math.round((analysisData.metrics.text_similarity_to_job || 0) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Improvement Roadmap */}
                    {analysisData.feedback && analysisData.feedback["Detailed Insights"] && (
                        <Card className={`mb-8 backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                        }`}>
                            <div className="p-6">
                                <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    <Target className="w-6 h-6 mr-2" />
                                    Personalized Improvement Roadmap
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.entries(analysisData.feedback["Detailed Insights"]).map(([category, suggestions], index) => (
                                        <div key={category} className={`p-5 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                                            <h4 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-r ${
                                                    index % 4 === 0 ? 'from-cyan-500 to-blue-500' :
                                                    index % 4 === 1 ? 'from-blue-500 to-purple-500' :
                                                    index % 4 === 2 ? 'from-purple-500 to-pink-500' :
                                                    'from-pink-500 to-cyan-500'
                                                }`}>
                                                    <span className="text-white text-sm font-bold">{index + 1}</span>
                                                </div>
                                                {category}
                                            </h4>
                                            
                                            <div className="space-y-2">
                                                {suggestions.map((suggestion, suggestionIndex) => (
                                                    <div key={suggestionIndex} className="flex items-start">
                                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0 bg-gradient-to-r ${
                                                            index % 4 === 0 ? 'from-cyan-500 to-blue-500' :
                                                            index % 4 === 1 ? 'from-blue-500 to-purple-500' :
                                                            index % 4 === 2 ? 'from-purple-500 to-pink-500' :
                                                            'from-pink-500 to-cyan-500'
                                                        }`}></div>
                                                        <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {suggestion}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* AI Recommendations */}
                    {analysisData.feedback && analysisData.feedback["AI Analysis"] && (
                        <Card className={`mb-8 backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                        }`}>
                            <div className="p-6">
                                <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                                        <span className="text-white text-lg">🤖</span>
                                    </div>
                                    AI-Powered Recommendations
                                </h3>
                                
                                <div className={`p-6 rounded-xl border-2 border-dashed ${
                                    isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-300 bg-purple-50'
                                }`}>
                                    {analysisData.feedback["AI Analysis"].map((recommendation, index) => (
                                        <div key={index} className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
                                            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                                isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                {recommendation.replace(/^🤖\s*/, '')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* AI Insights Section */}
                    {analysisData.detailed_insights && (
                        <div className="mb-8">
                            <Card className={`backdrop-blur-sm ${
                                isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                            }`}>
                                <div className="p-8">
                                    <h2 className={`text-2xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        <Zap className="w-6 h-6 mr-3" />
                                        AI-Powered Recommendations
                                    </h2>

                                    {/* Executive Summary */}
                                    {analysisData.detailed_insights.executive_summary && (
                                        <div className={`mb-8 p-6 rounded-xl ${
                                            isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                Executive Summary
                                            </h3>
                                            <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {analysisData.detailed_insights.executive_summary.message}
                                            </p>
                                            
                                            {/* Strengths and Weaknesses */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                {analysisData.detailed_insights.executive_summary.strengths?.length > 0 && (
                                                    <div>
                                                        <h4 className={`font-semibold mb-2 text-green-600 ${isDark ? 'text-green-400' : ''}`}>
                                                            Strengths
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {analysisData.detailed_insights.executive_summary.strengths.map((strength, index) => (
                                                                <li key={index} className="flex items-start">
                                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {strength}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                
                                                {analysisData.detailed_insights.executive_summary.areas_for_improvement?.length > 0 && (
                                                    <div>
                                                        <h4 className={`font-semibold mb-2 text-orange-600 ${isDark ? 'text-orange-400' : ''}`}>
                                                            Areas for Improvement
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {analysisData.detailed_insights.executive_summary.areas_for_improvement.map((area, index) => (
                                                                <li key={index} className="flex items-start">
                                                                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {area}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Priority Improvements */}
                                    {analysisData.detailed_insights.priority_improvements?.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                🎯 Priority Improvements
                                            </h3>
                                            <div className="space-y-4">
                                                {analysisData.detailed_insights.priority_improvements.map((improvement, index) => (
                                                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                                                        improvement.priority === 'High' 
                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                            : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                    }`}>
                                                        <div className="flex items-center mb-2">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold mr-3 ${
                                                                improvement.priority === 'High'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                                                            }`}>
                                                                {improvement.priority} Priority
                                                            </span>
                                                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                                {improvement.category}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            <strong>Issue:</strong> {improvement.issue}
                                                        </p>
                                                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            <strong>Impact:</strong> {improvement.impact}
                                                        </p>
                                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            <strong>Quick Fix:</strong> {improvement.quick_fix}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Detailed Recommendations */}
                                    {analysisData.detailed_insights.detailed_recommendations && (
                                        <div className="mb-8">
                                            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                📋 Detailed Recommendations
                                            </h3>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {Object.entries(analysisData.detailed_insights.detailed_recommendations).map(([category, recommendations]) => (
                                                    <div key={category} className={`p-4 rounded-lg ${
                                                        isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                                                    }`}>
                                                        <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                            {category}
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {recommendations.map((rec, index) => (
                                                                <div key={index} className={`p-3 rounded ${
                                                                    isDark ? 'bg-gray-800/50' : 'bg-white'
                                                                }`}>
                                                                    <div className="flex items-center mb-2">
                                                                        <span className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                                                                            rec.priority === 'High' 
                                                                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                                                : rec.priority === 'Medium'
                                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                                                : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                        }`}>
                                                                            {rec.priority}
                                                                        </span>
                                                                        <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                            {rec.type}
                                                                        </span>
                                                                    </div>
                                                                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {rec.suggestion}
                                                                    </p>
                                                                    {rec.example && (
                                                                        <div className={`text-xs p-2 rounded ${
                                                                            isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                                                        }`}>
                                                                            <strong>Example:</strong> {rec.example}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Plan */}
                                    {analysisData.detailed_insights.action_plan?.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                📅 Step-by-Step Action Plan
                                            </h3>
                                            <div className="space-y-4">
                                                {analysisData.detailed_insights.action_plan.map((phase, index) => (
                                                    <div key={index} className={`p-4 rounded-lg ${
                                                        isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                                                    }`}>
                                                        <h4 className={`font-semibold mb-3 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            {phase.timeline}
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {phase.actions.map((action, actionIndex) => (
                                                                <li key={actionIndex} className="flex items-start">
                                                                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {action}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Examples */}
                                    {analysisData.detailed_insights.examples && (
                                        <div>
                                            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                💡 Before & After Examples
                                            </h3>
                                            <div className="space-y-6">
                                                {Object.entries(analysisData.detailed_insights.examples).map(([category, exampleList]) => (
                                                    <div key={category}>
                                                        <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {exampleList.map((example, index) => (
                                                                <div key={index} className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg ${
                                                                    isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                                                                }`}>
                                                                    <div className={`p-3 rounded ${
                                                                        isDark ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'
                                                                    }`}>
                                                                        <h5 className="text-sm font-semibold text-red-600 mb-2">Before:</h5>
                                                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                            {example.before}
                                                                        </p>
                                                                    </div>
                                                                    <div className={`p-3 rounded ${
                                                                        isDark ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50 border border-green-200'
                                                                    }`}>
                                                                        <h5 className="text-sm font-semibold text-green-600 mb-2">After:</h5>
                                                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                            {example.after}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Job Match Analysis */}
                    {analysisData.job_match_analysis && (
                        <Card className={`mb-8 backdrop-blur-sm ${
                            isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/30'
                        }`}>
                            <div className="p-6">
                                <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    <Target className="w-6 h-6 mr-2" />
                                    Job Match Analysis
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Overall Match Score */}
                                    <div className="lg:col-span-1">
                                        <div className="text-center">
                                            <div className={`text-4xl font-bold mb-2 ${
                                                analysisData.job_match_analysis.match_level.color === 'green' ? 'text-green-500' :
                                                analysisData.job_match_analysis.match_level.color === 'blue' ? 'text-blue-500' :
                                                analysisData.job_match_analysis.match_level.color === 'orange' ? 'text-orange-500' :
                                                'text-red-500'
                                            }`}>
                                                {analysisData.job_match_analysis.overall_match}%
                                            </div>
                                            <div className={`text-lg font-semibold mb-2 ${
                                                analysisData.job_match_analysis.match_level.color === 'green' ? 'text-green-600' :
                                                analysisData.job_match_analysis.match_level.color === 'blue' ? 'text-blue-600' :
                                                analysisData.job_match_analysis.match_level.color === 'orange' ? 'text-orange-600' :
                                                'text-red-600'
                                            }`}>
                                                {analysisData.job_match_analysis.match_level.level}
                                            </div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {analysisData.job_match_analysis.match_level.description}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Component Scores */}
                                    <div className="lg:col-span-2">
                                        <h4 className={`font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            Detailed Match Breakdown
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(analysisData.job_match_analysis.component_scores).map(([component, score]) => (
                                                <div key={component}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            {component.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                                                            {score}%
                                                        </span>
                                                    </div>
                                                    <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : ''}`}>
                                                        <div
                                                            className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
                                                            style={{ width: `${score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Missing Keywords */}
                                {analysisData.job_match_analysis.missing_keywords && 
                                 analysisData.job_match_analysis.missing_keywords.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            Missing Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisData.job_match_analysis.missing_keywords.slice(0, 10).map((keyword, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-3 py-1 rounded-full text-sm ${
                                                        isDark 
                                                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                                                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                                                    }`}
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Consider incorporating these keywords from the job description into your resume.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Match Recommendations */}
                                {analysisData.job_match_analysis.recommendations && 
                                 analysisData.job_match_analysis.recommendations.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            Improvement Recommendations
                                        </h4>
                                        <div className="space-y-3">
                                            {analysisData.job_match_analysis.recommendations.map((rec, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-3 rounded-lg border-l-4 ${
                                                        rec.priority === 'High' 
                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                                    }`}
                                                >
                                                    <div className="flex items-start">
                                                        <div className={`px-2 py-1 rounded text-xs font-medium mr-3 ${
                                                            rec.priority === 'High'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                                                        }`}>
                                                            {rec.priority}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                {rec.category}
                                                            </p>
                                                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                {rec.suggestion}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Coding Profiles Analysis */}
                    {analysisData.coding_profiles_analysis && (
                        <div className="mb-8">
                            <CodingProfilesSection codingAnalysis={analysisData.coding_profiles_analysis} />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AtsResults;
