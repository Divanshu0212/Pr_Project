import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEllipsisV, FaComments, FaCheck } from 'react-icons/fa';

const TeamCollab = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample team data - in a real app, this would come from your context/API
  const teamProjects = [
    {
      id: 1,
      title: 'E-Commerce Website',
      description: 'Building a full-stack e-commerce solution with React and Node.js',
      members: [
        { id: 1, name: 'John Doe', avatar: '/api/placeholder/40/40', role: 'Frontend Developer' },
        { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/40/40', role: 'Backend Developer' },
        { id: 3, name: 'Alex Johnson', avatar: '/api/placeholder/40/40', role: 'UI/UX Designer' }
      ],
      dueDate: '2023-12-30',
      progress: 65,
      status: 'active'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Creating a React Native app for health tracking',
      members: [
        { id: 1, name: 'John Doe', avatar: '/api/placeholder/40/40', role: 'React Native Developer' },
        { id: 4, name: 'Sarah Williams', avatar: '/api/placeholder/40/40', role: 'Backend Developer' }
      ],
      dueDate: '2024-02-15',
      progress: 30,
      status: 'active'
    },
    {
      id: 3,
      title: 'Portfolio Website Redesign',
      description: 'Modernizing our portfolio website with updated UI and better performance',
      members: [
        { id: 3, name: 'Alex Johnson', avatar: '/api/placeholder/40/40', role: 'Lead Designer' },
        { id: 5, name: 'Mike Brown', avatar: '/api/placeholder/40/40', role: 'Frontend Developer' }
      ],
      dueDate: '2023-11-10',
      progress: 100,
      status: 'completed'
    }
  ];

  const teamMembers = [
    { id: 1, name: 'John Doe', avatar: '/api/placeholder/50/50', role: 'Frontend Developer', availability: 'available' },
    { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/50/50', role: 'Backend Developer', availability: 'busy' },
    { id: 3, name: 'Alex Johnson', avatar: '/api/placeholder/50/50', role: 'UI/UX Designer', availability: 'available' },
    { id: 4, name: 'Sarah Williams', avatar: '/api/placeholder/50/50', role: 'Backend Developer', availability: 'offline' },
    { id: 5, name: 'Mike Brown', avatar: '/api/placeholder/50/50', role: 'Frontend Developer', availability: 'available' }
  ];

  const recentMessages = [
    {
      id: 1,
      sender: { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/40/40' },
      message: 'Ive pushed the latest API changes to GitHub',
      time: '10:45 AM',
      project: 'E-Commerce Website'
    },
    {
      id: 2,
      sender: { id: 3, name: 'Alex Johnson', avatar: '/api/placeholder/40/40' },
      message: 'Final UI designs are ready for review',
      time: 'Yesterday',
      project: 'Portfolio Website Redesign'
    },
    {
      id: 3,
      sender: { id: 5, name: 'Mike Brown', avatar: '/api/placeholder/40/40' },
      message: 'Need help with the authentication component',
      time: 'Yesterday',
      project: 'Mobile App Development'
    }
  ];

  const filteredProjects = teamProjects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvailabilityColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  const addNewProject = () => {
    navigate('/portfolio/add');
  };

  return (
    <div className="p-8 bg-[#0D1117] text-[#E5E5E5] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#00FFFF]">Team Collaboration</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-10 py-2 bg-[#161B22] border border-gray-700 rounded-full text-[#E5E5E5] focus:outline-none focus:border-[#00FFFF]"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button 
              onClick={addNewProject}
              className="flex items-center gap-2 px-4 py-2 bg-[#9C27B0] text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              <FaPlus /> New Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex gap-4 border-b border-gray-700 pb-2">
                <button 
                  className={`px-4 py-2 ${activeTab === 'projects' ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('projects')}
                >
                  Team Projects
                </button>
                <button 
                  className={`px-4 py-2 ${activeTab === 'activities' ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('activities')}
                >
                  Recent Activities
                </button>
              </div>
            </div>

            {activeTab === 'projects' && (
              <div className="space-y-6">
                {filteredProjects.map(project => (
                  <div key={project.id} className="bg-[#161B22] rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-[#E5E5E5]">{project.title}</h2>
                        <div className="flex items-center">
                          {project.status === 'completed' ? (
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                              <FaCheck /> Completed
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">Active</span>
                          )}
                          <button className="ml-2 text-gray-400 hover:text-[#E5E5E5]">
                            <FaEllipsisV />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 mb-4">{project.description}</p>
                      
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
                      
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {project.members.slice(0, 3).map((member, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-full border-2 border-[#161B22] overflow-hidden">
                              <img 
                                src={member.avatar} 
                                alt={member.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {project.members.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs border-2 border-[#161B22]">
                              +{project.members.length - 3}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          Due: {formatDate(project.dueDate)}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
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
            )}

            {activeTab === 'activities' && (
              <div className="bg-[#161B22] rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-[#E5E5E5] mb-4">Recent Activities</h2>
                <div className="space-y-6">
                  {recentMessages.map(message => (
                    <div key={message.id} className="flex gap-3 pb-4 border-b border-gray-700">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={message.sender.avatar} 
                          alt={message.sender.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-[#E5E5E5]">{message.sender.name}</h4>
                          <span className="text-xs text-gray-400">{message.time}</span>
                        </div>
                        <p className="text-gray-400 mt-1">{message.message}</p>
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-[#0D1117] rounded text-[#00FFFF]">
                            {message.project}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team members section */}
            <div className="bg-[#161B22] rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-[#E5E5E5] mb-4">Team Members</h2>
              <div className="space-y-4">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#161B22] ${getAvailabilityColor(member.availability)}`}
                      ></span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#E5E5E5]">{member.name}</h4>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages section */}
            <div className="bg-[#161B22] rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#E5E5E5]">Messages</h2>
                <button className="text-[#00FFFF] hover:underline text-sm">View All</button>
              </div>
              <div className="space-y-4">
                {recentMessages.map(message => (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={message.sender.avatar} 
                        alt={message.sender.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-[#E5E5E5] text-sm">{message.sender.name}</h4>
                        <span className="text-xs text-gray-400">{message.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-[#0D1117] text-[#00FFFF] rounded hover:bg-gray-800 transition-colors">
                  <FaComments /> Open Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCollab;