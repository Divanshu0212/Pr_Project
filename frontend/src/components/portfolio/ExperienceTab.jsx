import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useQuery } from 'react-query';
import axios from 'axios';
import SummaryApi from '../../config';
import ExperienceCard from './ExperienceCard';
import ExperienceForm from './ExperienceForm';

const ExperienceTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00FFFF]">Work Experience</h2>
        <button
          onClick={handleAddExperience}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black rounded-lg hover:opacity-90 transition-opacity"
        >
          <FaPlus /> Add Experience
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
        </div>
      ) : experiences?.length === 0 ? (
        <div className="bg-[#161B22] rounded-lg p-8 text-center border border-dashed border-gray-600">
          <p className="text-gray-400 mb-4">No experiences added yet</p>
          <button
            onClick={handleAddExperience}
            className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90"
          >
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences?.map(experience => (
            <ExperienceCard
              key={experience._id}
              experience={experience}
              onEdit={handleEditExperience}
              onDelete={handleDeleteExperience}
            />
          ))}
        </div>
      )}

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