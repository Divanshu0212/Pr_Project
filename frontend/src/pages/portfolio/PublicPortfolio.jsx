import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaGlobe, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import { MdLocationOn, MdWork, MdEmail, MdPhone } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';
import SummaryApi from '../../config';
import '../../styles/pages/PublicPortfolio.css'; // Import the CSS file

const PublicPortfolio = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Fetch public portfolio data for the given username
    const { data: publicPortfolioData, isLoading, isError, error } = useQuery(
        ['publicPortfolio', username],
        async () => {
            if (!username) {
                throw new Error("Username not provided in URL.");
            }
            // This endpoint must be publicly accessible (no token needed)
            const response = await fetch(SummaryApi.portfolio.public.url(username), {
                method: SummaryApi.portfolio.public.method
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.message || 'Portfolio not found');
            }
            return response.json();
        },
        {
            retry: false,
            refetchOnWindowFocus: false
        }
    );

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loading {username}'s portfolio...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className={`text-center p-8 rounded-lg shadow-lg max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className="text-2xl font-bold mb-4">Portfolio Not Found</h2>
                    <p className="mb-6 text-gray-600">{error?.message || `The portfolio for "${username}" could not be found.`}</p>
                    <Link 
                        to="/" 
                        className={`inline-block px-6 py-3 rounded-lg font-medium transition-all duration-300 ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const {
        user,
        portfolioDetails,
        skills,
        projects,
        certificates,
        experiences,
    } = publicPortfolioData || {};

    // Organize skills by category for display
    const skillsByCategory = (skills || []).reduce((acc, skill) => {
        const category = skill.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
    }, {});

    return (
        <div className={`public-portfolio ${isDark ? 'dark' : ''}`}>
            <div className="portfolio-container">
                {/* Profile Header Section */}
                <div className="profile-header">
                    <div className="profile-content">
                        <div className="profile-image-section">
                            <img
                                src={user?.profileImage?.url || '/default-avatar.png'}
                                alt={user?.displayName || 'User Profile'}
                                className="profile-image"
                            />
                        </div>
                        
                        <div className="profile-info">
                            <h1 className="profile-name">
                                {user?.displayName || portfolioDetails?.displayName || 'Portfolio User'}
                            </h1>
                            
                            {portfolioDetails?.jobTitle && (
                                <p className="job-title">{portfolioDetails.jobTitle}</p>
                            )}
                            
                            <div className="profile-meta">
                                {portfolioDetails?.location && (
                                    <span className="meta-item">
                                        <MdLocationOn /> {portfolioDetails.location}
                                    </span>
                                )}
                                {portfolioDetails?.email && (
                                    <span className="meta-item">
                                        <MdEmail /> {portfolioDetails.email}
                                    </span>
                                )}
                                {portfolioDetails?.phone && (
                                    <span className="meta-item">
                                        <MdPhone /> {portfolioDetails.phone}
                                    </span>
                                )}
                            </div>

                            {portfolioDetails?.bio && (
                                <p className="profile-bio">{portfolioDetails.bio}</p>
                            )}

                            {/* Social Links */}
                            {portfolioDetails?.socialLinks && (
                                <div className="social-links">
                                    {portfolioDetails.socialLinks.github && (
                                        <a href={portfolioDetails.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                                            <FaGithub />
                                        </a>
                                    )}
                                    {portfolioDetails.socialLinks.linkedin && (
                                        <a href={portfolioDetails.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                                            <FaLinkedin />
                                        </a>
                                    )}
                                    {portfolioDetails.socialLinks.twitter && (
                                        <a href={portfolioDetails.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                                            <FaTwitter />
                                        </a>
                                    )}
                                    {portfolioDetails.socialLinks.instagram && (
                                        <a href={portfolioDetails.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                                            <FaInstagram />
                                        </a>
                                    )}
                                    {portfolioDetails.socialLinks.facebook && (
                                        <a href={portfolioDetails.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                                            <FaFacebook />
                                        </a>
                                    )}
                                    {portfolioDetails.socialLinks.website && (
                                        <a href={portfolioDetails.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link website">
                                            <FaGlobe />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                {skills && Object.keys(skillsByCategory).length > 0 && (
                    <div className="portfolio-section">
                        <h2 className="section-title">Skills</h2>
                        <div className="skills-grid">
                            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                                <div key={category} className="skill-category">
                                    <h3 className="category-title">{category}</h3>
                                    <div className="skill-tags">
                                        {categorySkills.map((skill, index) => (
                                            <span key={index} className="skill-tag">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects Section */}
                {projects && projects.length > 0 && (
                    <div className="portfolio-section">
                        <h2 className="section-title">Projects</h2>
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <div key={project._id} className="project-card">
                                    {project.image?.url && (
                                        <img 
                                            src={project.image.url} 
                                            alt={project.title}
                                            className="project-image"
                                        />
                                    )}
                                    <div className="project-content">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-description">{project.description}</p>
                                        
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="project-technologies">
                                                {project.technologies.map((tech, index) => (
                                                    <span key={index} className="tech-tag">{tech}</span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="project-links">
                                            {project.liveUrl && (
                                                <a 
                                                    href={project.liveUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="project-link live"
                                                >
                                                    <FaExternalLinkAlt /> Live Demo
                                                </a>
                                            )}
                                            {project.githubUrl && (
                                                <a 
                                                    href={project.githubUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="project-link github"
                                                >
                                                    <FaGithub /> Source Code
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certificates Section */}
                {certificates && certificates.length > 0 && (
                    <div className="portfolio-section">
                        <h2 className="section-title">Certificates</h2>
                        <div className="certificates-grid">
                            {certificates.map((certificate) => (
                                <div key={certificate._id} className="certificate-card">
                                    <h3 className="certificate-title">{certificate.title}</h3>
                                    <p className="certificate-issuer">{certificate.issuer}</p>
                                    {certificate.issuedDate && (
                                        <p className="certificate-date">
                                            Issued: {new Date(certificate.issuedDate).toLocaleDateString()}
                                        </p>
                                    )}
                                    {certificate.description && (
                                        <p className="certificate-description">{certificate.description}</p>
                                    )}
                                    {certificate.credentialUrl && (
                                        <a 
                                            href={certificate.credentialUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="certificate-link"
                                        >
                                            <FaExternalLinkAlt /> View Credential
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience Section */}
                {experiences && experiences.length > 0 && (
                    <div className="portfolio-section">
                        <h2 className="section-title">Work Experience</h2>
                        <div className="experience-timeline">
                            {experiences.map((experience) => (
                                <div key={experience._id} className="experience-item">
                                    <div className="experience-content">
                                        <h3 className="experience-position">{experience.position}</h3>
                                        <h4 className="experience-company">{experience.company}</h4>
                                        <div className="experience-duration">
                                            {new Date(experience.startDate).toLocaleDateString()} - 
                                            {experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'Present'}
                                        </div>
                                        {experience.description && (
                                            <p className="experience-description">{experience.description}</p>
                                        )}
                                        {experience.achievements && experience.achievements.length > 0 && (
                                            <ul className="experience-achievements">
                                                {experience.achievements.map((achievement, index) => (
                                                    <li key={index}>{achievement}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="portfolio-footer">
                    <p>© {new Date().getFullYear()} {user?.displayName || username}. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default PublicPortfolio;