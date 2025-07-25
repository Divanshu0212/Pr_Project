import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaGithub, FaEdit, FaTrash, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { MdWork, MdLocationOn } from 'react-icons/md';
import SummaryApi from '../../config';
// import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, isDark } = useTheme();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const observerRef = useRef(null);

    // Add scroll animation observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        observerRef.current = observer;

        // Observe all animatable elements
        const elements = document.querySelectorAll('.info-section, .technology-badge, .task-item');
        elements.forEach((el, index) => {
            el.style.setProperty('--animation-delay', index);
            observer.observe(el);
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [project]); // Re-observe when project data changes

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                setError('');

                if (!id || id === 'undefined') {
                    throw new Error('Invalid project ID');
                }

                const token = localStorage.getItem('token');
                const response = await fetch(SummaryApi.projects.single.url(id), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch project');
                }
                setProject(data.project);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message || 'Failed to fetch project details');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, navigate]); // Depend on ID from URL params

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const token = localStorage.getItem('token');
                await fetch(SummaryApi.projects.delete.url(id), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                navigate('/portfolio'); // Navigate back to portfolio page
            } catch (err) {
                setError('Failed to delete project');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1117] text-[#E5E5E5] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0D1117] text-[#E5E5E5] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/portfolio')} // Navigate back to portfolio page
                        className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90"
                    >
                        Back to Portfolio
                    </button>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#0D1117] text-[#E5E5E5] flex items-center justify-center">
                <div className="text-center">
                    <p className="mb-4">Project not found</p>
                    <button
                        onClick={() => navigate('/portfolio')} // Navigate back to portfolio page
                        className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90"
                    >
                        Back to Portfolio
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            case 'planned': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E5E5E5] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <button
                        onClick={() => navigate('/portfolio')} // Navigate back to portfolio page
                        className="flex items-center gap-2 text-[#00FFFF] hover:underline"
                    >
                        <FaArrowLeft /> Back to Portfolio
                    </button>

                    <div className="flex gap-3">
                        <Link
                            to={`/portfolio/projects/edit/${project._id}`} // Corrected edit route path
                            className="flex items-center gap-2 px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90"
                        >
                            <FaEdit /> Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>

                <div className="bg-[#161B22] rounded-lg shadow-lg overflow-hidden border border-gray-800">
                    {/* Project Header */}
                    <div className="relative h-64 w-full">
                        <img
                            src={project.image.url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6">
                            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                            <div className="flex items-center gap-4">
                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                                    {project.status.replace('-', ' ').toUpperCase()}
                                </span>
                                {project.isPinned && (
                                    <span className="px-3 py-1 bg-purple-500 rounded-full text-xs">
                                        PINNED
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Project Body */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Main Content */}
                            <div className="flex-1">
                                <div className="mb-6 info-section">
                                    <h2 className="text-xl font-semibold mb-3 text-[#00FFFF]">Description</h2>
                                    <p className="text-gray-300 whitespace-pre-line">{project.description}</p>
                                </div>

                                <div className="mb-6 info-section">
                                    <h2 className="text-xl font-semibold mb-3 text-[#00FFFF]">Technologies</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {project.technologies.map((tech, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-[#0D1117] border border-[#00FFFF] text-[#00FFFF] rounded-full text-xs technology-badge"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6 info-section">
                                    <h2 className="text-xl font-semibold mb-3 text-[#00FFFF]">Tasks</h2>
                                    <ul className="space-y-2">
                                        {project.tasks.map((task, index) => (
                                            <li key={index} className="flex items-center gap-3 task-item">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-500' : 'border border-gray-500'}`}>
                                                    {task.completed && <FaCheck className="text-xs" />}
                                                </div>
                                                <span className={`${task.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                                                    {task.title}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="md:w-64 flex-shrink-0 info-section">
                                <div className="bg-[#0D1117] rounded-lg p-4 border border-gray-800 mb-6">
                                    <h3 className="text-lg font-semibold mb-4 text-[#00FFFF]">Project Details</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-400">Status</p>
                                            <p className="capitalize">{project.status.replace('-', ' ')}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-400">Progress</p>
                                            <div className="mt-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm">{project.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#00FFFF]"
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-400">Started</p>
                                            <p>{formatDate(project.startDate)}</p>
                                        </div>

                                        {project.endDate && (
                                            <div>
                                                <p className="text-sm text-gray-400">Completed</p>
                                                <p>{formatDate(project.endDate)}</p>
                                            </div>
                                        )}

                                        <div>
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[#00FFFF] hover:underline"
                                            >
                                                <FaGithub /> View on GitHub
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ProjectDetails.propTypes = {
    // Project object is fetched internally, no prop validation needed for 'project' if this is a route component
    // If it were a reusable component, then PropTypes.shape({ ... }) would be used here.
    // However, the component relies on useParams() for 'id' to fetch its own data.
    // No direct props are passed down from a parent.
};

export default ProjectDetails;