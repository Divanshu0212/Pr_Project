import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaPlus, FaCertificate, FaArrowLeft } from 'react-icons/fa'; // Added FaArrowLeft
import { MdClose } from 'react-icons/md'; // For modal close button
import DashboardLayout from '../../components/layouts/DashboardLayout'; // Provided context
import Button from '../../components/common/Button'; // Provided context
import Card from '../../components/common/Card'; // Provided context
import Loader from '../../components/common/Loader'; // Provided context
import CertificateCard from '../../components/portfolio/CertificateCard'; // Provided context
import AddCertificateForm from '../../components/portfolio/AddCertificateForm'; // Provided context
import { AuthContext } from '../../context/AuthContext'; // Provided context
import { useTheme } from '../../context/ThemeContext'; // Provided context
import SummaryApi from '../../config'; // Provided context

const CertificatesPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { isDark } = useTheme();
    const queryClient = useQueryClient(); // For invalidating queries on data change

    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);

    // Fetch all certificates for the current user
    const { data: certificatesData, isLoading, isError, error, refetch } = useQuery(
        'certificates', // Query key depends on user ID
        async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.certificates.get.url, {
                method: SummaryApi.certificates.get.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to fetch certificates');
            }
            return response.json();
        },
        {
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            retry: 2
        }
    );

    // Mutation for adding/updating a certificate
    const certificateMutation = useMutation(
        async ({ formData, isEditing, certificateId }) => {
            const token = localStorage.getItem('token');
            const baseUrl = SummaryApi.baseUrl || ''; // Ensure you have this in your config
            const endpoint = isEditing
                ? `${SummaryApi.certificates.update.url(`${certificateId}`)}`
                : SummaryApi.certificates.add.url;

            const url = `${baseUrl}${endpoint}`;
            const method = isEditing
                ? SummaryApi.certificates.update.method
                : SummaryApi.certificates.add.method;

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Failed to process certificate';
                try {
                    const errorBody = JSON.parse(errorText);
                    errorMessage = errorBody.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }
            const text = await response.text();
            return text ? JSON.parse(text) : { success: true };
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['certificates']); // Invalidate cache to refetch certificates
                setShowCertificateForm(false);
                setEditingCertificate(null); // Clear editing state
                alert('Certificate saved successfully!');
            },
            onError: (err) => {
                alert(`Error saving certificate: ${err.message}`);
            },
        }
    );

    // Mutation for deleting a certificate
    const deleteCertificateMutation = useMutation(
        async (certificateId) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${SummaryApi.certificates.delete.url}/${certificateId}`, {
                method: SummaryApi.certificates.delete.method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to delete certificate');
            }
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['certificates']); // Invalidate cache to refetch certificates
                alert('Certificate deleted successfully!');
            },
            onError: (err) => {
                alert(`Error deleting certificate: ${err.message}`);
            },
        }
    );


    const certificates = certificatesData?.certificates || []; // Access certificates array
    
    const handleAddCertificate = () => {
        setEditingCertificate(null); // Clear any previous editing data
        setShowCertificateForm(true);
    };

    const handleEditCertificate = (certificate) => {
        setEditingCertificate(certificate);
        setShowCertificateForm(true);
    };

    const handleDeleteCertificate = (certificateId) => {
        if (window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
            deleteCertificateMutation.mutate(certificateId);
        }
    };

    const handleCertificateFormSubmit = async (formData) => {
        try {
            const isEditing = !!editingCertificate;
            await certificateMutation.mutateAsync({
                formData,
                isEditing,
                certificateId: editingCertificate?._id
            });
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <DashboardLayout user={currentUser}>
            <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8 animate-fade-in-up">
                        <button
                            onClick={() => navigate('/portfolio')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${isDark ? 'text-cyan-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-200'}`}
                        >
                            <FaArrowLeft /> Back to Portfolio
                        </button>
                        <Button
                            onClick={handleAddCertificate}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${isDark
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-400/30'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30'
                                }`}
                            disabled={certificateMutation.isLoading}
                        >
                            <div className="flex items-center">
                                <FaPlus className="mr-2" /> Add Certificate
                            </div>
                        </Button>
                    </div>

                    <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-cyan-400' : 'text-blue-600'} animate-fade-in-up`}>My Certificates</h1>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader /> {/* Your Loader component */}
                            <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loading certificates...</p>
                        </div>
                    ) : isError ? (
                        <Card className={`text-center p-8 ${isDark ? 'bg-gray-800 text-red-400' : 'bg-red-50 text-red-700'} border border-red-500`}>
                            <p className="text-lg font-semibold mb-4">Error loading certificates:</p>
                            <p>{error?.message || "An unexpected error occurred."}</p>
                            <Button
                                onClick={() => refetch()} // Refetch on button click
                                className={`mt-6 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Try Again
                            </Button>
                        </Card>
                    ) : certificates.length === 0 ? (
                        <Card className={`text-center p-8 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                            <FaCertificate size={64} className={`mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <p className="text-xl font-semibold mb-4">No certificates added yet!</p>
                            <p className="mb-6">Showcase your professional development and achievements by adding your certificates.</p>
                            <Button
                                onClick={handleAddCertificate}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${isDark
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-400/30'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <FaPlus className="mr-2" /> Add Certificate
                                </div>
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                            {certificates.map((certificate) => (
                                <CertificateCard
                                    key={certificate._id}
                                    certificate={certificate}
                                    onEdit={handleEditCertificate}
                                    onDelete={handleDeleteCertificate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Certificate Form Modal */}
            {showCertificateForm && (
                <AddCertificateForm
                    onClose={() => {
                        setShowCertificateForm(false);
                        setEditingCertificate(null); // Reset editing state on close
                    }}
                    onSubmit={handleCertificateFormSubmit}
                    initialData={editingCertificate}
                    isEditing={!!editingCertificate}
                />
            )}
        </DashboardLayout>
    );
};

CertificatesPage.propTypes = {
    // No direct props are passed down from a parent component for this page.
    // It fetches its own data.
};

export default CertificatesPage;