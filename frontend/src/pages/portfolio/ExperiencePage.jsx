import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/fa'; // Import FaArrowLeft for the back button
import DashboardLayout from '../../components/layouts/DashboardLayout'; // Your DashboardLayout component
import ExperienceTab from '../../components/portfolio/ExperienceTab'; // Your ExperienceTab component
import Button from '../../components/common/Button'; // Your Button component
import { useTheme } from '../../context/ThemeContext'; // Your ThemeContext
import { useAuth } from '../../hooks/useAuth';

const ExperiencePage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const {currentUser} = useAuth(); // Assuming you have currentUser in your ThemeContext

    return (
        <DashboardLayout user={currentUser}>
            <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-6xl mx-auto">
                    {/* Back Button and Page Title */}
                    <div className="flex justify-between items-center mb-8 animate-fade-in-up">
                        <button
                            onClick={() => navigate('/portfolio')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${isDark ? 'text-cyan-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-200'}`}
                        >
                            <FaArrowLeft /> Back to Portfolio
                        </button>
                        <h1 className={`text-4xl font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>My Work Experience</h1>
                    </div>

                    {/* Render the ExperienceTab component */}
                    <ExperienceTab />
                </div>
            </div>
        </DashboardLayout>
    );
};

ExperiencePage.propTypes = {
    // This page component does not receive any props directly.
    // It acts as a container for ExperienceTab.
};

export default ExperiencePage;