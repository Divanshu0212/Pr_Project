import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planned': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-[#161B22] rounded-lg shadow-lg overflow-hidden border border-gray-800 hover:border-[#00FFFF] transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-[#E5E5E5]">{project.title}</h3>
          <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
            {project.status.replace('-', ' ')}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={project.image.url}
              alt={project.title}
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
                <span className="text-xs bg-[#0D1117] px-2 py-1 rounded text-gray-400">
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
          <Link
            to={`/portfolio/${project._id}`}
            className="px-4 py-2 bg-[#161B22] border border-[#00FFFF] text-[#00FFFF] rounded hover:bg-[#0D1117] transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;