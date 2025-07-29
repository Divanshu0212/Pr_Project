import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // Import useMutation, useQueryClient
import { format } from 'date-fns'; // For date formatting
import { FaPlus, FaEye, FaDownload, FaTrash } from 'react-icons/fa';
import { MdOutlineEdit } from 'react-icons/md'; // More common edit icon
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader'; // Assuming this is your Loader component
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const MyResumesPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { isDark } = useTheme();
    const queryClient = useQueryClient();

    // Fetch all resumes for the current user from backend (Cloudinary)
    const { data: resumesData, isLoading, isError, error } = useQuery(
        ['myResumes', currentUser?.uid],
        async () => {
            if (!currentUser?.uid) return [];
            // Use full backend URL if running on a different port
            const response = await fetch(`http://localhost:5000/api/my-resumes/${currentUser.uid}`);
            if (!response.ok) {
                if (response.status === 404 || response.status === 204) {
                    return [];
                }
                const errorBody = await response.json();
                throw new Error(errorBody.detail || 'Failed to fetch resumes');
            }
            const data = await response.json();
            // data.resumes is an array of {resume_id, cloudinary_url, created_at, public_id}
            return data.resumes;
        },
        {
            enabled: !!currentUser?.uid,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    );

    // Mutation for deleting a resume from backend (Cloudinary)
    const deleteResumeMutation = useMutation(
        async (resumeId) => {
            const response = await fetch(`/api/my-resume/${currentUser.uid}/${resumeId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.detail || 'Failed to delete resume');
            }
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['myResumes']);
                alert('Resume deleted successfully!');
            },
            onError: (err) => {
                alert(`Error deleting resume: ${err.message}`);
            },
        }
    );

    const handleDeleteResume = (resumeId) => {
        if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            deleteResumeMutation.mutate(resumeId);
        }
    };

    const handleDownloadPdf = (resumeId, url) => {
        // Open the Cloudinary URL in a new tab for download
        window.open(url, '_blank');
    };

    const resumes = resumesData || [];

    useEffect(() => {
        if (currentUser?.uid) {
            if (resumesData && resumesData.length > 0) {
                console.log('User resumes:', resumesData);
            } else {
                console.log('User resumes: 0');
            }
        }
    }, [currentUser, resumesData]);

    return (
        <DashboardLayout>
            <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8 animate-fade-in-up">
                        <h1 className={`text-4xl font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>My Resumes</h1>
                        <Button
                            onClick={() => navigate('/resume/build')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                                isDark
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-400/30'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30'
                            }`}
                        >
                            <FaPlus className="mr-2" /> Create New Resume
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader />
                            <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loading your resumes...</p>
                        </div>
                    ) : isError ? (
                        <Card className={`text-center p-8 ${isDark ? 'bg-gray-800 text-red-400' : 'bg-red-50 text-red-700'} border border-red-500`}>
                            <p className="text-lg font-semibold mb-4">Error loading resumes:</p>
                            <p>{error?.message || "An unexpected error occurred."}</p>
                            <Button
                                onClick={() => queryClient.invalidateQueries(['myResumes'])}
                                className={`mt-6 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Try Again
                            </Button>
                        </Card>
                    ) : resumes.length === 0 ? (
                        <Card className={`text-center p-8 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                            <p className="text-xl font-semibold mb-4">You haven't created any resumes yet!</p>
                            <p className="mb-6">Start building your professional profile to showcase your skills and experience.</p>
                            <Button
                                onClick={() => navigate('/resume/build')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                                    isDark
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-400/30'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30'
                                }`}
                            >
                                <FaPlus className="mr-2" /> Create Your First Resume
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resumes.map(resume => (
                                <Card key={resume.resume_id} className={`p-6 relative group transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{resume.resume_id}</h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Created: {resume.created_at ? format(new Date(resume.created_at), 'MMM dd, yyyy') : 'N/A'}</p>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <Button
                                            onClick={() => handleDownloadPdf(resume.resume_id, resume.cloudinary_url)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${isDark ? 'bg-purple-600/30 text-purple-200 hover:bg-purple-500/40' : 'bg-purple-200 text-purple-800 hover:bg-purple-300'}`}
                                        >
                                            <FaDownload size={14} /> PDF
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteResume(resume.resume_id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${isDark ? 'bg-red-600/30 text-red-200 hover:bg-red-500/40' : 'bg-red-200 text-red-800 hover:bg-red-300'}`}
                                            disabled={deleteResumeMutation.isLoading}
                                        >
                                            <FaTrash size={14} /> Delete
                                        </Button>
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

MyResumesPage.propTypes = {
    // No direct props are passed down from a parent component for this page.
    // It fetches its own data based on AuthContext.currentUser.
};

export default MyResumesPage;