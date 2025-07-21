import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaGlobe, FaEnvelope } from 'react-icons/fa';
import { MdLocationOn, MdWork, MdEmail, MdPhone } from 'react-icons/md'; // Reusing Md icons for consistency
import MainLayout from '../../components/layouts/MainLayout'; // Your MainLayout component
import Loader from '../../components/common/Loader'; // Your Loader component
import ProjectCard from '../../components/portfolio/ProjectCard'; // Your ProjectCard component
import CertificateCard from '../../components/portfolio/CertificateCard'; // Your CertificateCard component
import ExperienceTab from '../../components/portfolio/ExperienceTab'; // Your ExperienceTab component (for read-only display)
import { useTheme } from '../../context/ThemeContext'; // Your ThemeContext
import SummaryApi from '../../config'; // Your SummaryApi config
import Card from '../../components/common/Card'; // Your Card component

const PublicPortfolio = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Fetch all public portfolio data for the given username
    const { data: publicPortfolioData, isLoading, isError, error } = useQuery(
        ['publicPortfolio', username],
        async () => {
            if (!username) {
                throw new Error("Username not provided in URL.");
            }
            // IMPORTANT: This endpoint must be publicly accessible (no token needed)
            const response = await fetch(SummaryApi.portfolio.public.url(username));

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to fetch public portfolio');
            }
            return response.json();
        }
    );

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader />
                    <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loading {username}'s portfolio...</p>
                </div>
            </MainLayout>
        );
    }

    if (isError) {
        return (
            <MainLayout>
                <div className={`min-h-screen flex items-center justify-center p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                    <Card className={`text-center p-8 ${isDark ? 'bg-gray-800 text-red-400' : 'bg-red-50 text-red-700'} border border-red-500`}>
                        <h2 className="text-2xl font-bold mb-4">Portfolio Not Found</h2>
                        <p className="mb-4">{error?.message || `The portfolio for username "${username}" could not be loaded.`}</p>
                        <Link to="/" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${isDark ? 'bg-cyan-600/30 text-cyan-200 hover:bg-cyan-500/40' : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}>
                            Go to Homepage
                        </Link>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    const {
        displayName,
        jobTitle,
        location,
        bio,
        profileImage,
        socialLinks,
        skills, // Array of { category: string, skills: string[] }
        projects, // Array of project objects
        certificates, // Array of certificate objects
        experiences, // Array of experience objects
    } = publicPortfolioData || {};

    // Organize skills by category for display
    const skillsByCategory = (skills || []).reduce((acc, skillCategory) => {
        if (skillCategory.category && Array.isArray(skillCategory.skills)) {
            acc[skillCategory.category] = skillCategory.skills;
        }
        return acc;
    }, {});


    return (
        <MainLayout>
            <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-6xl mx-auto">
                    {/* Profile Header Section */}
                    <Card className="mb-8 animate-fade-in-up">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6">
                            <div className="flex-shrink-0">
                                <img
                                    src={profileImage?.url || '/default-avatar.png'}
                                    alt={displayName || 'User Profile'}
                                    className={`w-40 h-40 rounded-full object-cover border-4 ${isDark ? 'border-cyan-400' : 'border-blue-500'} shadow-lg`}
                                />
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h1 className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{displayName || 'Portfolio User'}</h1>
                                {jobTitle && <p className={`text-2xl mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{jobTitle}</p>}
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-lg mb-4">
                                    {location && (
                                        <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <MdLocationOn /> {location}
                                        </span>
                                    )}
                                    {socialLinks?.email && ( // Assuming email might be in socialLinks or top-level
                                        <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <MdEmail /> {socialLinks.email}
                                        </span>
                                    )}
                                    {socialLinks?.phone && ( // Assuming phone might be in socialLinks or top-level
                                        <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <MdPhone /> {socialLinks.phone}
                                        </span>
                                    )}
                                </div>
                                {bio && <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{bio}</p>}

                                {/* Social Links */}
                                {(socialLinks?.github || socialLinks?.linkedin || socialLinks?.twitter || socialLinks?.instagram || socialLinks?.facebook || socialLinks?.website) && (
                                    <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                                        {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className={`text-2xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}><FaGithub /></a>}
                                        {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={`text-2xl ${isDark ? 'text-cyan-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-500'}`}><FaLinkedin /></a>}
                                        {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={`text-2xl ${isDark ? 'text-cyan-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}><FaTwitter /></a>}
                                        {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={`text-2xl ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-pink-600 hover:text-purple-700'}`}><FaInstagram /></a>}
                                        {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={`text-2xl ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-800 hover:text-blue-600'}`}><FaFacebook /></a>}
                                        {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className={`text-2xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}><FaGlobe /></a>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Skills Section */}
                    {(skills && Object.keys(skillsByCategory).length > 0) && (
                        <Card className="mb-8 animate-fade-in-up">
                            <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>Skills</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                                    <div key={category} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {categorySkills.map((skill, index) => (
                                                <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Projects Section */}
                    {(projects && projects.length > 0) && (
                        <Card className="mb-8 animate-fade-in-up">
                            <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>Projects</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project._id}
                                        project={{ ...project, isPublicView: true }} // Pass prop to ProjectCard to disable edits
                                    />
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Certificates Section */}
                    {(certificates && certificates.length > 0) && (
                        <Card className="mb-8 animate-fade-in-up">
                            <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>Certificates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {certificates.map((certificate) => (
                                    <CertificateCard
                                        key={certificate._id}
                                        certificate={{ ...certificate, isPublicView: true }} // Pass prop to CertificateCard to disable edits
                                    />
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Experience Section */}
                    {(experiences && experiences.length > 0) && (
                        <Card className="mb-8 animate-fade-in-up">
                            <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>Work Experience</h2>
                            {/* ExperienceTab should be designed to receive an 'experiences' prop and render read-only */}
                            <ExperienceTab experiences={experiences} isPublicView={true} /> {/* Pass experiences and public view prop */}
                        </Card>
                    )}

                    {/* Back to Home button (optional) */}
                    <div className="text-center mt-12">
                        <Link to="/" className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${isDark ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-400/30' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30'}`}>
                            Back to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

PublicPortfolio.propTypes = {
    // This component fetches its own data based on useParams, so no direct props
    // needed from a parent route. Prop 'username' is from useParams.
};

export default PublicPortfolio;a