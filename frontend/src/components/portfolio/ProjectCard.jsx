import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Card from '../common/Card';
import PropTypes from 'prop-types'; // Import PropTypes

const ProjectCard = ({ project }) => {
  const { isDark } = useTheme();

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return isDark ? 'bg-green-500' : 'bg-green-600';
      case 'in-progress': return isDark ? 'bg-blue-500' : 'bg-blue-600';
      case 'planned': return isDark ? 'bg-yellow-500' : 'bg-yellow-600';
      default: return isDark ? 'bg-gray-500' : 'bg-gray-600';
    }
  };

  const getStatusTextColor = (status) => {
    return 'text-white';
  };

  return (
    <Card 
      className="group relative overflow-hidden transform transition-all duration-500 hover:scale-105 animate-slideInUp"
      variant="interactive"
    >
      {/* Gradient overlay for enhanced visual appeal */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-cyan-400 via-purple-500 to-cyan-400' 
          : 'bg-gradient-to-br from-blue-400 via-purple-500 to-blue-400'
      }`} />
      
      <div className="relative p-6 z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-xl font-bold transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text ${
            isDark 
              ? 'text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400'
              : 'text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600'
          }`}>
            {project.title}
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 transform group-hover:scale-110 ${getStatusColor(project.status)} ${getStatusTextColor(project.status)}`}>
            {project.status.replace('-', ' ').toUpperCase()}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative group-hover:shadow-lg transition-shadow duration-300">
            <img
              src={project.image.url}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
              isDark ? 'bg-cyan-400' : 'bg-blue-400'
            }`} />
          </div>
          
          <div className="flex-1">
            <p className={`mb-3 line-clamp-3 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {project.technologies.slice(0, 3).map((tech, idx) => (
                <span 
                  key={idx} 
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-cyan-400 border border-gray-700 hover:border-cyan-400'
                      : 'bg-gray-100 text-blue-600 border border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Progress
            </span>
            <span className={`text-sm font-bold transition-colors duration-300 ${
              isDark ? 'text-cyan-400' : 'text-blue-600'
            }`}>
              {project.progress}%
            </span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className={`h-full transition-all duration-700 ease-out ${
                isDark 
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ 
                width: `${project.progress}%`,
                boxShadow: isDark 
                  ? '0 0 10px rgba(0, 255, 255, 0.3)' 
                  : '0 0 10px rgba(59, 130, 246, 0.3)'
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 font-medium transition-all duration-300 transform hover:scale-105 ${
              isDark 
                ? 'text-cyan-400 hover:text-cyan-300' 
                : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            <FaGithub className="transition-transform duration-300 hover:rotate-12" /> 
            View Code
          </a>
          
          <Link
            to={`/portfolio/${project._id}`}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-gray-900 hover:from-cyan-300 hover:to-purple-300'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
            style={{
              boxShadow: isDark 
                ? '0 4px 15px rgba(0, 255, 255, 0.2)' 
                : '0 4px 15px rgba(59, 130, 246, 0.2)'
            }}
          >
            Details
          </Link>
        </div>
      </div>
    </Card>
  );
};

// Add PropTypes for validation
ProjectCard.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['completed', 'in-progress', 'planned']).isRequired,
    image: PropTypes.shape({
      url: PropTypes.string.isRequired,
    }).isRequired,
    technologies: PropTypes.arrayOf(PropTypes.string).isRequired,
    progress: PropTypes.number.isRequired,
    link: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProjectCard;