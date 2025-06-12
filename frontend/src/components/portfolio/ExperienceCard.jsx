import React from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import PropTypes from 'prop-types';

const ExperienceCard = ({ experience, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
};

  return (
    <div className="bg-[#161B22] rounded-lg p-6 border border-gray-700 hover:border-[#00FFFF] transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          {experience.companyLogo?.url && (
            <img 
              src={experience.companyLogo.url} 
              alt={`${experience.company} logo`} 
              className="w-12 h-12 rounded-full object-cover border border-gray-600"
            />
          )}
          <div>
            <h3 className="text-xl font-semibold text-[#E5E5E5]">{experience.position}</h3>
            <p className="text-[#00FFFF]">{experience.company}</p>
            <p className="text-gray-400 text-sm">
              {formatDate(experience.startDate)} - {experience.isCurrent ? 'Present' : formatDate(experience.endDate)} • {experience.displayDuration}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {experience.employmentType} • {experience.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(experience)}
            className="text-gray-400 hover:text-[#00FFFF] transition-colors"
          >
            <MdEdit size={20} />
          </button>
          <button 
            onClick={() => onDelete(experience._id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <MdDelete size={20} />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-gray-300">{experience.description}</p>
      </div>
      {experience.skills?.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {experience.skills.map((skill, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-[#0D1117] border border-[#00FFFF] text-[#00FFFF] rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ExperienceCard.propTypes = {
  experience: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ExperienceCard;
