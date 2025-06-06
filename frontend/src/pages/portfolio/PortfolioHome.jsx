import React, { useContext, useState } from 'react';
import { FaPlus, FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaCamera } from 'react-icons/fa';
import { MdEdit, MdLocationOn, MdWork, MdClose, MdCheck } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../../styles/pages/PortfolioHome.css';
import { AuthContext } from '../../context/AuthContext';
import SummaryApi from '../../config';

const PortfolioHome = ({ user: propUser }) => {
    const navigate = useNavigate();
    const {
        currentUser,
        fetchUserDetails,
        setCurrentUser
    } = useContext(AuthContext);

    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState(propUser?.bio || currentUser?.bio || 'As a dedicated professional, I excel in software development with a focus on creating innovative solutions. My experience in diverse projects and passion for excellence make me a valuable asset. I thrive in fast-paced environments, consistently delivering high-quality results and exceeding expectations.');
    const [hoveredProject, setHoveredProject] = useState(null);
    const [activeTab, setActiveTab] = useState('projects');

    const [isEditingPic, setIsEditingPic] = useState(false);
    const [newProfilePic, setNewProfilePic] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const user = propUser || currentUser;

    const handleEditBioClick = () => {
        setIsEditingBio(!isEditingBio);
    };

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

    // Organized skills by category for better display
    const skillCategories = {
        'Languages': ['javascript', 'python', 'java', 'typescript'],
        'Frontend': ['react', 'angular', 'vue.js', 'html/css'],
        'Backend': ['node.js', 'express', 'django', 'spring'],
        'Database': ['mongodb', 'sql', 'postgresql', 'firebase'],
        'DevOps': ['aws', 'docker', 'kubernetes', 'ci/cd', 'git'],
        'Other': ['rest api', 'graphql', 'figma', 'jira']
    };

    const handleBioChange = (event) => {
        setBio(event.target.value);
    };

    const handleSaveBioClick = () => {
        setIsEditingBio(false);
        // Save the updated bio to the server or context here if needed
    };

    const handleAddProject = () => {
        navigate('/portfolio/add');
    };

    const handleAddCertificate = () => {
        navigate('/portfolio/add');
    };

    // Sample data - in a real app this would come from props or context
    const projects = [
        {
            id: 1,
            name: 'AskUrDoc',
            image: '../src/img/askurdoc.jpg',
            link: 'https://github.com/Speedy2705/DBMS_Project',
            description: 'A healthcare platform connecting patients with doctors. Built with React, Node.js, and MongoDB.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
            status: 'completed',
            progress: 100
        },
        {
            id: 2,
            name: 'E-Commerce',
            image: '../src/img/E-Commerce.jpg',
            link: 'https://github.com/Speedy2705/MERN',
            description: 'A full-stack e-commerce solution with product catalog, cart functionality, and payment integration.',
            technologies: ['MERN Stack', 'Redux', 'Stripe API'],
            status: 'in-progress',
            progress: 85
        },
        {
            id: 3,
            name: 'TrackFolio',
            image: '../src/img/TrackFolio.jpg',
            link: 'https://github.com/Speedy2705/Pr_Project',
            description: 'Portfolio tracking application for showcasing projects and generating resumes with ATS analysis.',
            technologies: ['React', 'Firebase', 'Tailwind CSS'],
            status: 'in-progress',
            progress: 70
        },
        {
            id: 4,
            name: 'Gaming Community',
            image: '../src/img/BigDawgs.png',
            link: 'https://github.com/Divanshu0212/canuhkit',
            description: 'A gaming community platform with forum, event scheduling, and team management features.',
            technologies: ['Vue.js', 'Firebase', 'Socket.io'],
            status: 'completed',
            progress: 100
        },
    ];

    const certificates = [
        { id: 1, name: '12th Certificate', image: '../src/img/12th-Certificate.jpg', link: 'https://example.com/certificate1', issuer: 'CBSE', date: '2019' },
        { id: 2, name: 'JEE Certificate', image: '../src/img/JEE-Certificate.jpg', link: 'https://example.com/certificate2', issuer: 'JEE Board', date: '2019' },
    ];

    const stats = {
        projectsCount: 10,
        completedTasks: 8,
        certificates: 2,
        experience: '3 years'
    };

    // Helper function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            case 'planned': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const viewProjectDetails = (projectId) => {
        navigate(`/portfolio/${projectId}`);
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
                                    <div className="bg-[#161B22] rounded-lg p-6 max-w-md w-full mx-4">
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
                                    <span className="flex items-center gap-1"><MdWork /> Software Developer</span>
                                    <span className="flex items-center gap-1"><MdLocationOn /> San Francisco, CA</span>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-4">
                                <a href="#" className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaGithub size={24} />
                                </a>
                                <a href="#" className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaLinkedin size={24} />
                                </a>
                                <a href="#" className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaTwitter size={24} />
                                </a>
                                <a href="#" className="text-[#E5E5E5] hover:text-[#00FFFF] transition-colors">
                                    <FaEnvelope size={24} />
                                </a>
                            </div>
                        </div>

                        {/* Bio and remaining code remains the same */}
                        <div className="mb-6">
                            <div className="flex items-start gap-2">
                                {isEditingBio ? (
                                    <textarea
                                        value={bio}
                                        onChange={handleBioChange}
                                        className="w-full p-4 bg-[#161B22] text-[#E5E5E5] rounded border border-gray-700 focus:border-[#00FFFF] focus:outline-none"
                                        rows={4}
                                    />
                                ) : (
                                    <p className="text-gray-400 leading-relaxed">{bio}</p>
                                )}
                                <button
                                    onClick={isEditingBio ? handleSaveBioClick : handleEditBioClick}
                                    className="p-2 text-[#E5E5E5] hover:text-[#00FFFF] transition-colors"
                                    title={isEditingBio ? "Save Bio" : "Edit Bio"}
                                >
                                    <MdEdit size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#161B22] p-4 rounded-lg text-center shadow-md border border-gray-800">
                                <p className="text-2xl font-bold text-[#00FFFF]">{stats.projectsCount}</p>
                                <p className="text-sm text-gray-400">Projects</p>
                            </div>
                            <div className="bg-[#161B22] p-4 rounded-lg text-center shadow-md border border-gray-800">
                                <p className="text-2xl font-bold text-[#00FFFF]">{stats.completedTasks}</p>
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
                {/* Skills Section */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-[#00FFFF] mb-6 pb-2 border-b border-gray-700">Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(skillCategories).map(([category, skills]) => (
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
                        ))}
                    </div>
                </div>

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
                                onClick={handleAddProject}
                                className="flex items-center gap-2 px-4 py-2 bg-[#9C27B0] text-white rounded hover:bg-purple-700 transition-colors"
                            >
                                <FaPlus /> Add Project
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map((project, index) => (
                                <div
                                    key={project.id}
                                    className="bg-[#161B22] rounded-lg shadow-lg overflow-hidden border border-gray-800 hover:border-[#00FFFF] transition-all duration-300"
                                    onMouseEnter={() => setHoveredProject(index)}
                                    onMouseLeave={() => setHoveredProject(null)}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-semibold text-[#E5E5E5]">{project.name}</h3>
                                            <div className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                                                {project.status.replace('-', ' ')}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mb-4">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={project.image}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-3 line-clamp-3">{project.description}</p>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {project.technologies.slice(0, 3).map((tech, idx) => (
                                                        <span key={idx} className="text-xs bg-[#0D1117] px-2 py-1 rounded text-[#00FFFF]">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 3 && (
                                                        <span className="text-xs bg-[#0D0D1117] px-2 py-1 rounded text-gray-400">
                                                            +{project.technologies.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-400">Progress</span>
                                                <span className="text-sm text-gray-400">{project.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#00FFFF]"
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[#00FFFF] hover:underline"
                                            >
                                                <FaGithub /> View Code
                                            </a>
                                            <button
                                                onClick={() => viewProjectDetails(project.id)}
                                                className="px-4 py-2 bg-[#161B22] border border-[#00FFFF] text-[#00FFFF] rounded hover:bg-[#0D1117] transition-colors"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                className="flex items-center gap-2 px-4 py-2 bg-[#9C27B0] text-white rounded hover:bg-purple-700 transition-colors"
                            >
                                <FaPlus /> Add Certificate
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificates.map((certificate) => (
                                <div key={certificate.id} className="bg-[#161B22] rounded-lg shadow-lg overflow-hidden border border-gray-800">
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={certificate.image}
                                            alt={certificate.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-[#E5E5E5] mb-2">{certificate.name}</h3>
                                        <div className="flex justify-between text-gray-400 text-sm mb-4">
                                            <span>Issued by: {certificate.issuer}</span>
                                            <span>{certificate.date}</span>
                                        </div>
                                        <div className="flex justify-end">
                                            <a
                                                href={certificate.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-[#161B22] border border-[#00FFFF] text-[#00FFFF] rounded hover:bg-[#0D1117] transition-colors"
                                            >
                                                View Certificate
                                            </a>
                                        </div>
                                    </div>
                                </div>
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
                        </div>
                    </div>
                )}
            </div>
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
    }),
};

export default PortfolioHome;