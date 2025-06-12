import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import PropTypes from 'prop-types';
import axios from 'axios';
import SummaryApi from '../../config';

const ExperienceForm = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    skills: '',
    location: '',
    employmentType: 'Full-time',
    companyLogo: null
  });

  const [previewLogo, setPreviewLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company,
        position: initialData.position,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        isCurrent: initialData.isCurrent,
        description: initialData.description,
        skills: initialData.skills?.join(', ') || '',
        location: initialData.location || '',
        employmentType: initialData.employmentType || 'Full-time',
        companyLogo: null
      });
      setPreviewLogo(initialData.companyLogo?.url || null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('File size should be less than 2MB');
      return;
    }

    setFormData(prev => ({ ...prev, companyLogo: file }));
    setPreviewLogo(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'companyLogo' && formData[key]) {
          formDataToSend.append('companyLogo', formData[key]);
        } else if (key !== 'companyLogo') {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (initialData) {
        // Update existing experience
        response = await axios.put(
          `${SummaryApi.experiences.update.url}/${initialData._id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Add new experience
        response = await axios.post(
          SummaryApi.experiences.add.url,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      onSubmit(response.data.experience);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save experience');
      console.error('Error saving experience:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-[#161B22] rounded-lg p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <MdClose size={24} />
        </button>

        <h2 className="text-2xl font-bold text-[#00FFFF] mb-6">
          {initialData ? 'Edit Experience' : 'Add New Experience'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Company*</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Position*</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Start Date*</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.isCurrent}
                className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none disabled:opacity-50"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="isCurrent"
                  name="isCurrent"
                  checked={formData.isCurrent}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isCurrent" className="text-gray-400">I currently work here</label>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
              className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00FFFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Company Logo</label>
            <div className="flex items-center gap-4">
              {previewLogo && (
                <img 
                  src={previewLogo} 
                  alt="Company logo preview" 
                  className="w-16 h-16 rounded-full object-cover border border-gray-600"
                />
              )}
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-[#2D333B] text-[#E5E5E5] rounded-lg hover:bg-[#444C56] transition-colors">
                  {previewLogo ? 'Change Logo' : 'Upload Logo'}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              {previewLogo && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewLogo(null);
                    setFormData(prev => ({ ...prev, companyLogo: null }));
                  }}
                  className="px-4 py-2 text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">Max 2MB. Recommended: 200x200px</p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#2D333B] text-[#E5E5E5] rounded-lg hover:bg-[#444C56] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading ? 'Saving...' : (initialData ? 'Update Experience' : 'Add Experience')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ExperienceForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default ExperienceForm;