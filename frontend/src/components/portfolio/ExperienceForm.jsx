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

  return (
    <Modal onClose={onClose} className="experience-form-modal">
      <div className="experience-form-container">
        {/* Animated background gradient */}
        <div className="form-background-gradient" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="form-close-button"
        >
          <MdClose size={24} />
        </button>

        <div className="form-content">
          {/* Header */}
          <div className="form-header">
            <h2 className="form-title">
              {initialData ? '✏️ Edit Experience' : '✨ Add New Experience'}
            </h2>
            <p className="form-subtitle">
              {initialData ? 'Update your professional experience' : 'Share your professional journey'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="form-error-banner">
              <p>⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="experience-form">
            {/* Company and Position Row */}
            <div className="form-row form-row-two">
              <div className="form-field">
                <label className="form-label">
                  🏢 Company <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="Enter company name"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  💼 Position <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="Enter your role"
                  className="form-input"
                />
              </div>
            </div>

            {/* Date and Employment Type Row */}
            <div className="form-row form-row-three">
              <div className="form-field">
                <label className="form-label">
                  📅 Start Date <span className="required-asterisk">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">📅 End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formData.isCurrent}
                  className={`form-input ${formData.isCurrent ? 'disabled' : ''}`}
                />
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    name="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="isCurrent" className="checkbox-label">
                    📍 I currently work here
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">🎯 Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="form-select"
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
            <div className="form-field">
              <label className="form-label">📍 Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State/Country"
                className="form-input"
              />
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label">
                📝 Description <span className="required-asterisk">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe your role, responsibilities, and achievements..."
                className="form-textarea"
              />
            </div>

            {/* Skills */}
            <div className="form-field">
              <label className="form-label">🛠️ Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, etc."
                className="form-input"
              />
              <p className="field-hint">
                💡 Separate skills with commas
              </p>
            </div>

            {/* Company Logo */}
            <div className="form-field">
              <label className="form-label">🖼️ Company Logo</label>
              <div className="logo-upload-container">
                {previewLogo && (
                  <div className="logo-preview">
                    <img 
                      src={previewLogo} 
                      alt="Company logo preview" 
                      className="logo-preview-image"
                    />
                  </div>
                )}
                
                <div className="logo-upload-controls">
                  <label className="logo-upload-button">
                    <div className="upload-button-content">
                      📁 {previewLogo ? 'Change Logo' : 'Upload Logo'}
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="file-input-hidden"
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
                      className="logo-remove-button"
                    >
                      🗑️ Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="field-hint">
                📏 Max 2MB. Recommended: 200x200px
              </p>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="form-button-cancel"
              >
                ❌ Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="form-button-submit"
              >
                {isLoading ? (
                  <span className="loading-content">
                    <div className="loading-spinner" />
                    Saving...
                  </span>
                ) : (
                  <span className="submit-content">
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