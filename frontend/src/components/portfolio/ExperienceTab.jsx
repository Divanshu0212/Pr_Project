import React, { useState, useEffect } from 'react';
import { FaPlus, FaBriefcase } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  const queryClient = useQueryClient();

  // Get experiences query
  const { data: experiences, isLoading, error } = useQuery(
    'experiences', 
    async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.get(SummaryApi.experiences.get.url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.experiences || response.data.data || [];
    },
    {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Error fetching experiences:', error);
      }
    }
  );

  // Delete experience mutation
  const deleteMutation = useMutation(
    async (experienceId) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      // Construct the delete URL with ID
      const deleteUrl = `${SummaryApi.experiences.delete.url}/${experienceId}`;
      
      const response = await axios.delete(deleteUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('experiences');
        // Show success feedback (optional)
        console.log('Experience deleted successfully');
      },
      onError: (error) => {
        console.error('Error deleting experience:', error);
        alert('Failed to delete experience. Please try again.');
      }
    }
  );

  // Handle add new experience
  const handleAddExperience = () => {
    setEditingExperience(null);
    setShowForm(true);
  };

  // Handle edit existing experience
  const handleEditExperience = (experience) => {
    setEditingExperience(experience);
    setShowForm(true);
  };

  // Handle delete experience
  const handleDeleteExperience = async (id) => {
    if (!id) {
      console.error('No experience ID provided for deletion');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this experience? This action cannot be undone.');
    
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete operation failed:', error);
      }
    }
  };

  // Handle form submission (both add and edit)
  const handleFormSubmit = (updatedExperience) => {
    // Invalidate and refetch experiences
    queryClient.invalidateQueries('experiences');
    setShowForm(false);
    setEditingExperience(null);
    
    // Optional: Show success message
    console.log('Experience saved successfully:', updatedExperience);
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditingExperience(null);
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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="experience-tab animate-fadeIn">
        <div className="flex flex-col justify-center items-center h-64 animate-fadeIn">
          <div className={`
            animate-spin rounded-full h-16 w-16 border-4 border-t-transparent
            ${theme === 'dark' ? 'border-[#00FFFF]' : 'border-blue-500'}
          `}></div>
          <p className={`mt-4 ${textSecondary} animate-pulse`}>
            Loading your experiences...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="experience-tab animate-fadeIn">
        <div className={`
          rounded-2xl p-8 text-center
          ${theme === 'dark' 
            ? 'bg-red-900/20 border border-red-700' 
            : 'bg-red-50 border border-red-200'
          }
        `}>
          <p className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            Failed to load experiences
          </p>
          <p className={`${textSecondary} mb-4`}>
            {error.message || 'Something went wrong while fetching your experiences.'}
          </p>
          <button
            onClick={() => queryClient.invalidateQueries('experiences')}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
              }
            `}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          disabled={deleteMutation.isLoading}
          className={`
            group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold
            transition-all duration-300 transform hover:scale-105
            ${theme === 'dark' 
              ? 'bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black hover:shadow-2xl hover:shadow-cyan-500/25' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-blue-500/25'
            }
            ${deleteMutation.isLoading ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-subtle'}
            disabled:transform-none disabled:scale-100
          `}
        >
          <FaPlus className="transition-transform duration-300 group-hover:rotate-90" />
          Add Experience
        </button>
      </div>

      {/* Content Section */}
      {!experiences || experiences.length === 0 ? (
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
                    animate-pulse
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          {/* Experience Cards */}
          <div className="grid gap-6">
            {experiences.map((experience, index) => (
              <div 
                key={experience._id || experience.id} 
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ExperienceCard
                  experience={experience}
                  onEdit={handleEditExperience}
                  onDelete={handleDeleteExperience}
                  isDeleting={deleteMutation.isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ExperienceForm
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={editingExperience}
        />
      )}

      {/* Loading overlay when deleting */}
      {deleteMutation.isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`
            p-6 rounded-lg flex items-center gap-3
            ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          `}>
            <div className={`
              animate-spin rounded-full h-6 w-6 border-2 border-t-transparent
              ${theme === 'dark' ? 'border-[#00FFFF]' : 'border-blue-500'}
            `}></div>
            <span>Deleting experience...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceTab;