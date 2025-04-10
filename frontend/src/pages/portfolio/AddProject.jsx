// src/pages/portfolio/AddProject.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePortfolio from '../../hooks/usePortfolio';
import Button from '../../components/common/Button';
import Form from '../../components/common/Form';
import '../../styles/pages/AddProject.css';

const PORTFOLIO_CATEGORIES = [
  { id: 'projects', label: 'Project' },
  { id: 'skills', label: 'Skill' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'certifications', label: 'Certification' }
];

const AddProject = () => {
  const navigate = useNavigate();
  const { addPortfolioItem, loading, error } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState('projects');
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    ongoing: false,
    image: null,
    link: '',
    technologies: [],
    organization: '',
    location: '',
    degree: '',
    grade: '',
    proficiency: 'beginner', // For skills
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTechnologiesChange = (e) => {
    const techs = e.target.value.split(',').map(tech => tech.trim());
    setFormData({
      ...formData,
      technologies: techs
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title) errors.title = 'Title is required';
    
    if (selectedCategory === 'projects' && !formData.description) {
      errors.description = 'Description is required for projects';
    }
    
    if (selectedCategory === 'education' && !formData.organization) {
      errors.organization = 'Institution name is required';
    }
    
    if (selectedCategory === 'experience' && !formData.organization) {
      errors.organization = 'Company name is required';
    }
    
    if (selectedCategory === 'certifications' && !formData.organization) {
      errors.organization = 'Issuing organization is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const formDataWithCategory = {
      ...formData,
      category: selectedCategory
    };
    
    try {
      await addPortfolioItem(formDataWithCategory);
      navigate('/portfolioHome');
    } catch (err) {
      console.error('Error adding portfolio item:', err);
    }
  };

  return (
    <div className="add-project-container">
      <h1 className="text-3xl font-bold text-[#E5E5E5] mb-6">Add Portfolio Item</h1>
      
      <div className="category-selector mb-8">
        <h2 className="text-lg text-[#E5E5E5] mb-3">Select Item Type</h2>
        <div className="category-buttons">
          {PORTFOLIO_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      
      <Form onSubmit={handleSubmit} className="add-project-form">
        {/* Common fields across all categories */}
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={formErrors.title ? 'error' : ''}
            placeholder={getPlaceholderByCategory(selectedCategory, 'title')}
          />
          {formErrors.title && <span className="error-message">{formErrors.title}</span>}
        </div>
        
        {/* Description field for most categories */}
        {selectedCategory !== 'skills' && (
          <div className="form-group">
            <label htmlFor="description">Description{selectedCategory === 'projects' ? '*' : ''}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={formErrors.description ? 'error' : ''}
              placeholder={getPlaceholderByCategory(selectedCategory, 'description')}
              rows={4}
            />
            {formErrors.description && <span className="error-message">{formErrors.description}</span>}
          </div>
        )}
        
        {/* Date fields for relevant categories */}
        {['projects', 'education', 'experience', 'certifications'].includes(selectedCategory) && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.ongoing}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="ongoing"
                name="ongoing"
                checked={formData.ongoing}
                onChange={handleChange}
              />
              <label htmlFor="ongoing">Currently {getOngoingLabel(selectedCategory)}</label>
            </div>
          </div>
        )}
        
        {/* Organization field for relevant categories */}
        {['education', 'experience', 'certifications'].includes(selectedCategory) && (
          <div className="form-group">
            <label htmlFor="organization">{getOrganizationLabel(selectedCategory)}*</label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className={formErrors.organization ? 'error' : ''}
            />
            {formErrors.organization && <span className="error-message">{formErrors.organization}</span>}
          </div>
        )}
        
        {/* Location field for education and experience */}
        {['education', 'experience'].includes(selectedCategory) && (
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        )}
        
        {/* Education specific fields */}
        {selectedCategory === 'education' && (
          <>
            <div className="form-group">
              <label htmlFor="degree">Degree/Course</label>
              <input
                type="text"
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="grade">Grade/Score</label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g., 3.8/4.0, First Class, 87%"
              />
            </div>
          </>
        )}
        
        {/* Skill specific fields */}
        {selectedCategory === 'skills' && (
          <div className="form-group">
            <label htmlFor="proficiency">Proficiency Level</label>
            <select
              id="proficiency"
              name="proficiency"
              value={formData.proficiency}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        )}
        
        {/* Project specific fields */}
        {selectedCategory === 'projects' && (
          <div className="form-group">
            <label htmlFor="technologies">Technologies Used</label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              value={formData.technologies.join(', ')}
              onChange={handleTechnologiesChange}
              placeholder="e.g., React, Node.js, MongoDB (comma separated)"
            />
          </div>
        )}
        
        {/* Link field for projects and certifications */}
        {['projects', 'certifications'].includes(selectedCategory) && (
          <div className="form-group">
            <label htmlFor="link">{selectedCategory === 'projects' ? 'Project URL' : 'Certificate URL'}</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder={selectedCategory === 'projects' ? 'https://github.com/yourusername/project' : 'https://credential.net/certificate'}
            />
          </div>
        )}
        
        {/* Image upload for all categories */}
        <div className="form-group">
          <label htmlFor="image">
            {selectedCategory === 'certifications' ? 'Certificate Image' : 
             selectedCategory === 'projects' ? 'Project Screenshot' : 'Image'}
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
        </div>
        
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={() => navigate('/portfolioHome')}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Item'}
          </Button>
        </div>
        
        {error && (
          <div className="error-banner">
            <p>Error: {error}</p>
          </div>
        )}
      </Form>
    </div>
  );
};

// Helper functions
function getPlaceholderByCategory(category, field) {
  if (field === 'title') {
    switch (category) {
      case 'projects': return 'e.g., E-Commerce Website';
      case 'skills': return 'e.g., JavaScript';
      case 'education': return 'e.g., Bachelor of Science in Computer Science';
      case 'experience': return 'e.g., Front-end Developer';
      case 'certifications': return 'e.g., AWS Certified Developer';
      default: return 'Enter title';
    }
  }
  
  if (field === 'description') {
    switch (category) {
      case 'projects': return 'Describe your project, its purpose, and your role...';
      case 'education': return 'Details about your coursework, achievements, etc...';
      case 'experience': return 'Describe your responsibilities and accomplishments...';
      case 'certifications': return 'Information about the certification and skills gained...';
      default: return 'Enter description';
    }
  }
  
  return '';
}

function getOngoingLabel(category) {
  switch (category) {
    case 'education': return 'studying';
    case 'experience': return 'working here';
    case 'projects': return 'in progress';
    default: return 'active';
  }
}

function getOrganizationLabel(category) {
  switch (category) {
    case 'education': return 'Institution';
    case 'experience': return 'Company';
    case 'certifications': return 'Issuing Organization';
    default: return 'Organization';
  }
}

export default AddProject;