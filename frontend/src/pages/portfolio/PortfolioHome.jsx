import React, { useContext, useState, useEffect } from 'react';
import { FaPlus, FaGithub, FaLinkedin, FaTwitter, FaCamera, FaInstagram, FaFacebook, FaEdit, FaEye, FaShare, FaDownload, FaGlobe } from 'react-icons/fa';
import { MdEdit, MdLocationOn, MdWork, MdClose, MdCheck, MdEmail, MdPhone, MdLanguage } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../../styles/pages/PortfolioHome.css';
import '../../styles/animations.css';
import { AuthContext } from '../../context/AuthContext';
import SummaryApi from '../../config';
import PortfolioDetailsForm from './PortfolioDetailsForm';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const PortfolioHome = ({ user: propUser }) => {
    const navigate = useNavigate();
    const { currentUser, portfolioDetails, setCurrentUser } = useContext(AuthContext);
    const { theme, isDark } = useTheme();

    // State management
    const [activeSection, setActiveSection] = useState('overview');
    const [isEditingPic, setIsEditingPic] = useState(false);
    const [newProfilePic, setNewProfilePic] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showDetailsForm, setShowDetailsForm] = useState(false);
    const [skills, setSkills] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [shareMessage, setShareMessage] = useState('');
    const fileInputRef = React.useRef(null);

    const user = propUser || { ...currentUser, ...portfolioDetails };

    // Fetch data using React Query
    const { data: projectsData, isLoading: projectsLoading } = useQuery('pinnedProjects', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SummaryApi.projects.get.url}?isPinned=true`, {
            method: SummaryApi.projects.get.method,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
    });

    const { data: certificatesData } = useQuery('certificates', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(SummaryApi.certificates.get.url, {
            method: SummaryApi.certificates.get.method,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch certificates');
        return response.json();
    });

    const { data: countsData } = useQuery('projectCounts', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(SummaryApi.projects.counts.url, {
            method: SummaryApi.projects.counts.method,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch project counts');
        return response.json();
    });

    const { data: totalExperience } = useQuery('totalExperience', async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(SummaryApi.experiences.total.url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data.totalYears;
    });

    // Fetch skills
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(SummaryApi.skills.get.url, {
                    method: SummaryApi.skills.get.method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSkills(data);
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };

        fetchSkills();
    }, []);

    // Update certificates when data changes
    useEffect(() => {
        if (certificatesData) {
            setCertificates(certificatesData.certificates || []);
        }
    }, [certificatesData]);

    // Profile picture handlers
    const handlePicChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        setNewProfilePic(URL.createObjectURL(file));
    };

    const handleSavePicClick = async () => {
        if (!fileInputRef.current?.files?.[0]) {
            alert('Please select an image first');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('profileImage', fileInputRef.current.files[0]);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.profileImage.url, {
                method: SummaryApi.profileImage.method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            setCurrentUser({ ...user, profileImage: data.profileImage });
            setIsEditingPic(false);
            setNewProfilePic(null);
            alert('Profile image updated successfully');
        } catch (error) {
            console.error('Error uploading profile image:', error);
            alert('Failed to update profile image');
        } finally {
            setIsUploading(false);
        }
    };

    // In PortfolioHome.jsx, update the preview button and sharing logic:
    const handlePreviewPortfolio = () => {
        if (!user?.username) {
            alert('Please set up your username in profile settings first');
            return;
        }
        const previewUrl = `${window.location.origin}/portfolio/public/${user.username}`;
        window.open(previewUrl, '_blank');
    };

    const handleSharePortfolio = async () => {
        if (!user?.username) {
            alert('Please set up your username in profile settings first');
            return;
        }

        const publicPortfolioUrl = `${window.location.origin}/portfolio/public/${user.username}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${user.displayName || user.username}'s Portfolio`,
                    text: `Check out ${user.displayName || user.username}'s professional portfolio`,
                    url: publicPortfolioUrl
                });
            } else {
                await navigator.clipboard.writeText(publicPortfolioUrl);
                setShareMessage('Portfolio link copied to clipboard!');
                setTimeout(() => setShareMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error sharing portfolio:', error);
            try {
                await navigator.clipboard.writeText(publicPortfolioUrl);
                setShareMessage('Portfolio link copied to clipboard!');
                setTimeout(() => setShareMessage(''), 3000);
            } catch (clipboardError) {
                alert(`Share your portfolio: ${publicPortfolioUrl}`);
            }
        }
    };

    // Data preparation
    const pinnedProjects = projectsData?.projects || [];
    const skillsByCategory = skills.reduce((acc, skill) => {
        const category = skill.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
    }, {});

    const stats = {
        projects: countsData?.counts?.total || 0,
        completed: countsData?.counts?.completed || 0,
        certificates: certificates.length,
        experience: totalExperience ? `${totalExperience} Years` : `${portfolioDetails?.yearsOfExperience || 0} Years`
    };

    const completionStatus = {
        basic: !!(user?.displayName && portfolioDetails?.jobTitle && portfolioDetails?.bio),
        contact: !!(portfolioDetails?.email && portfolioDetails?.location),
        social: !!(portfolioDetails?.socialLinks?.github || portfolioDetails?.socialLinks?.linkedin),
        skills: skills.length > 0,
        projects: pinnedProjects.length > 0,
        certificates: certificates.length > 0
    };

    const completionPercentage = Math.round(
        (Object.values(completionStatus).filter(Boolean).length / Object.keys(completionStatus).length) * 100
    );

    // Update the profileActions array:
    const profileActions = [
        {
            icon: FaEye,
            label: 'Preview',
            action: handlePreviewPortfolio,
            primary: true
        },
        {
            icon: FaShare,
            label: 'Share',
            action: handleSharePortfolio
        },
        {
            icon: FaDownload,
            label: 'Export PDF',
            action: () => navigate('/portfolio/export')
        }
    ];

    return (
        <div className={`portfolio-home ${isDark ? 'dark' : ''}`}>
            {/* Share Success Message */}
            {shareMessage && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
                    {shareMessage}
                </div>
            )}

            {/* Header Section */}
            <div className="portfolio-header">
                <div className="header-content">
                    <div className="profile-section">
                        <div className="profile-image-container">
                            <img
                                src={newProfilePic || user?.profileImage?.url || '/default-avatar.png'}
                                alt="Profile"
                                className="profile-image"
                            />
                            <button
                                className="edit-image-btn"
                                onClick={() => setIsEditingPic(true)}
                            >
                                <FaCamera />
                            </button>
                        </div>

                        <div className="profile-info">
                            <h1 className="profile-name">{user?.displayName || 'Complete Your Profile'}</h1>
                            <div className="profile-title">
                                {portfolioDetails?.jobTitle ? (
                                    <span className="job-title">{portfolioDetails.jobTitle}</span>
                                ) : (
                                    <span className="incomplete-field">Add your professional title</span>
                                )}
                            </div>
                            <div className="profile-meta">
                                {portfolioDetails?.location && (
                                    <span className="meta-item">
                                        <MdLocationOn /> {portfolioDetails.location}
                                    </span>
                                )}
                                {user?.email && (
                                    <span className="meta-item">
                                        <MdEmail /> {user?.email}
                                    </span>
                                )}
                                {portfolioDetails?.phone && (
                                    <span className="meta-item">
                                        <MdPhone /> {portfolioDetails.phone}
                                    </span>
                                )}
                            </div>

                            {/* Username Display */}
                            <div className="username-section">
                                {user?.username ? (
                                    <div className="username-display">
                                        <span className="username-label">Portfolio URL:</span>
                                        <code className="username-url">
                                            {window.location.origin}/portfolio/public/{user.username}
                                        </code>
                                    </div>
                                ) : (
                                    <div className="username-missing">
                                        <span className="warning-text">⚠️ Set up your username to enable portfolio sharing</span>
                                        <button
                                            onClick={() => navigate('/portfolio/settings')}
                                            className="setup-username-btn"
                                        >
                                            Set Username
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="profile-actions">
                            {profileActions.map((action, index) => (
                                <button
                                    key={index}
                                    className={`action-btn ${action.primary ? 'primary' : ''}`}
                                    onClick={action.action}
                                    disabled={!user?.username && (action.label === 'Preview' || action.label === 'Share')}
                                >
                                    <action.icon />
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio and Completion Container - Side by Side */}
            <div className="bio-completion-container">
                {/* Bio Section */}
                <div className="bio-section">
                    {portfolioDetails?.bio ? (
                        <>
                            <h3>About Me</h3>
                            <p className="bio-text">{portfolioDetails.bio}</p>
                        </>
                    ) : (
                        <div className="empty-bio">
                            <h3>About Me</h3>
                            <p className="empty-bio-text">Add a bio to tell visitors about yourself</p>
                            <button
                                onClick={() => navigate('/portfolio/settings')}
                                className="add-bio-btn"
                            >
                                <FaEdit /> Add Bio
                            </button>
                        </div>
                    )}
                </div>

                {/* Completion Card */}
                <div className="completion-card">
                    <h3>Profile Completion</h3>
                    <div className="completion-progress">
                        <div
                            className="progress-bar"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    <span className="completion-percentage">{completionPercentage}%</span>

                    <div className="completion-checklist">
                        <div className={`check-item ${completionStatus.basic ? 'completed' : ''}`}>
                            <MdCheck /> Basic Information
                        </div>
                        <div className={`check-item ${completionStatus.skills ? 'completed' : ''}`}>
                            <MdCheck /> Skills Added
                        </div>
                        <div className={`check-item ${completionStatus.projects ? 'completed' : ''}`}>
                            <MdCheck /> Projects Showcased
                        </div>
                        <div className={`check-item ${completionStatus.contact ? 'completed' : ''}`}>
                            <MdCheck /> Contact Info
                        </div>
                        <div className={`check-item ${completionStatus.social ? 'completed' : ''}`}>
                            <MdCheck /> Social Links
                        </div>
                        <div className={`check-item ${completionStatus.certificates ? 'completed' : ''}`}>
                            <MdCheck /> Certificates Added
                        </div>
                        <div className={`check-item ${user?.username ? 'completed' : ''}`}>
                            <MdCheck /> Username Set
                        </div>
                    </div>

                    <button
                        className="complete-profile-btn"
                        onClick={() => navigate('/portfolio/settings')}
                    >
                        <FaEdit /> Complete Profile
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-section">
                <div className="stats-grid">
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key} className="stat-card">
                            <div className="stat-value">{value}</div>
                            <div className="stat-label">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="section-navigation">
                {['overview', 'projects', 'skills', 'certificates', 'experience'].map((section) => (
                    <button
                        key={section}
                        className={`nav-tab ${activeSection === section ? 'active' : ''}`}
                        onClick={() => {
                            if (section === 'overview') {
                                setActiveSection('overview');
                            } else if (section === 'projects') {
                                navigate('/portfolio/projects');
                            } else if (section === 'skills') {
                                navigate('/portfolio/skills');
                            } else if (section === 'certificates') {
                                navigate('/portfolio/certificates');
                            } else if (section === 'experience') {
                                navigate('/portfolio/experience');
                            }
                        }}
                    >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content Sections - Only Overview */}
            <div className="main-content">
                {activeSection === 'overview' && (
                    <div className="overview-section">
                        <div className="overview-grid">
                            {/* Recent Projects */}
                            <div className="overview-card">
                                <div className="card-header">
                                    <h3>Featured Projects</h3>
                                    <button onClick={() => navigate('/portfolio/projects')} className="view-all-btn">
                                        View All
                                    </button>
                                </div>
                                <div className="project-preview">
                                    {pinnedProjects.slice(0, 2).map((project) => (
                                        <div key={project._id} className="project-preview-item">
                                            <h4>{project.title}</h4>
                                            <p>{project.description?.substring(0, 100)}...</p>
                                        </div>
                                    ))}
                                    {pinnedProjects.length === 0 && (
                                        <div className="empty-state">
                                            <p>No projects added yet</p>
                                            <button
                                                onClick={() => navigate('/portfolio/projects/add')}
                                                className="add-project-btn"
                                            >
                                                <FaPlus /> Add Project
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Skills Preview */}
                            <div className="overview-card">
                                <div className="card-header">
                                    <h3>Skills</h3>
                                    <button onClick={() => navigate('/portfolio/skills')} className="view-all-btn">
                                        Manage
                                    </button>
                                </div>
                                <div className="skills-preview">
                                    {Object.entries(skillsByCategory).slice(0, 2).map(([category, categorySkills]) => (
                                        <div key={category} className="skill-category-preview">
                                            <h4>{category}</h4>
                                            <div className="skill-tags-preview">
                                                {categorySkills.slice(0, 3).map((skill, index) => (
                                                    <span key={index} className="skill-tag">{skill}</span>
                                                ))}
                                                {categorySkills.length > 3 && (
                                                    <span className="more-skills">+{categorySkills.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {skills.length === 0 && (
                                        <div className="empty-state">
                                            <p>No skills added yet</p>
                                            <button
                                                onClick={() => navigate('/portfolio/skills')}
                                                className="add-skills-btn"
                                            >
                                                <FaPlus /> Add Skills
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Social Links */}
                            {portfolioDetails?.socialLinks && (
                                <div className="overview-card">
                                    <div className="card-header">
                                        <h3>Connect With Me</h3>
                                    </div>
                                    <div className="social-links">
                                        {portfolioDetails.socialLinks.github && (
                                            <a href={portfolioDetails.socialLinks.github} className="social-link" target="_blank" rel="noopener noreferrer">
                                                <FaGithub /> GitHub
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.linkedin && (
                                            <a href={portfolioDetails.socialLinks.linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                                                <FaLinkedin /> LinkedIn
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.twitter && (
                                            <a href={portfolioDetails.socialLinks.twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                                                <FaTwitter /> Twitter
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.instagram && (
                                            <a href={portfolioDetails.socialLinks.instagram} className="social-link" target="_blank" rel="noopener noreferrer">
                                                <FaInstagram /> Instagram
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.facebook && (
                                            <a href={portfolioDetails.socialLinks.facebook} className="social-link" target="_blank" rel="noopener noreferrer">
                                                <FaFacebook /> Facebook
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.website && (
                                            <a href={portfolioDetails.socialLinks.website} className="social-link" target="_blank" rel="noopener noreferrer">
                                                <FaGlobe /> Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Portfolio Sharing Info */}
                            <div className="overview-card sharing-info">
                                <div className="card-header">
                                    <h3>Share Your Portfolio</h3>
                                </div>
                                <div className="sharing-content">
                                    {user?.username ? (
                                        <>
                                            <p className="sharing-description">
                                                Your portfolio is ready to share with employers and clients!
                                            </p>
                                            <div className="sharing-url">
                                                <code>{window.location.origin}/portfolio/public/{user.username}</code>
                                            </div>
                                            <div className="sharing-actions">
                                                <button
                                                    onClick={() => window.open(`/portfolio/public/${user.username}`, '_blank')}
                                                    className="preview-public-btn"
                                                >
                                                    <FaEye /> View Public Portfolio
                                                </button>
                                                <button
                                                    onClick={handleSharePortfolio}
                                                    className="share-portfolio-btn"
                                                >
                                                    <FaShare /> Share Portfolio
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="sharing-warning">
                                                Set up your username to make your portfolio shareable!
                                            </p>
                                            <button
                                                onClick={() => navigate('/portfolio/settings')}
                                                className="setup-sharing-btn"
                                            >
                                                Setup Portfolio Sharing
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Picture Edit Modal */}
            {isEditingPic && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Update Profile Picture</h3>
                            <button onClick={() => setIsEditingPic(false)} className="modal-close">
                                <MdClose />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="image-preview">
                                <img
                                    src={newProfilePic || user?.profileImage?.url || '/default-avatar.png'}
                                    alt="Profile Preview"
                                    className="preview-image"
                                />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePicChange}
                                accept="image/*"
                                className="file-input"
                            />
                            <button onClick={() => fileInputRef.current.click()} className="select-file-btn">
                                <FaPlus /> Select Image
                            </button>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={handleSavePicClick}
                                disabled={isUploading}
                                className="save-btn"
                            >
                                {isUploading ? 'Uploading...' : 'Save Changes'}
                            </button>
                            <button onClick={() => setIsEditingPic(false)} className="cancel-btn">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Portfolio Details Form Modal */}
            {showDetailsForm && (
                <div className="modal-overlay">
                    <div className="modal-container large">
                        <button onClick={() => setShowDetailsForm(false)} className="modal-close">
                            <MdClose />
                        </button>
                        <PortfolioDetailsForm onClose={() => setShowDetailsForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

PortfolioHome.propTypes = {
    user: PropTypes.shape({
        bio: PropTypes.string,
        photos: PropTypes.arrayOf(
            PropTypes.shape({
                value: PropTypes.string,
            })
        ),
        displayName: PropTypes.string,
        profileImage: PropTypes.shape({
            url: PropTypes.string,
            public_id: PropTypes.string
        }),
        username: PropTypes.string
    }),
};

export default PortfolioHome;