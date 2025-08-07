import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { 
    FaPlus, 
    FaEye, 
    FaTrash, 
    FaChartLine, 
    FaArrowUp, 
    FaArrowDown,
    FaCalendarAlt,
    FaFilter
} from 'react-icons/fa';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from 'recharts';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SummaryApi from '../../config';

const AtsHistoryPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { isDark } = useTheme();
    const queryClient = useQueryClient();
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [chartType, setChartType] = useState('line');

    // Fetch ATS score history
    const { data: scoreHistoryData, isLoading: isLoadingHistory } = useQuery(
        ['atsScoreHistory', currentUser?.id || currentUser?.uid || currentUser?._id, selectedPeriod],
        async () => {
            if (!currentUser?.id && !currentUser?.uid && !currentUser?._id) return { data: { history: [], statistics: {} } };

            const token = localStorage.getItem('token');
            const response = await fetch(`${SummaryApi.ats.scoreHistory?.url || '/api/ats/score-history'}?period=${selectedPeriod}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404 || response.status === 204) {
                    return { data: { history: [], statistics: {} } };
                }
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to fetch ATS score history');
            }
            return response.json();
        },
        {
            enabled: !!(currentUser?.id || currentUser?.uid || currentUser?._id),
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    );

    // Fetch ATS trends
    const { data: trendsData, isLoading: isLoadingTrends } = useQuery(
        ['atsScoreTrends', currentUser?.id || currentUser?.uid || currentUser?._id],
        async () => {
            if (!currentUser?.id && !currentUser?.uid && !currentUser?._id) return { data: { trends: [], categoryTrends: {}, insights: [] } };

            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.ats.scoreTrends?.url || '/api/ats/score-trends', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404 || response.status === 204) {
                    return { data: { trends: [], categoryTrends: {}, insights: [] } };
                }
                throw new Error('Failed to fetch trends');
            }
            return response.json();
        },
        {
            enabled: !!(currentUser?.id || currentUser?.uid || currentUser?._id),
            staleTime: 5 * 60 * 1000,
        }
    );

    // Fetch all past ATS analysis reports
    const { data: analysesData, isLoading: isLoadingAnalyses, isError, error } = useQuery(
        ['atsHistory', currentUser?.id || currentUser?.uid || currentUser?._id],
        async () => {
            if (!currentUser?.id && !currentUser?.uid && !currentUser?._id) return { history: [] };

            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.ats.history.url, {
                method: SummaryApi.ats.history.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404 || response.status === 204) {
                    return { history: [] };
                }
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to fetch ATS history');
            }
            const result = await response.json();
            return result;
        },
        {
            enabled: !!(currentUser?.id || currentUser?.uid || currentUser?._id),
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    );

    // Mutation for deleting an analysis report
    const deleteAnalysisMutation = useMutation(
        async (analysisId) => {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.ats.delete.url(analysisId), {
                method: SummaryApi.ats.delete.method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to delete analysis report');
            }
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['atsHistory']);
                queryClient.invalidateQueries(['atsScoreHistory']);
                queryClient.invalidateQueries(['atsScoreTrends']);
                alert('Analysis report deleted successfully!');
            },
            onError: (err) => {
                alert(`Error deleting report: ${err.message}`);
            },
        }
    );

    const handleDeleteAnalysis = (analysisId) => {
        if (window.confirm('Are you sure you want to delete this analysis report? This action cannot be undone.')) {
            deleteAnalysisMutation.mutate(analysisId);
        }
    };

    // Prepare chart data
    const chartData = scoreHistoryData?.data?.history?.map((entry) => ({
        date: format(new Date(entry.analysisDate), 'MMM dd'),
        fullDate: entry.analysisDate,
        score: entry.overallScore,
        keywords: entry.detailedScores?.keywords || 0,
        formatting: entry.detailedScores?.formatting || 0,
        experience: entry.detailedScores?.experience || 0,
        skills: entry.detailedScores?.skills || 0,
        education: entry.detailedScores?.education || 0,
        summary: entry.detailedScores?.summary || 0,
        resumeTitle: entry.resumeTitle,
        jobTitle: entry.jobTitle
    }))?.reverse() || [];

    const statistics = scoreHistoryData?.data?.statistics || {};
    const insights = trendsData?.data?.insights || [];
    const analyses = Array.isArray(analysesData?.history) ? analysesData.history : []; // Ensure it's always an array

    const isLoading = isLoadingHistory || isLoadingTrends || isLoadingAnalyses;

    // Custom tooltip for charts
    // eslint-disable-next-line react/prop-types
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className={`p-3 rounded-lg shadow-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}>
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm text-gray-500">{format(new Date(data.fullDate), 'MMM dd, yyyy')}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}%
                        </p>
                    ))}
                    {data.resumeTitle && (
                        <p className="text-xs text-gray-400 mt-1">Resume: {data.resumeTitle}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="h-64 flex items-center justify-center">
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No score history data to display
                    </p>
                </div>
            );
        }

        const commonProps = {
            width: '100%',
            height: 300,
            data: chartData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (chartType) {
            case 'area':
                return (
                    <ResponsiveContainer {...commonProps}>
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                                dataKey="date" 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                fontSize={12}
                            />
                            <YAxis 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                fontSize={12}
                                domain={[0, 100]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#06b6d4" 
                                fill={isDark ? '#06b6d4' : '#0891b2'}
                                fillOpacity={0.3}
                                name="Overall Score"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'bar':
                return (
                    <ResponsiveContainer {...commonProps}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                                dataKey="date" 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                fontSize={12}
                            />
                            <YAxis 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                fontSize={12}
                                domain={[0, 100]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="score" fill="#06b6d4" name="Overall Score" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <ResponsiveContainer {...commonProps}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                                dataKey="date" 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                fontSize={12}
                            />
                            <YAxis 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                fontSize={12}
                                domain={[0, 100]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#06b6d4" 
                                strokeWidth={3}
                                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                                name="Overall Score"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    const renderDetailedChart = () => {
        if (chartData.length === 0) return null;

        return (
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                        dataKey="date" 
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                        fontSize={12}
                    />
                    <YAxis 
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                        fontSize={12}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="keywords" stroke="#f59e0b" strokeWidth={2} name="Keywords" />
                    <Line type="monotone" dataKey="formatting" stroke="#10b981" strokeWidth={2} name="Formatting" />
                    <Line type="monotone" dataKey="experience" stroke="#8b5cf6" strokeWidth={2} name="Experience" />
                    <Line type="monotone" dataKey="skills" stroke="#ef4444" strokeWidth={2} name="Skills" />
                    <Line type="monotone" dataKey="education" stroke="#06b6d4" strokeWidth={2} name="Education" />
                    <Line type="monotone" dataKey="summary" stroke="#ec4899" strokeWidth={2} name="Summary" />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div>
            <div className={`min-h-screen transition-colors duration-300 ${
                isDark
                    ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900'
                    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'
            }`}>
                <div className="p-6 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                ATS Score History
                            </h1>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Track your resume optimization progress over time
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button onClick={() => navigate('/ats')} variant="outline">
                                <FaPlus className="w-4 h-4 mr-2" />
                                New Analysis
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader />
                            <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Loading score history...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Total Analyses
                                            </p>
                                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                {statistics.totalEntries || 0}
                                            </p>
                                        </div>
                                        <FaChartLine className="w-8 h-8 text-blue-500" />
                                    </div>
                                </Card>

                                <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Average Score
                                            </p>
                                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                {statistics.averageScore || 0}%
                                            </p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            (statistics.averageScore || 0) >= 70 ? 'bg-green-500' : 
                                            (statistics.averageScore || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                            <span className="text-white text-sm font-bold">%</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Best Score
                                            </p>
                                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                {statistics.highestScore || 0}%
                                            </p>
                                        </div>
                                        <FaArrowUp className="w-8 h-8 text-green-500" />
                                    </div>
                                </Card>

                                <Card className={`p-6 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Improvement
                                            </p>
                                            <p className={`text-2xl font-bold ${
                                                (statistics.improvement || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                                {statistics.improvement > 0 ? '+' : ''}{statistics.improvement || 0}%
                                            </p>
                                        </div>
                                        {(statistics.improvement || 0) >= 0 ? 
                                            <FaArrowUp className="w-8 h-8 text-green-500" /> : 
                                            <FaArrowDown className="w-8 h-8 text-red-500" />
                                        }
                                    </div>
                                </Card>
                            </div>

                            {/* Insights */}
                            {insights.length > 0 && (
                                <Card className={`mb-8 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                    <div className="p-6">
                                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            📊 Key Insights
                                        </h3>
                                        <div className="space-y-3">
                                            {insights.map((insight, index) => (
                                                <div 
                                                    key={index}
                                                    className={`p-3 rounded-lg border-l-4 ${
                                                        insight.type === 'positive' 
                                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                                            : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                    }`}
                                                >
                                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {insight.message}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Chart Controls */}
                            <Card className={`mb-8 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center justify-between mb-6">
                                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Score History Chart
                                        </h3>
                                        
                                        <div className="flex gap-4 mt-4 sm:mt-0">
                                            {/* Period Filter */}
                                            <div className="flex gap-2">
                                                <FaCalendarAlt className={`w-5 h-5 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <select
                                                    value={selectedPeriod}
                                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                                    className={`px-3 py-1 rounded border ${
                                                        isDark 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="all">All Time</option>
                                                    <option value="7d">Last 7 Days</option>
                                                    <option value="30d">Last 30 Days</option>
                                                    <option value="90d">Last 90 Days</option>
                                                    <option value="1y">Last Year</option>
                                                </select>
                                            </div>

                                            {/* Chart Type Filter */}
                                            <div className="flex gap-2">
                                                <FaFilter className={`w-5 h-5 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <select
                                                    value={chartType}
                                                    onChange={(e) => setChartType(e.target.value)}
                                                    className={`px-3 py-1 rounded border ${
                                                        isDark 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="line">Line Chart</option>
                                                    <option value="area">Area Chart</option>
                                                    <option value="bar">Bar Chart</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {renderChart()}
                                </div>
                            </Card>

                            {/* Detailed Scores Chart */}
                            {chartData.length > 0 && (
                                <Card className={`mb-8 ${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                    <div className="p-6">
                                        <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Detailed Score Breakdown
                                        </h3>
                                        {renderDetailedChart()}
                                    </div>
                                </Card>
                            )}

                            {/* Analysis History Table */}
                            <Card className={`${isDark ? 'bg-gray-800/30' : 'bg-white/70'}`}>
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        Analysis History
                                    </h3>
                                    
                                    {isError ? (
                                        <div className={`text-center p-8 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                                            <p className="text-lg font-semibold mb-4">Error loading history:</p>
                                            <p>{error?.message || "An unexpected error occurred."}</p>
                                            <Button
                                                onClick={() => queryClient.invalidateQueries(['atsHistory'])}
                                                className="mt-6"
                                                variant="outline"
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    ) : analyses.length === 0 ? (
                                        <div className={`text-center p-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <p className="text-xl font-semibold mb-4">No past analyses found!</p>
                                            <p className="mb-6">Analyze your resume against job descriptions to start tracking your progress.</p>
                                            <Button
                                                onClick={() => navigate('/ats')}
                                                className="bg-gradient-to-r from-cyan-500 to-purple-500"
                                            >
                                                <FaPlus className="mr-2" /> Start Your First Analysis
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {analyses.map(analysis => (
                                                <div 
                                                    key={analysis._id}
                                                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                                        isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                                        <div className="flex-1">
                                                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                {analysis.jobTitle || 'Untitled Analysis'}
                                                            </h4>
                                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {analysis.resumeTitle}
                                                            </p>
                                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                {analysis.analysis_timestamp ? 
                                                                    format(new Date(analysis.analysis_timestamp), 'MMM dd, yyyy HH:mm') : 
                                                                    'N/A'
                                                                }
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 mt-3 md:mt-0">
                                                            <div className="text-right">
                                                                <span className={`text-2xl font-bold ${
                                                                    (analysis.overall_score || 0) >= 80 ? 'text-green-500' :
                                                                    (analysis.overall_score || 0) >= 50 ? 'text-yellow-500' :
                                                                    'text-red-500'
                                                                }`}>
                                                                    {Math.round(analysis.overall_score || 0)}%
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex gap-2">
                                                                <Link
                                                                    to={`/ats/analysis/${analysis._id}`}
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                                                                        isDark 
                                                                            ? 'bg-cyan-600/30 text-cyan-200 hover:bg-cyan-500/40' 
                                                                            : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                                                                    }`}
                                                                >
                                                                    <FaEye size={14} /> View
                                                                </Link>
                                                                <Button
                                                                    onClick={() => handleDeleteAnalysis(analysis._id)}
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                                                                        isDark 
                                                                            ? 'bg-red-600/30 text-red-200 hover:bg-red-500/40' 
                                                                            : 'bg-red-200 text-red-800 hover:bg-red-300'
                                                                    }`}
                                                                    disabled={deleteAnalysisMutation.isLoading}
                                                                >
                                                                    <FaTrash size={14} /> Delete
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AtsHistoryPage;