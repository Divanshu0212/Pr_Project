import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { FaPlus, FaEye, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SummaryApi from '../../config'; // Assuming SummaryApi has ATS history endpoints

const AtsHistoryPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { isDark } = useTheme();
    const queryClient = useQueryClient();

    // Fetch all past ATS analysis reports for the current user
    const { data: analysesData, isLoading, isError, error } = useQuery(
        ['atsHistory', currentUser?.uid], // Query key depends on user ID
        async () => {
            if (!currentUser?.uid) return []; // Don't fetch if no user ID

            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.ats.history.url, {
                method: SummaryApi.ats.history.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Handle specific HTTP statuses if needed (e.g., 404 means no history)
                if (response.status === 404 || response.status === 204) {
                    return [];
                }
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to fetch ATS history');
            }
            return response.json();
        },
        {
            enabled: !!currentUser?.uid, // Only run query if currentUser.uid is available
            staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
            cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
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
                queryClient.invalidateQueries(['atsHistory']); // Invalidate cache to refetch history
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

    const analyses = analysesData || [];

    return (
        <DashboardLayout>
            <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8 animate-fade-in-up">
                        <h1 className={`text-4xl font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>ATS Analysis History</h1>
                        <Button
                            onClick={() => navigate('/ats/scan')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                                isDark
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-400/30'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30'
                            }`}
                        >
                            <FaPlus className="mr-2" /> Start New Analysis
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader /> {/* Your Loader component */}
                            <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loading analysis history...</p>
                        </div>
                    ) : isError ? (
                        <Card className={`text-center p-8 ${isDark ? 'bg-gray-800 text-red-400' : 'bg-red-50 text-red-700'} border border-red-500`}>
                            <p className="text-lg font-semibold mb-4">Error loading history:</p>
                            <p>{error?.message || "An unexpected error occurred."}</p>
                            <Button
                                onClick={() => queryClient.invalidateQueries(['atsHistory'])}
                                className={`mt-6 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Try Again
                            </Button>
                        </Card>
                    ) : analyses.length === 0 ? (
                        <Card className={`text-center p-8 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                            <p className="text-xl font-semibold mb-4">No past analyses found!</p>
                            <p className="mb-6">Analyze your resume against job descriptions to keep track of your optimization efforts.</p>
                            <Button
                                onClick={() => navigate('/ats/scan')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                                    isDark
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-400/30'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30'
                                }`}
                            >
                                <FaPlus className="mr-2" /> Start Your First Analysis
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {analyses.map(analysis => (
                                <Card key={analysis._id} className={`p-6 relative group transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div>
                                            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{analysis.jobTitle || 'Untitled Analysis'}</h2>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Analyzed on: {analysis.analysis_timestamp ? format(new Date(analysis.analysis_timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex items-center mt-3 md:mt-0">
                                            <span className={`text-3xl font-bold mr-4 ${
                                                analysis.overall_score >= 80 ? (isDark ? 'text-green-400' : 'text-green-600') :
                                                analysis.overall_score >= 50 ? (isDark ? 'text-yellow-400' : 'text-yellow-600') :
                                                (isDark ? 'text-red-400' : 'text-red-600')
                                            }`}>
                                                {Math.round(analysis.overall_score)}%
                                            </span>
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/ats/analysis/${analysis._id}`}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${isDark ? 'bg-cyan-600/30 text-cyan-200 hover:bg-cyan-500/40' : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}
                                                >
                                                    <FaEye size={14} /> View Report
                                                </Link>
                                                <Button
                                                    onClick={() => handleDeleteAnalysis(analysis._id)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${isDark ? 'bg-red-600/30 text-red-200 hover:bg-red-500/40' : 'bg-red-200 text-red-800 hover:bg-red-300'}`}
                                                    disabled={deleteAnalysisMutation.isLoading}
                                                >
                                                    <FaTrash size={14} /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

AtsHistoryPage.propTypes = {
    // No direct props are passed down from a parent component for this page.
    // It fetches its own data based on AuthContext.currentUser.
};

export default AtsHistoryPage;