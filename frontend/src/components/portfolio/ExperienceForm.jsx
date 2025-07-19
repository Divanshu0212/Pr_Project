import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import PropTypes from 'prop-types';
import axios from 'axios';
import SummaryApi from '../../config';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ExperienceForm = ({ onClose, onSubmit, initialData }) => {
  const { isDark } = useTheme();
  
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

  const inputClasses = `w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 transform hover:scale-[1.02] ${
    isDark 
      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 backdrop-blur-sm'
      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm'
  }`;

  const labelClasses = `block font-semibold mb-2 transition-colors duration-300 ${
    isDark ? 'text-gray-200' : 'text-gray-700'
  }`;

  return (
    <Modal onClose={onClose} className="max-w-4xl animate-modalSlideIn">
      <div className="relative">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 rounded-lg opacity-10 ${
          isDark 
            ? 'bg-gradient-to-br from-cyan-400 via-purple-500 to-cyan-400' 
            : 'bg-gradient-to-br from-blue-400 via-purple-500 to-blue-400'
        } animate-gradient-slow`} />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-90 ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <MdClose size={24} />
        </button>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 transition-all duration-300 ${
              isDark 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              {initialData ? '✏️ Edit Experience' : '✨ Add New Experience'}
            </h2>
            <p className={`transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {initialData ? 'Update your professional experience' : 'Share your professional journey'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border-l-4 border-red-500 bg-red-500/10 backdrop-blur-sm animate-slideInDown">
              <p className="text-red-500 font-medium">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company and Position Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="group">
                <label className={labelClasses}>
                  🏢 Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="Enter company name"
                  className={inputClasses}
                />
              </div>

              <div className="group">
                <label className={labelClasses}>
                  💼 Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="Enter your role"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Date and Employment Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="group">
                <label className={labelClasses}>
                  📅 Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div className="group">
                <label className={labelClasses}>📅 End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formData.isCurrent}
                  className={`${inputClasses} ${formData.isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <div className="mt-3 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    name="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleChange}
                    className={`w-4 h-4 rounded transition-colors duration-300 ${
                      isDark 
                        ? 'text-cyan-400 bg-gray-700 border-gray-600 focus:ring-cyan-400'
                        : 'text-blue-600 bg-white border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  <label htmlFor="isCurrent" className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    📍 I currently work here
                  </label>
                </div>
              </div>

              <div className="group">
                <label className={labelClasses}>🎯 Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <label className={labelClasses}>📍 Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State/Country"
                className={inputClasses}
              />
            </div>

            {/* Description */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <label className={labelClasses}>
                📝 Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe your role, responsibilities, and achievements..."
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* Skills */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              <label className={labelClasses}>🛠️ Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, etc."
                className={inputClasses}
              />
              <p className={`text-sm mt-2 transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                💡 Separate skills with commas
              </p>
            </div>

            {/* Company Logo */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <label className={labelClasses}>🖼️ Company Logo</label>
              <div className="flex items-center gap-6 p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:border-solid bg-opacity-20 backdrop-blur-sm border-gray-400">
                {previewLogo && (
                  <div className="relative group">
                    <img 
                      src={previewLogo} 
                      alt="Company logo preview" 
                      className="w-20 h-20 rounded-full object-cover border-4 transition-all duration-300 transform group-hover:scale-110 shadow-lg border-cyan-400"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                
                <div className="flex-1 space-y-3">
                  <label className="cursor-pointer group">
                    <div className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                      isDark 
                        ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500'
                        : 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800 hover:from-gray-300 hover:to-gray-200'
                    }`}>
                      📁 {previewLogo ? 'Change Logo' : 'Upload Logo'}
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  
                  {previewLogo && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setPreviewLogo(null);
                        setFormData(prev => ({ ...prev, companyLogo: null }));
                      }}
                      className="ml-4"
                    >
                      🗑️ Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className={`text-xs mt-2 transition-colors duration-300 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                📏 Max 2MB. Recommended: 200x200px
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="px-8 py-3"
              >
                ❌ Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="px-8 py-3 relative overflow-hidden"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {initialData ? '💾 Update Experience' : '✨ Add Experience'}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

ExperienceForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default ExperienceForm;