import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaGlobe, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import { MdLocationOn, MdWork, MdEmail, MdPhone } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';
// import SummaryApi from '../../config'; // No longer directly importing SummaryApi here
import portfolioService from '../../services/portfolioService'; // Import the new service
import '../../styles/pages/PublicPortfolio.css'; // Import the CSS file

const PublicPortfolio = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Fetch public portfolio data for the given username
    const { data: publicPortfolioData, isLoading, isError, error } = useQuery(
        ['publicPortfolio', username],
        () => portfolioService.getPublicPortfolioByUsername(username),
        {
            retry: false,
            refetchOnWindowFocus: false,
            onError: (err) => {
                console.error('Portfolio fetch error:', err);
                if (err.response?.status === 404) {
                    navigate('/portfolio-not-found', { state: { username } });
                }
            }
        }
    );

    // Add this useEffect to handle missing username:
    useEffect(() => {
        if (!username) {
            navigate('/'); // Redirect to home if no username
        }
    }, [username, navigate]);

    // Scroll-triggered animation observer
    useEffect(() => {
        const observerOptions = {
            threshold: 0.15, // Trigger when 15% of the section is visible
            rootMargin: '0px 0px -50px 0px' // Start animation slightly before element is fully in view
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    // Optional: Remove class when section leaves viewport for re-animation
                    // entry.target.classList.remove('is-visible');
                }
            });
        }, observerOptions);

        // Observe all portfolio sections
        const portfolioSections = document.querySelectorAll('.portfolio-section');
        portfolioSections.forEach((section) => {
            observer.observe(section);
        });

        // Cleanup function to disconnect observer
        return () => {
            portfolioSections.forEach((section) => {
                observer.unobserve(section);
            });
            observer.disconnect();
        };
    }, [publicPortfolioData]); // Re-run when data loads to ensure sections are observed

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
        user = {},
        portfolioDetails = {},
        skills = [],
        projects = [],
        certificates = [],
        experiences = [],
    } = publicPortfolioData || {};

    // Organize skills by category for display
    const skillsByCategory = (publicPortfolioData.data.skills || []).reduce((acc, skill) => {
        const category = skill.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
    }, {});

    console.log(publicPortfolioData);

    return (
        <div className="public-portfolio-page">
            <div className="portfolio-content-wrapper">
                
                {/* Hero Section */}
                <section className="portfolio-hero portfolio-section">
                    <div className="hero-background-overlay"></div>
                    <div className="hero-content">
                        <div className="hero-avatar-container">
                            <img
                                src={publicPortfolioData.data.user?.profileImage?.url || publicPortfolioData.data.user?.profileImage || '/default-avatar.png'}
                                alt={publicPortfolioData.data.user?.displayName || 'User Profile'}
                                className="hero-avatar"
                            />
                            <div className="hero-avatar-glow"></div>
                        </div>

                        <div className="hero-text-content">
                            <h1 className="hero-display-name">
                                {publicPortfolioData.data.user?.displayName || 'Portfolio User'}
                            </h1>

                            {publicPortfolioData.data.portfolioDetails?.jobTitle && (
                                <p className="hero-job-title">{publicPortfolioData.data.portfolioDetails.jobTitle}</p>
                            )}

                            {publicPortfolioData.data.portfolioDetails?.bio && (
                                <div className="hero-bio-section">
                                    <p className="hero-bio-text">{publicPortfolioData.data.portfolioDetails.bio}</p>
                                </div>
                            )}

                            {/* Quick Contact Info in Hero */}
                            <div className="hero-quick-contact">
                                {publicPortfolioData.data.portfolioDetails?.location && (
                                    <div className="hero-contact-item">
                                        <MdLocationOn className="hero-contact-icon" />
                                        <span>{publicPortfolioData.data.portfolioDetails.location}</span>
                                    </div>
                                )}
                                {publicPortfolioData.data.portfolioDetails?.email && (
                                    <div className="hero-contact-item">
                                        <MdEmail className="hero-contact-icon" />
                                        <span>{publicPortfolioData.data.portfolioDetails.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Skills Section */}
                {skills && Object.keys(skillsByCategory).length > 0 && (
                    <section className="skills-showcase-section portfolio-section">
                        <div className="section-container">
                            <h2 className="section-title">Skills & Expertise</h2>
                            <div className="skills-showcase-grid">
                                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                                    <div key={category} className="skills-category-card">
                                        <div className="category-card-header">
                                            <h3 className="category-title">{category}</h3>
                                            <div className="category-accent-line"></div>
                                        </div>
                                        <div className="skills-tag-cloud">
                                            {categorySkills.map((skill, index) => (
                                                <span key={index} className="skill-tag-modern">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Experience Section */}
                {publicPortfolioData.data.experiences && publicPortfolioData.data.experiences.length > 0 && (
                    <section className="experience-showcase-section portfolio-section">
                        <div className="section-container">
                            <h2 className="section-title">Professional Journey</h2>
                            <div className="experience-story-timeline">
                                {publicPortfolioData.data.experiences.map((experience, index) => (
                                    <div key={experience._id} className="experience-timeline-item">
                                        <div className="timeline-connector">
                                            <div className="timeline-dot"></div>
                                            {index !== publicPortfolioData.data.experiences.length - 1 && (
                                                <div className="timeline-line"></div>
                                            )}
                                        </div>
                                        <div className="experience-content-card">
                                            <div className="experience-header">
                                                <h3 className="experience-position-title">{experience.position}</h3>
                                                <h4 className="experience-company-name">{experience.company}</h4>
                                                <div className="experience-duration-badge">
                                                    {new Date(experience.startDate).toLocaleDateString()} -
                                                    {experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'Present'}
                                                </div>
                                            </div>
                                            {experience.description && (
                                                <p className="experience-description-text">{experience.description}</p>
                                            )}
                                            {experience.achievements && experience.achievements.length > 0 && (
                                                <div className="experience-achievements-list">
                                                    <h5 className="achievements-title">Key Achievements</h5>
                                                    <ul className="achievements-items">
                                                        {experience.achievements.map((achievement, achievementIndex) => (
                                                            <li key={achievementIndex} className="achievement-item-modern">
                                                                {achievement}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Projects Section */}
                {publicPortfolioData.data.projects && publicPortfolioData.data.projects.length > 0 && (
                    <section className="projects-showcase-section portfolio-section">
                        <div className="section-container">
                            <h2 className="section-title">Featured Projects</h2>
                            <div className="projects-display-grid">
                                {publicPortfolioData.data.projects.map((project) => (
                                    <article key={project._id} className="project-display-card">
                                        <div className="project-card-inner">
                                            {project.image?.url && (
                                                <div className="project-image-showcase">
                                                    <img
                                                        src={project.image.url}
                                                        alt={project.title}
                                                        className="project-featured-image"
                                                    />
                                                    <div className="project-image-overlay"></div>
                                                </div>
                                            )}
                                            <div className="project-content-area">
                                                <div className="project-header">
                                                    <h3 className="project-title-main">{project.title}</h3>
                                                    <p className="project-description-main">{project.description}</p>
                                                </div>

                                                {project.technologies && project.technologies.length > 0 && (
                                                    <div className="project-tech-showcase">
                                                        <h4 className="tech-showcase-title">Built with</h4>
                                                        <div className="tech-badges-container">
                                                            {project.technologies.map((tech, index) => (
                                                                <span key={index} className="tech-badge-modern">{tech}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="project-actions-area">
                                                    {project.liveUrl && (
                                                        <a
                                                            href={project.liveUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="project-action-button primary-action"
                                                        >
                                                            <FaExternalLinkAlt className="action-icon" />
                                                            <span>Live Demo</span>
                                                        </a>
                                                    )}
                                                    {project.githubUrl && (
                                                        <a
                                                            href={project.githubUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="project-action-button secondary-action"
                                                        >
                                                            <FaGithub className="action-icon" />
                                                            <span>Source Code</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Certificates Section */}
                {publicPortfolioData.data.certificates && publicPortfolioData.data.certificates.length > 0 && (
                    <section className="certificates-showcase-section portfolio-section">
                        <div className="section-container">
                            <h2 className="section-title">Certifications & Achievements</h2>
                            <div className="certificates-display-grid">
                                {publicPortfolioData.data.certificates.map((certificate) => (
                                    <div key={certificate._id} className="certificate-display-card">
                                        <div className="certificate-card-header">
                                            <h3 className="certificate-title-main">{certificate.title}</h3>
                                            <p className="certificate-issuer-name">{certificate.issuer}</p>
                                        </div>
                                        <div className="certificate-card-body">
                                            {certificate.issuedDate && (
                                                <div className="certificate-date-badge">
                                                    {new Date(certificate.issuedDate).toLocaleDateString()}
                                                </div>
                                            )}
                                            {certificate.description && (
                                                <p className="certificate-description-text">{certificate.description}</p>
                                            )}
                                        </div>
                                        {certificate.credentialUrl && (
                                            <div className="certificate-card-footer">
                                                <a
                                                    href={certificate.credentialUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="certificate-credential-button"
                                                >
                                                    <FaExternalLinkAlt className="credential-icon" />
                                                    <span>View Credential</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact Section */}
                <section className="contact-showcase-section portfolio-section">
                    <div className="section-container">
                        <h2 className="section-title">Let's Connect</h2>
                        <div className="contact-showcase-content">
                            
                            {/* Contact Information */}
                            <div className="contact-info-display">
                                <h3 className="contact-subsection-title">Get in Touch</h3>
                                <div className="contact-methods-list">
                                    {publicPortfolioData.data.portfolioDetails?.email && (
                                        <div className="contact-method-item">
                                            <div className="contact-method-icon">
                                                <MdEmail />
                                            </div>
                                            <div className="contact-method-details">
                                                <span className="contact-method-label">Email</span>
                                                <span className="contact-method-value">{publicPortfolioData.data.portfolioDetails.email}</span>
                                            </div>
                                        </div>
                                    )}
                                    {publicPortfolioData.data.portfolioDetails?.phone && (
                                        <div className="contact-method-item">
                                            <div className="contact-method-icon">
                                                <MdPhone />
                                            </div>
                                            <div className="contact-method-details">
                                                <span className="contact-method-label">Phone</span>
                                                <span className="contact-method-value">{publicPortfolioData.data.portfolioDetails.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    {publicPortfolioData.data.portfolioDetails?.location && (
                                        <div className="contact-method-item">
                                            <div className="contact-method-icon">
                                                <MdLocationOn />
                                            </div>
                                            <div className="contact-method-details">
                                                <span className="contact-method-label">Location</span>
                                                <span className="contact-method-value">{publicPortfolioData.data.portfolioDetails.location}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Social Media Links */}
                            {publicPortfolioData.data.portfolioDetails?.socialLinks && (
                                <div className="social-media-showcase">
                                    <h3 className="contact-subsection-title">Follow Me</h3>
                                    <div className="social-links-display-grid">
                                        {publicPortfolioData.data.portfolioDetails.socialLinks.github && (
                                            <a href={publicPortfolioData.data.portfolioDetails.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link-card github-card">
                                                <FaGithub className="social-card-icon" />
                                                <span className="social-card-label">GitHub</span>
                                            </a>
                                        )}
                                        {publicPortfolioData.data.portfolioDetails.socialLinks.linkedin && (
                                            <a href={publicPortfolioData.data.portfolioDetails.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link-card linkedin-card">
                                                <FaLinkedin className="social-card-icon" />
                                                <span className="social-card-label">LinkedIn</span>
                                            </a>
                                        )}
                                        {publicPortfolioData.data.portfolioDetails.socialLinks.twitter && (
                                            <a href={publicPortfolioData.data.portfolioDetails.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link-card twitter-card">
                                                <FaTwitter className="social-card-icon" />
                                                <span className="social-card-label">Twitter</span>
                                            </a>
                                        )}
                                        {publicPortfolioData.data.portfolioDetails.socialLinks.instagram && (
                                            <a href={publicPortfolioData.data.portfolioDetails.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link-card instagram-card">
                                                <FaInstagram className="social-card-icon" />
                                                <span className="social-card-label">Instagram</span>
                                            </a>
                                        )}
                                        {publicPortfolioData.data.portfolioDetails.socialLinks.facebook && (
                                            <a href={publicPortfolioData.data.portfolioDetails.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link-card facebook-card">
                                                <FaFacebook className="social-card-icon" />
                                                <span className="social-card-label">Facebook</span>
                                            </a>
                                        )}
                                        {publicPortfolioData.data.portfolioDetails.socialLinks.website && (
                                            <a href={publicPortfolioData.data.portfolioDetails.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link-card website-card">
                                                <FaGlobe className="social-card-icon" />
                                                <span className="social-card-label">Website</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

            </div>

            {/* Portfolio Footer */}
            <footer className="portfolio-footer-modern">
                <div className="footer-content">
                    <p className="footer-text-modern">
                        © {new Date().getFullYear()} {publicPortfolioData.data?.user.displayName || username}. 
                        <span className="footer-tagline">Crafted with passion.</span>
                    </p>
                </div>
            </footer>
        </div>
    );
};

// PropTypes (Optional but Recommended)
PublicPortfolio.propTypes = {
    // No props passed directly to PublicPortfolio from its parent route currently,
    // but if it were to receive props in the future, define them here.
};

export default PublicPortfolio;