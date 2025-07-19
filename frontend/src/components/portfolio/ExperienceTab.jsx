import React, { useState, useEffect } from 'react';
import { FaPlus, FaBriefcase } from 'react-icons/fa';
import { useQuery } from 'react-query';
import axios from 'axios';
import SummaryApi from '../../config';
import ExperienceCard from './ExperienceCard';
import ExperienceForm from './ExperienceForm';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/animations.css';

const ExperienceTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const { theme } = useTheme();

  const { data: experiences, isLoading, refetch } = useQuery('experiences', async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(SummaryApi.experiences.get.url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.experiences;
  });

  const handleAddExperience = () => {
    setEditingExperience(null);
    setShowForm(true);
  };

  const handleEditExperience = (experience) => {
    setEditingExperience(experience);
    setShowForm(true);
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${SummaryApi.experiences.delete.url}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      refetch();
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience');
    }
  };

  const handleFormSubmit = () => {
    refetch();
    setShowForm(false);
  };

  const headerClasses = `
    flex justify-between items-center mb-8 p-6 rounded-2xl
    ${theme === 'dark' 
      ? 'bg-gradient-to-r from-[rgb(22,27,34)] to-[rgb(13,17,23)] border border-gray-700' 
      : 'bg-gradient-to-r from-white to-gray-50 border border-gray-200'
    }
    animate-fadeInUp
  `;

  const textPrimary = theme === 'dark' ? 'text-[#E5E5E5]' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const accentText = theme === 'dark' ? 'text-[#00FFFF]' : 'text-blue-600';

  return (
    <div className="experience-tab animate-fadeIn">
      {/* Header Section */}
      <div className={headerClasses}>
        <div className="flex items-center gap-4">
          <div className={`
            p-4 rounded-2xl
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-[#00FFFF]/20 to-[#9C27B0]/20 border border-[#00FFFF]/30' 
              : 'bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200'
            }
          `}>
            <FaBriefcase className={`text-2xl ${accentText}`} />
          </div>
          <div>
            <h2 className={`
              text-3xl font-bold mb-2
              bg-gradient-to-r 
              ${theme === 'dark' 
                ? 'from-[#00FFFF] to-[#9C27B0]' 
                : 'from-blue-600 to-purple-600'
              } 
              bg-clip-text text-transparent
              animate-gradientShift
            `}>
              Work Experience
            </h2>
            <p className={`${textSecondary}`}>
              Showcase your professional journey
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAddExperience}
          className={`
            group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold
            transition-all duration-300 transform hover:scale-105
            ${theme === 'dark' 
              ? 'bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black hover:shadow-2xl hover:shadow-cyan-500/25' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-blue-500/25'
            }
            animate-pulse-subtle
          `}
        >
          <FaPlus className="transition-transform duration-300 group-hover:rotate-90" />
          Add Experience
        </button>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 animate-fadeIn">
          <div className={`
            animate-spin rounded-full h-16 w-16 border-4 border-t-transparent
            ${theme === 'dark' ? 'border-[#00FFFF]' : 'border-blue-500'}
          `}></div>
          <p className={`mt-4 ${textSecondary} animate-pulse`}>
            Loading your experiences...
          </p>
        </div>
      ) : experiences?.length === 0 ? (
        <div className={`
          empty-state rounded-2xl p-12 text-center
          ${theme === 'dark' 
            ? 'bg-gradient-to-br from-[rgb(22,27,34)] to-[rgb(13,17,23)] border-2 border-dashed border-gray-600' 
            : 'bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300'
          }
          animate-fadeInUp
        `}>
          <div className={`
            inline-flex p-6 rounded-full mb-6
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-[#00FFFF]/10 to-[#9C27B0]/10' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50'
            }
          `}>
            <FaBriefcase className={`text-4xl ${theme === 'dark' ? 'text-[#00FFFF]' : 'text-blue-500'}`} />
          </div>
          
          <h3 className={`text-xl font-bold mb-3 ${textPrimary}`}>
            No Experiences Yet
          </h3>
          <p className={`${textSecondary} mb-6 max-w-md mx-auto`}>
            Start building your professional story by adding your work experience, internships, and projects.
          </p>
          
          <button
            onClick={handleAddExperience}
            className={`
              px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
              ${theme === 'dark' 
                ? 'bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black hover:shadow-lg hover:shadow-cyan-500/25' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
              }
            `}
          >
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Experience Count */}
          <div className={`
            flex items-center justify-between p-4 rounded-xl
            ${theme === 'dark' 
              ? 'bg-[rgb(22,27,34)]/50 border border-gray-700' 
              : 'bg-gray-50 border border-gray-200'
            }
            animate-fadeInUp
          `}>
            <span className={`${textSecondary} text-sm`}>
              Showing {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              {experiences.slice(0, 5).map((_, index) => (
                <div 
                  key={index}
                  className={`
                    w-2 h-2 rounded-full
                    ${theme === 'dark' ? 'bg-[#00FFFF]' : 'bg-blue-500'}
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          {/* Experience Cards */}
          <div className="grid gap-6">
            {experiences?.map((experience, index) => (
              <div 
                key={experience._id} 
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ExperienceCard
                  experience={experience}
                  onEdit={handleEditExperience}
                  onDelete={handleDeleteExperience}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ExperienceForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          initialData={editingExperience}
        />
      )}
    </div>
  );
};

export default ExperienceTab;