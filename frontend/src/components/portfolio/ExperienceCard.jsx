import React from 'react';
import { MdEdit, MdDelete, MdBusiness, MdLocationOn, MdCalendarToday } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/animations.css';

const ExperienceCard = ({ experience, onEdit, onDelete }) => {
  const { theme } = useTheme();
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
  };

  const cardClasses = `
    experience-card group relative overflow-hidden rounded-xl p-6
    transition-all duration-500 ease-out transform
    hover:scale-[1.01] hover:shadow-2xl
    ${theme === 'dark' 
        ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(13,17,23)] border border-gray-700 hover:border-[#00FFFF]' 
        : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-blue-400'
    }
    animate-fadeInUp
  `;

  const textPrimary = theme === 'dark' ? 'text-[#E5E5E5]' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const accentText = theme === 'dark' ? 'text-[#00FFFF]' : 'text-blue-600';

  return (
    <div className={cardClasses}>
      {/* Gradient overlay for hover effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300
        ${theme === 'dark' 
          ? 'bg-gradient-to-br from-[#00FFFF] to-[#9C27B0]' 
          : 'bg-gradient-to-br from-blue-500 to-purple-500'
        }
      `} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4 flex-1">
            {/* Company Logo */}
            {experience.companyLogo?.url && (
              <div className="relative group/logo">
                <img 
                  src={experience.companyLogo.url} 
                  alt={`${experience.company} logo`} 
                  className={`
                    w-16 h-16 rounded-xl object-cover transition-all duration-300
                    ${theme === 'dark' 
                      ? 'border-2 border-gray-600 group-hover/logo:border-[#00FFFF]' 
                      : 'border-2 border-gray-200 group-hover/logo:border-blue-400'
                    }
                    shadow-lg group-hover/logo:shadow-xl transform group-hover/logo:scale-105
                  `}
                />
                <div className={`
                  absolute inset-0 rounded-xl opacity-0 group-hover/logo:opacity-20 transition-opacity duration-300
                  ${theme === 'dark' 
                    ? 'bg-gradient-to-br from-[#00FFFF] to-[#9C27B0]' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }
                `} />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Position Title with gradient hover effect */}
              <h3 className={`
                text-xl font-bold mb-1 transition-all duration-300
                ${textPrimary}
                group-hover:bg-gradient-to-r 
                ${theme === 'dark' 
                  ? 'group-hover:from-[#00FFFF] group-hover:to-[#9C27B0]' 
                  : 'group-hover:from-blue-600 group-hover:to-purple-600'
                }
                group-hover:bg-clip-text group-hover:text-transparent
              `}>
                {experience.position}
              </h3>
              
              {/* Company Name */}
              <div className="flex items-center gap-2 mb-2">
                <MdBusiness className={`${accentText} text-sm`} />
                <p className={`${accentText} font-semibold text-lg`}>
                  {experience.company}
                </p>
              </div>
              
              {/* Date and Duration */}
              <div className="flex items-center gap-2 mb-1">
                <MdCalendarToday className={`${textSecondary} text-sm`} />
                <p className={`${textSecondary} text-sm font-medium`}>
                  {formatDate(experience.startDate)} - {experience.isCurrent ? 'Present' : formatDate(experience.endDate)} 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-[#00FFFF]/10 text-[#00FFFF]' : 'bg-blue-100 text-blue-700'}`}>
                    {experience.displayDuration}
                  </span>
                </p>
              </div>
              
              {/* Employment Type and Location */}
              <div className="flex items-center gap-4 mb-4">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${theme === 'dark' 
                    ? 'bg-[#9C27B0]/20 text-[#9C27B0] border border-[#9C27B0]/30' 
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }
                `}>
                  {experience.employmentType}
                </span>
                <div className="flex items-center gap-1">
                  <MdLocationOn className={`${textSecondary} text-sm`} />
                  <span className={`${textSecondary} text-sm`}>
                    {experience.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 ml-4">
            <button 
              onClick={() => onEdit(experience)}
              className={`
                p-3 rounded-xl transition-all duration-300 transform hover:scale-110
                ${theme === 'dark' 
                  ? 'text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 hover:shadow-lg hover:shadow-cyan-500/25' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/25'
                }
              `}
              title="Edit Experience"
            >
              <MdEdit size={20} />
            </button>
            <button 
              onClick={() => onDelete(experience._id)}
              className={`
                p-3 rounded-xl transition-all duration-300 transform hover:scale-110
                ${theme === 'dark' 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/25' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/25'
                }
              `}
              title="Delete Experience"
            >
              <MdDelete size={20} />
            </button>
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-6">
          <p className={`${textPrimary} leading-relaxed text-sm`}>
            {experience.description}
          </p>
        </div>
        
        {/* Skills */}
        {experience.skills?.length > 0 && (
          <div className="mt-6">
            <h4 className={`text-sm font-semibold mb-3 ${textPrimary}`}>Skills & Technologies:</h4>
            <div className="flex flex-wrap gap-2">
              {experience.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className={`
                    px-3 py-2 rounded-full text-xs font-medium
                    transition-all duration-300 transform hover:scale-105 cursor-default
                    ${theme === 'dark' 
                      ? 'bg-gradient-to-r from-[#0D1117] to-[#161B22] border border-[#00FFFF] text-[#00FFFF] hover:shadow-lg hover:shadow-cyan-500/25' 
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 hover:shadow-lg hover:shadow-blue-500/25'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ExperienceCard.propTypes = {
  experience: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ExperienceCard;