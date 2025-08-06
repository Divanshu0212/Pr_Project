import React, { useState } from 'react';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import SummaryApi from '../../config/index';
import ProjectCard from '../../components/portfolio/ProjectCard';
import '../../styles/pages/ProjectTracking.css';

const ProjectTracking = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

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

    const addNewProject = () => {
        navigate('/portfolio/projects/add');
    };

    return (
        // CRITICAL FIX: The outer wrapper is removed. React.Fragment is used instead.
        <>
            {/* The .page-container class is now correctly placed here */}
            <div className="page-container project-tracking-content">
                <div className="page-header">
                    <button
                        onClick={() => navigate('/portfolio')}
                        className="back-button"
                    >
                        <FaArrowLeft /> Back to Portfolio
                    </button>
                    <button
                        onClick={addNewProject}
                        className="add-project-button"
                    >
                        <FaPlus /> Add Project
                    </button>
                </div>

                <h1 className="page-title">Project Tracking</h1>

                <div className="filter-section">
                    <div className="filter-tabs">
                        <button
                            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Projects
                        </button>
                        <button
                            className={`filter-button ${filter === 'in-progress' ? 'active' : ''}`}
                            onClick={() => setFilter('in-progress')}
                        >
                            In Progress
                        </button>
                        <button
                            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`filter-button ${filter === 'planned' ? 'active' : ''}`}
                            onClick={() => setFilter('planned')}
                        >
                            Planned
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state-text">
                            {filter === 'all'
                                ? "You don't have any projects yet"
                                : `No ${filter.replace('-', ' ')} projects`}
                        </p>
                        <button
                            onClick={addNewProject}
                            className="empty-state-button"
                        >
                            Add Your First Project
                        </button>
                    </div>
                ) : (
                    <div className="project-grid">
                        {projects.map(project => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ProjectTracking;