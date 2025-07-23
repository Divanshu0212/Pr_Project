import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DashboardLayout from '../../components/layouts/DashboardLayout'; // Your DashboardLayout component
import PortfolioDetailsForm from './PortfolioDetailsForm'; // Your PortfolioDetailsForm component
import { useTheme } from '../../context/ThemeContext'; // Your ThemeContext
import { useAuth } from '../../hooks/useAuth'; // Import useAuth to get currentUser

const ProfileSettingsPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { currentUser } = useAuth(); // Get the current user from AuthContext

    // Function to handle the close action from PortfolioDetailsForm
    const handleCloseForm = () => {
        navigate('/portfolio'); // Navigate back to the main portfolio dashboard
    };

    return (
        // Pass the currentUser to DashboardLayout
        <DashboardLayout user={currentUser}>
            <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-6xl mx-auto">
                    {/* Page Title */}
                    <h1 className={`text-4xl font-bold mb-8 animate-fade-in-up ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                        Edit Profile Details
                    </h1>

                    {/* Wrapper for PortfolioDetailsForm */}
                    {/* The PortfolioDetailsForm itself has styling and background,
                        so we just need a minimal wrapper here. */}
                    <div className="relative z-10">
                        <PortfolioDetailsForm onClose={handleCloseForm} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

ProfileSettingsPage.propTypes = {
    // Add PropTypes for the user prop if you decide to pass it directly to this component
    // For now, it's fetched internally, so no direct props needed for this component.
};

export default ProfileSettingsPage;
