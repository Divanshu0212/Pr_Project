import React, { useContext, useState } from 'react';
import { FaPlus, FaGithub, FaLinkedin, FaTwitter, FaCertificate, FaCamera, FaInstagram, FaFacebook } from 'react-icons/fa';
import { MdEdit, MdLocationOn, MdWork, MdClose, MdCheck } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../../styles/pages/PortfolioHome.css';
import { AuthContext } from '../../context/AuthContext';
import SummaryApi from '../../config';
import PortfolioDetailsForm from './PortfolioDetailsForm';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import ProjectCard from '../../components/portfolio/ProjectCard';
import CertificateCard from '../../components/portfolio/CertificateCard';
import AddCertificateForm from '../../components/portfolio/AddCertificateForm';

const PortfolioHome = ({ user: propUser }) => {
    const navigate = useNavigate();
    const {
        currentUser,
        fetchUserDetails,
        setCurrentUser
    } = useContext(AuthContext);

    const [hoveredProject, setHoveredProject] = useState(null);
    const [activeTab, setActiveTab] = useState('projects');

    const [isEditingPic, setIsEditingPic] = useState(false);
    const [newProfilePic, setNewProfilePic] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const { portfolioDetails } = useContext(AuthContext);
    const [showDetailsForm, setShowDetailsForm] = useState(false);

    const [skills, setSkills] = useState([]);
    const [skillCategories, setSkillCategories] = useState({
        'Languages': [],
        'Frontend': [],
        'Backend': [],
        'Database': [],
        'DevOps': [],
        'Other': []
    });

    const [certificates, setCertificates] = useState([]);
    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);

    const user = propUser || {
        ...currentUser,
        ...portfolioDetails
    };

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

                if (!response.ok) {
                    throw new Error('Failed to fetch skills');
                }

                const data = await response.json();
                setSkills(data);

                // Organize skills by category
                const organizedCategories = {
                    'Languages': [],
                    'Frontend': [],
                    'Backend': [],
                    'Database': [],
                    'DevOps': [],
                    'Other': []
                };

                data.forEach(skill => {
                    if (organizedCategories[skill.category]) {
                        organizedCategories[skill.category].push(skill.name.toLowerCase());
                    } else {
                        organizedCategories['Other'].push(skill.name.toLowerCase());
                    }
                });

                setSkillCategories(organizedCategories);
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };

        fetchSkills();
    }, []);

    const handleEditPicClick = () => {
        setIsEditingPic(!isEditingPic);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handlePicChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();

            // Update user context with new image
            const updatedUser = {
                ...user,
                profileImage: data.profileImage
            };
            setCurrentUser(updatedUser);

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

    const handleDeletePic = async () => {
        if (!window.confirm('Are you sure you want to delete your profile image?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.deleteProfileImage.url, {
                method: SummaryApi.deleteProfileImage.method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            // Update user context to remove image
            const updatedUser = {
                ...user,
                profileImage: { public_id: '', url: '' }
            };
            setCurrentUser(updatedUser);

            alert('Profile image deleted successfully');
        } catch (error) {
            console.error('Error deleting profile image:', error);
            alert('Failed to delete profile image');
        }
    };


    const handleCancelPicEdit = () => {
        setNewProfilePic(null);
        setIsEditingPic(false);
    };

    // Fetch projects data
    const { data: projectsData, isLoading: projectsLoading } = useQuery('pinnedProjects', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SummaryApi.projects.get.url}?isPinned=true`, {
            method: SummaryApi.projects.get.method,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
    });

    // Fetch project counts
    const { data: countsData } = useQuery('projectCounts', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(SummaryApi.projects.counts.url, {
            method: SummaryApi.projects.counts.method,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch project counts');
        return response.json();
    });

    // Filter pinned projects
    const pinnedProjects = projectsData?.projects || [];

    // Fetch certificates data
    const { data: certificatesData, refetch: refetchCertificates } = useQuery('certificates', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(SummaryApi.certificates.get.url, {
            method: SummaryApi.certificates.get.method,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch certificates');
        return response.json();
    });

    // Fetch certificate count
    const { data: certificateCount } = useQuery('certificateCount', async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(SummaryApi.certificates.count.url, {
            method: SummaryApi.certificates.count.method,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch certificate count');
        return response.json();
    });

    useEffect(() => {
        if (certificatesData) {
            setCertificates(certificatesData.certificates);
        }
    }, [certificatesData]);

    const handleAddCertificate = () => {
        setEditingCertificate(null);
        setShowCertificateForm(true);
    };

    const handleEditCertificate = (certificate) => {
        setEditingCertificate(certificate);
        setShowCertificateForm(true);
    };

    const handleDeleteCertificate = async (certificateId) => {
        if (!window.confirm('Are you sure you want to delete this certificate?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${SummaryApi.certificates.delete.url}/${certificateId}`, {
                method: SummaryApi.certificates.delete.method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete certificate');
            }

            refetchCertificates();
            alert('Certificate deleted successfully');
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('Failed to delete certificate');
        }
    };

    const handleCertificateSubmit = async (formData, certificateId) => {
        try {
            const token = localStorage.getItem('token');
            let response;

            if (certificateId) {
                // Update existing certificate
                response = await fetch(`${SummaryApi.certificates.update.url}/${certificateId}`, {
                    method: SummaryApi.certificates.update.method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            } else {
                // Add new certificate
                response = await fetch(SummaryApi.certificates.add.url, {
                    method: SummaryApi.certificates.add.method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            }

            if (!response.ok) {
                throw new Error(certificateId ? 'Failed to update certificate' : 'Failed to add certificate');
            }

            refetchCertificates();
        } catch (error) {
            console.error('Error submitting certificate:', error);
            throw error;
        }
    };

    const stats = {
        projectsCount: countsData?.counts?.total || 0,
        completedProjects: countsData?.counts?.completed || 0,
        certificates: certificateCount?.count || 0,
        experience: portfolioDetails.yearsOfExperience + 'Yrs' || '3 Yrs'
    };

    return (
        <div className="mx-auto px-6 py-8 w-full bg-[#0D1117] text-[#E5E5E5] min-h-screen">
            {/* Profile Header Section */}
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Profile Picture with Enhanced UI */}
                    <div className="flex-shrink-0 relative group">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                            <img
                                src={newProfilePic || user?.profileImage?.url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />

                            {/* Hover overlay for edit button */}
                            {!isEditingPic && (
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300 cursor-pointer"
                                    onClick={handleEditPicClick}>
                                    <div className="opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-4 transition-all duration-300">
                                        <FaCamera size={24} className="text-white mx-auto mb-2" />
                                        <p className="text-white text-sm font-medium text-center">Change Photo</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Edit profile pic modal */}
                        {isEditingPic && (
                            <div className="absolute top-0 left-0 w-full h-full">
                                <div className="fixed inset-0 bg-black bg-opacity-75 z-10 flex items-center justify-center">
                                    <div className="bg-[#161B22] rounded-lg p-6 max-w-md w-full mx-4 top-[calc(-500px)] relative">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-semibold text-[#E5E5E5]">Update Profile Picture</h3>
                                            <button
                                                onClick={handleCancelPicEdit}
                                                className="text-gray-400 hover:text-white">
                                                <MdClose size={24} />
                                            </button>
                                        </div>

                                        <div className="mb-6">
                                            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#00FFFF] shadow-lg mb-4">
                                                <img
                                                    src={newProfilePic || user?.profileImage?.url}
                                                    alt="Profile Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handlePicChange}
                                                accept="image/*"
                                                className="hidden"
                                            />

                                            <button
                                                onClick={triggerFileInput}
                                                className="w-full py-3 bg-[#2D333B] text-[#E5E5E5] rounded-lg hover:bg-[#444C56] transition-colors flex items-center justify-center gap-2 mb-4">
                                                <FaPlus /> Select New Image
                                            </button>

                                            {newProfilePic && (
                                                <p className="text-sm text-gray-400 text-center mb-4">Preview shown above. Click save to confirm changes.</p>
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleSavePicClick}
                                                disabled={isUploading}
                                                className="flex-1 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                                {isUploading ? 'Uploading...' : (
                                                    <>
                                                        <MdCheck size={20} /> Save Changes
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancelPicEdit}
                                                className="flex-1 py-2 bg-[#2D333B] text-[#E5E5E5] rounded-lg hover:bg-[#444C56] transition-colors">
                                                Cancel
                                            </button>
                                        </div>

                                        {user?.profileImage?.url && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={handleDeletePic}
                                                    className="w-full py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                    Delete Current Image
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-bold text-[#E5E5E5] mb-2">{user?.username || 'John Doe'}</h1>
                                <div className="flex items-center gap-4 text-gray-400 mb-4">
                                    <span className="flex items-center gap-1"><MdWork /> {portfolioDetails.jobTitle}</span>
                                    <span className="flex items-center gap-1"><MdLocationOn /> {portfolioDetails.location}</span>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-4">
                                <a href={portfolioDetails.socialLinks.github} className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaGithub size={24} />
                                </a>
                                <a href={portfolioDetails.socialLinks.linkedin} className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaLinkedin size={24} />
                                </a>
                                <a href={portfolioDetails.socialLinks.twitter} className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaTwitter size={24} />
                                </a>
                                <a href={portfolioDetails.socialLinks.facebook} className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaFacebook size={24} />
                                </a>
                                <a href={portfolioDetails.socialLinks.instagram} className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaInstagram size={24} />
                                </a>
                            </div>
                        </div>

                        {/* Bio and remaining code remains the same */}
                        <div className="mb-6">
                            <div className="flex items-start gap-2">
                                <p className="text-gray-400 leading-relaxed">{portfolioDetails.bio}</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#161B22] p-4 rounded-lg text-center shadow-md border border-gray-800">
                                <p className="text-2xl font-bold text-[#00FFFF]">{stats.projectsCount}</p>
                                <p className="text-sm text-gray-400">Projects</p>
                            </div>
                            <div className="bg-[#161B22] p-4 rounded-lg text-center shadow-md border border-gray-800">
                                <p className="text-2xl font-bold text-[#00FFFF]">{stats.completedProjects}</p>
                                <p className="text-sm text-gray-400">Completed Tasks</p>
                            </div>
                            <div className="bg-[#161B22] p-4 rounded-lg text-center shadow-md border border-gray-800">
                                <p className="text-2xl font-bold text-[#00FFFF]">{stats.certificates}</p>
                                <p className="text-sm text-gray-400">Certificates</p>
                            </div>
                            <div className="bg-[#161B22] p-4 rounded-lg text-center shadow-md border border-gray-800">
                                <p className="text-2xl font-bold text-[#00FFFF]">{stats.experience}</p>
                                <p className="text-sm text-gray-400">Experience</p>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowDetailsForm(true)}
                    className="relative left-[calc(46%)] px-4 py-2 bg-gray-700 w-10 h-fit hover:bg-gray-600 rounded-full transition-colors"
                >
                    <MdEdit className="inline-block relative right-1 bottom-0.5" />
                </button>
                {/* Skills Section */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-[#00FFFF] mb-6 pb-2 border-b border-gray-700">Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(skillCategories).map(([category, skills]) => (
                            skills.length > 0 && (
                                <div key={category} className="bg-[#161B22] p-6 rounded-lg shadow-md border border-gray-800">
                                    <h3 className="text-lg font-semibold text-[#E5E5E5] mb-4">{category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-[#0D1117] border border-[#00FFFF] text-[#00FFFF] rounded-full text-xs"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => navigate('/portfolio/skills')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00FFFF] text-black rounded hover:opacity-90 transition-opacity mb-8"
                >
                    <MdEdit /> Manage Skills
                </button>

                {/* Portfolio Tabs */}
                <div className="mb-6">
                    <div className="flex gap-4 border-b border-gray-700 pb-2">
                        <button
                            className={`px-6 py-3 text-lg ${activeTab === 'projects' ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('projects')}
                        >
                            Projects
                        </button>
                        <button
                            className={`px-6 py-3 text-lg ${activeTab === 'certificates' ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('certificates')}
                        >
                            Certificates
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                {activeTab === 'projects' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#00FFFF]">Pinned Projects</h2>
                            <button
                                onClick={() => navigate('/portfolio/add')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <FaPlus /> Add Project
                            </button>
                        </div>

                        {projectsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
                            </div>
                        ) : pinnedProjects.length === 0 ? (
                            <div className="bg-[#161B22] rounded-lg p-8 text-center border border-dashed border-gray-600">
                                <p className="text-gray-400 mb-4">No pinned projects yet</p>
                                <button
                                    onClick={() => navigate('/portfolio/add')}
                                    className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90"
                                >
                                    Add Your First Project
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pinnedProjects.map((project) => (
                                    <ProjectCard key={project._id} project={project} />
                                ))}
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => navigate('/portfolio/tracking')}
                                className="px-6 py-3 border border-[#00FFFF] text-[#00FFFF] rounded-lg hover:bg-[#00FFFF]/10 transition-colors"
                            >
                                View All Projects
                            </button>
                        </div>
                    </div>
                )}

                {/* Certificates Grid */}
                {activeTab === 'certificates' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#00FFFF]">Certificates</h2>
                            <button
                                onClick={handleAddCertificate}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <FaPlus /> Add Certificate
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificates.length === 0 ? (
                                <div className="md:col-span-2 bg-[#161B22] rounded-lg p-8 text-center border border-dashed border-gray-600">
                                    <FaCertificate size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-400 mb-4">No certificates added yet</p>
                                    <button
                                        onClick={handleAddCertificate}
                                        className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90"
                                    >
                                        Add Your First Certificate
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {certificates.map((certificate) => (
                                        <CertificateCard
                                            key={certificate._id}
                                            certificate={certificate}
                                            onEdit={handleEditCertificate}
                                            onDelete={handleDeleteCertificate}
                                        />
                                    ))}
                                    <div
                                        onClick={handleAddCertificate}
                                        className="bg-[#161B22] rounded-lg border border-dashed border-gray-600 flex items-center justify-center h-64 cursor-pointer hover:border-[#00FFFF] transition-colors"
                                    >
                                        <div className="text-center">
                                            <FaPlus size={24} className="mx-auto mb-2 text-gray-400" />
                                            <p className="text-gray-400">Add New Certificate</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {showCertificateForm && (
                    <AddCertificateForm
                        onClose={() => setShowCertificateForm(false)}
                        onSubmit={handleCertificateSubmit}
                        initialData={editingCertificate}
                        isEditing={!!editingCertificate}
                    />
                )}
            </div>

            {
                showDetailsForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                        <div className="relative w-full max-w-4xl md:bottom-44 bottom-96">
                            <button
                                onClick={() => setShowDetailsForm(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                            >
                                <MdClose size={24} />
                            </button>
                            <PortfolioDetailsForm onClose={() => setShowDetailsForm(false)} />
                        </div>
                    </div>
                )
            }
        </div >
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
        })
    }),
};

export default PortfolioHome;