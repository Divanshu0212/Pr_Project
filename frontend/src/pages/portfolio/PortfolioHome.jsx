import React, { useContext, useState, useEffect } from 'react';
import { FaPlus, FaGithub, FaLinkedin, FaTwitter, FaCertificate, FaCamera, FaInstagram, FaFacebook, FaEdit, FaEye, FaShare, FaDownload } from 'react-icons/fa';
import { MdEdit, MdLocationOn, MdWork, MdClose, MdCheck, MdEmail, MdPhone, MdLanguage } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../../styles/pages/PortfolioHome.css';
import '../../styles/animations.css';
import { AuthContext } from '../../context/AuthContext';
import SummaryApi from '../../config';
import PortfolioDetailsForm from './PortfolioDetailsForm'; // Ensure this path is correct
import { useQuery } from 'react-query';
import ProjectCard from '../../components/portfolio/ProjectCard';
import CertificateCard from '../../components/portfolio/CertificateCard';
import AddCertificateForm from '../../components/portfolio/AddCertificateForm';
import ExperienceTab from '../../components/portfolio/ExperienceTab';
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
    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);
    const [skills, setSkills] = useState([]);
    const [certificates, setCertificates] = useState([]);
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

    const { data: certificatesData, refetch: refetchCertificates } = useQuery('certificates', async () => {
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

    // Certificate handlers
    const handleCertificateSubmit = async (formData, certificateId) => {
        try {
            const token = localStorage.getItem('token');
            const url = certificateId
                ? `${SummaryApi.certificates.update.url}/${certificateId}`
                : SummaryApi.certificates.add.url;
            const method = certificateId
                ? SummaryApi.certificates.update.method
                : SummaryApi.certificates.add.method;

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                throw new Error(certificateId ? 'Failed to update certificate' : 'Failed to add certificate');
            }

            refetchCertificates();
        } catch (error) {
            console.error('Error submitting certificate:', error);
            throw error;
        }
    };

    const handleDeleteCertificate = async (certificateId) => {
        if (!window.confirm('Are you sure you want to delete this certificate?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${SummaryApi.certificates.delete.url}/${certificateId}`, {
                method: SummaryApi.certificates.delete.method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete certificate');

            refetchCertificates();
            alert('Certificate deleted successfully');
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('Failed to delete certificate');
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

    const profileActions = [
        {
            icon: FaEye,
            label: 'Preview',
            action: () => window.open(`/portfolio/public/${user?.username || 'preview'}`, '_blank'), // Updated to public view
            primary: true
        },
        {
            icon: FaShare,
            label: 'Share',
            action: () => navigator.clipboard.writeText(`${window.location.origin}/portfolio/public/${user?.username}`) // Updated to public view
        },
        {
            icon: FaDownload,
            label: 'Export PDF',
            action: () => navigate('/portfolio/export')
        }
    ];

    return (
        <div className={`portfolio-home ${isDark ? 'dark' : ''}`}>
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
                                {portfolioDetails?.email && (
                                    <span className="meta-item">
                                        <MdEmail /> {portfolioDetails.email}
                                    </span>
                                )}
                                {/* Add phone number meta item if available in portfolioDetails */}
                                {portfolioDetails?.phone && (
                                    <span className="meta-item">
                                        <MdPhone /> {portfolioDetails.phone}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="profile-actions">
                            {profileActions.map((action, index) => (
                                <button
                                    key={index}
                                    className={`action-btn ${action.primary ? 'primary' : ''}`}
                                    onClick={action.action}
                                >
                                    <action.icon />
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

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
                            {/* Add checks for Contact and Social if desired */}
                            <div className={`check-item ${completionStatus.contact ? 'completed' : ''}`}>
                                <MdCheck /> Contact Info
                            </div>
                            <div className={`check-item ${completionStatus.social ? 'completed' : ''}`}>
                                <MdCheck /> Social Links
                            </div>
                            <div className={`check-item ${completionStatus.certificates ? 'completed' : ''}`}>
                                <MdCheck /> Certificates Added
                            </div>
                        </div>

                        <button
                            className="complete-profile-btn"
                            // Link to the dedicated profile settings page
                            onClick={() => navigate('/portfolio/settings')}
                        >
                            <FaEdit /> Complete Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Bio Section */}
            {portfolioDetails?.bio && (
                <div className="bio-section">
                    <p className="bio-text">{portfolioDetails.bio}</p>
                </div>
            )}

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
                            // Navigate to specific pages for Projects, Skills, Certificates, Experience
                            if (section === 'projects') navigate('/portfolio/projects');
                            else if (section === 'skills') navigate('/portfolio/skills');
                            else if (section === 'certificates') navigate('/portfolio/certificates');
                            else if (section === 'experience') navigate('/portfolio/experience');
                            else setActiveSection(section); // Stay on overview tab in PortfolioHome
                        }}
                    >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content Sections (Now only 'overview' remains in PortfolioHome) */}
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
                                            <a href={portfolioDetails.socialLinks.github} className="social-link">
                                                <FaGithub /> GitHub
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.linkedin && (
                                            <a href={portfolioDetails.socialLinks.linkedin} className="social-link">
                                                <FaLinkedin /> LinkedIn
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.twitter && (
                                            <a href={portfolioDetails.socialLinks.twitter} className="social-link">
                                                <FaTwitter /> Twitter
                                            </a>
                                        )}
                                        {/* Add more social links if needed, e.g., Instagram, Facebook, Website */}
                                        {portfolioDetails.socialLinks.instagram && (
                                            <a href={portfolioDetails.socialLinks.instagram} className="social-link">
                                                <FaInstagram /> Instagram
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.facebook && (
                                            <a href={portfolioDetails.socialLinks.facebook} className="social-link">
                                                <FaFacebook /> Facebook
                                            </a>
                                        )}
                                        {portfolioDetails.socialLinks.website && (
                                            <a href={portfolioDetails.socialLinks.website} className="social-link">
                                                <FaGlobe /> Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* The 'projects', 'skills', 'certificates', 'experience' sections are now external pages */}
                {/* These activeSection === 'XYZ' checks should be removed from PortfolioHome
                    because the navigation tabs now link directly to those pages.
                    Keeping them here would mean you have duplicate content if a user navigates
                    to /portfolio and then clicks on the "Projects" tab.
                */}
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

            {/* Portfolio Details Form Modal (This modal is still opened from PortfolioHome) */}
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

            {/* Certificate Form Modal (This modal is now opened from the dedicated CertificatesPage, NOT PortfolioHome) */}
            {/* REMOVE THIS BLOCK FROM PortfolioHome.jsx IF CERTIFICATES IS A SEPARATE PAGE */}
            {/* If CertificatesPage handles its own AddCertificateForm */}
            {/*
            {showCertificateForm && (
                <AddCertificateForm
                    onClose={() => {
                        setShowCertificateForm(false);
                        setEditingCertificate(null);
                    }}
                    onSubmit={handleCertificateSubmit}
                    initialData={editingCertificate}
                    isEditing={!!editingCertificate}
                />
            )}
            */}
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