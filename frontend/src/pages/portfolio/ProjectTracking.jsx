import React, { useState } from 'react';
import { FaCheck, FaHourglass, FaClock, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import SummaryApi from '../../config/index';
import ProjectCard from '../../components/portfolio/ProjectCard';

const ProjectTracking = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    // Fetch projects with status filter
    const { data: projectsData, isLoading } = useQuery(
        ['projects', filter],
        async () => {
            const token = localStorage.getItem('token');
            const url = filter === 'all'
                ? SummaryApi.projects.get.url
                : `${SummaryApi.projects.get.url}?status=${filter}`;

            const response = await fetch(url, {
                method: SummaryApi.projects.get.method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch projects');
            return response.json();
        }
    );

    const projects = projectsData?.projects || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            case 'planned': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    // This function is defined but not used in the provided JSX.
    // It's okay to keep if intended for future use or other components.
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <FaCheck />;
            case 'in-progress': return <FaHourglass />;
            case 'planned': return <FaClock />;
            default: return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    const addNewProject = () => {
        navigate('/portfolio/projects/add');
    };

    return (
        <div className="p-8 bg-[#0D1117] text-[#E5E5E5] min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/portfolio')}
                        className="flex items-center gap-2 text-[#00FFFF] hover:underline"
                    >
                        <FaArrowLeft /> Back to Portfolio
                    </button>
                    <button
                        onClick={addNewProject}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <FaPlus /> Add Project
                    </button>
                </div>

                <h1 className="text-3xl font-bold mb-8 text-[#00FFFF]">Project Tracking</h1>

                <div className="mb-6">
                    <div className="flex gap-4 border-b border-gray-700 pb-4">
                        <button
                            className={`px-4 py-2 rounded-t-lg ${filter === 'all' ? 'bg-[#161B22] text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                            onClick={() => setFilter('all')}
                        >
                            All Projects
                        </button>
                        <button
                            className={`px-4 py-2 rounded-t-lg ${filter === 'in-progress' ? 'bg-[#161B22] text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                            onClick={() => setFilter('in-progress')}
                        >
                            In Progress
                        </button>
                        <button
                            className={`px-4 py-2 rounded-t-lg ${filter === 'completed' ? 'bg-[#161B22] text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`px-4 py-2 rounded-t-lg ${filter === 'planned' ? 'bg-[#161B22] text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                            onClick={() => setFilter('planned')}
                        >
                            Planned
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-[#161B22] rounded-lg p-8 text-center border border-dashed border-gray-600">
                        <p className="text-gray-400 mb-4">
                            {filter === 'all'
                                ? "You don't have any projects yet"
                                : `No ${filter.replace('-', ' ')} projects`}
                        </p>
                        <button
                            onClick={addNewProject}
                            className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90"
                        >
                            Add Your First Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ProjectCard handles its own navigation to /portfolio/projects/:projectId */}
                        {projects.map(project => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectTracking;