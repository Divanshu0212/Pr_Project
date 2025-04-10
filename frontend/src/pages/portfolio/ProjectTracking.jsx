import React, { useState } from 'react';
import { FaCheck, FaHourglass, FaClock, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProjectTracking = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Sample project data - in a real app, this would come from your portfolio context/API
  const projects = [
    {
      id: 1,
      title: 'E-Commerce Website',
      description: 'A full-stack e-commerce platform with user authentication and payment integration.',
      startDate: '2023-01-15',
      endDate: null,
      status: 'in-progress',
      completion: 75,
      tasks: [
        { id: 1, title: 'Design UI/UX', completed: true },
        { id: 2, title: 'Implement authentication', completed: true },
        { id: 3, title: 'Build product catalog', completed: true },
        { id: 4, title: 'Add payment gateway', completed: false },
      ]
    },
    {
      id: 2,
      title: 'Portfolio Website',
      description: 'Personal portfolio website to showcase projects and skills.',
      startDate: '2022-11-01',
      endDate: '2022-12-30',
      status: 'completed',
      completion: 100,
      tasks: [
        { id: 1, title: 'Design layout', completed: true },
        { id: 2, title: 'Implement responsive design', completed: true },
        { id: 3, title: 'Add content', completed: true },
        { id: 4, title: 'Deploy to hosting', completed: true },
      ]
    },
    {
      id: 3,
      title: 'Mobile App',
      description: 'A React Native app for fitness tracking with social features.',
      startDate: '2023-03-10',
      endDate: null,
      status: 'planned',
      completion: 0,
      tasks: [
        { id: 1, title: 'Create wireframes', completed: false },
        { id: 2, title: 'Set up development environment', completed: false },
        { id: 3, title: 'Implement core functionality', completed: false },
        { id: 4, title: 'Test on multiple devices', completed: false },
      ]
    }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.status === filter);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planned': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
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
    navigate('/portfolio/add');
  };

  return (
    <div className="p-8 bg-[#0D1117] text-[#E5E5E5] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#00FFFF]">Project Tracking</h1>
          <button 
            onClick={addNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-[#9C27B0] text-white rounded hover:bg-purple-700 transition-colors"
          >
            <FaPlus /> Add Project
          </button>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-[#161B22] rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-[#E5E5E5]">{project.title}</h2>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span>{project.status.replace('-', ' ').toUpperCase()}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-4">{project.description}</p>
                
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>Started: {formatDate(project.startDate)}</span>
                  <span>End: {formatDate(project.endDate)}</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm text-gray-400">{project.completion}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00FFFF]" 
                      style={{ width: `${project.completion}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Tasks</h3>
                  <ul className="space-y-2">
                    {project.tasks.map(task => (
                      <li key={task.id} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-500' : 'border border-gray-500'}`}>
                          {task.completed && <FaCheck className="text-xs" />}
                        </div>
                        <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                          {task.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => navigate(`/portfolio/${project.id}`)}
                    className="px-4 py-2 bg-[#161B22] border border-[#00FFFF] text-[#00FFFF] rounded hover:bg-[#0D1117] transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTracking;