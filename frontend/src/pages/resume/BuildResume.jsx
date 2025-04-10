import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Form from '../../components/common/Form';
import Modal from '../../components/common/Modal';
import usePortfolio from '../../hooks/usePortfolio';
import { useAuth } from '../../hooks/useAuth';
import { resumeService } from '../../services/resumeService';
import './../../styles/pages/BuildResume.css';

const BuildResume = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { portfolioItems, loading: portfolioLoading, fetchPortfolioItems } = usePortfolio();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [template, setTemplate] = useState(location?.state?.template || null);
  const [resumeData, setResumeData] = useState({
    basicInfo: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      location: '',
      title: '',
      summary: '',
      linkedin: '',
      github: '',
      website: '',
    },
    selectedItems: {
      projects: [],
      skills: [],
      education: [],
      experience: [],
      certifications: [],
    },
    customSections: [],
    layoutOptions: {
      colorScheme: 'default', // default, professional, creative, minimal
      fontFamily: 'Inter', // Inter, Roboto, Poppins, Open Sans
      fontSize: 'medium', // small, medium, large
      spacing: 'comfortable', // compact, comfortable, spacious
      showPhoto: false,
    }
  });
  
  const [generatedResume, setGeneratedResume] = useState(null);
  const [error, setError] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [resumeName, setResumeName] = useState('');

  useEffect(() => {
    // If template was selected from gallery and passed via location state
    if (location?.state?.template) {
      setTemplate(location.state.template);
    }
    
    // Fetch user's portfolio items
    fetchPortfolioItems();
  }, [location.state, fetchPortfolioItems]);

  const handleInputChange = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLayoutOptionChange = (option, value) => {
    setResumeData(prev => ({
      ...prev,
      layoutOptions: {
        ...prev.layoutOptions,
        [option]: value
      }
    }));
  };

  const handlePortfolioItemToggle = (type, itemId) => {
    setResumeData(prev => {
      const selectedItems = [...prev.selectedItems[type]];
      const index = selectedItems.indexOf(itemId);
      
      if (index > -1) {
        selectedItems.splice(index, 1);
      } else {
        selectedItems.push(itemId);
      }
      
      return {
        ...prev,
        selectedItems: {
          ...prev.selectedItems,
          [type]: selectedItems
        }
      };
    });
  };

  const addCustomSection = () => {
    setResumeData(prev => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        { title: '', content: '' }
      ]
    }));
  };

  const updateCustomSection = (index, field, value) => {
    setResumeData(prev => {
      const updatedSections = [...prev.customSections];
      updatedSections[index] = {
        ...updatedSections[index],
        [field]: value
      };
      
      return {
        ...prev,
        customSections: updatedSections
      };
    });
  };

  const removeCustomSection = (index) => {
    setResumeData(prev => {
      const updatedSections = [...prev.customSections];
      updatedSections.splice(index, 1);
      
      return {
        ...prev,
        customSections: updatedSections
      };
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerateResume();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectTemplate = (selectedTemplate) => {
    setTemplate(selectedTemplate);
    navigate('/resume/create', { state: { template: selectedTemplate } });
  };

  const handleGenerateResume = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      // Filter out only the selected portfolio items
      const selectedPortfolioItems = {};
      
      Object.keys(resumeData.selectedItems).forEach(type => {
        selectedPortfolioItems[type] = portfolioItems
          .filter(item => item.type === type && resumeData.selectedItems[type].includes(item.id))
          .map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            date: item.date,
            url: item.url,
            details: item.details
          }));
      });
      
      const completeResumeData = {
        ...resumeData,
        template: template,
        selectedPortfolioItems,
        userId: user.uid
      };
      
      // Call the resume service to generate the resume
      const response = await resumeService.generateResume(completeResumeData);
      setGeneratedResume(response);
      setShowPreview(true);
      
    } catch (err) {
      console.error('Error generating resume:', err);
      setError('Failed to generate resume. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveResume = async () => {
    if (!resumeName.trim()) {
      setError('Please enter a name for your resume');
      return;
    }
    
    try {
      await resumeService.saveResume({
        name: resumeName,
        templateId: template.id,
        data: resumeData,
        previewUrl: generatedResume?.previewUrl,
        userId: user.uid
      });
      
      setSaveModalOpen(false);
      navigate('/resume-builder-home', { 
        state: { success: true, message: 'Resume saved successfully!' }
      });
      
    } catch (err) {
      console.error('Error saving resume:', err);
      setError('Failed to save resume. Please try again.');
    }
  };

  const handleDownloadResume = async (format) => {
    try {
      await resumeService.downloadResume(generatedResume.id, format);
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError(`Failed to download resume as ${format.toUpperCase()}. Please try again.`);
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return (
          <div className="resume-step">
            <h2 className="step-title">Basic Information</h2>
            <div className="form-section">
              <Form>

                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={resumeData.basicInfo.name}
                      onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">Professional Title</label>
                    <input
                      type="text"
                      id="title"
                      className="form-control"
                      value={resumeData.basicInfo.title}
                      onChange={(e) => handleInputChange('basicInfo', 'title', e.target.value)}
                      placeholder="e.g. Full Stack Developer"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={resumeData.basicInfo.email}
                      onChange={(e) => handleInputChange('basicInfo', 'email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      className="form-control"
                      value={resumeData.basicInfo.phone}
                      onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      className="form-control"
                      value={resumeData.basicInfo.location}
                      onChange={(e) => handleInputChange('basicInfo', 'location', e.target.value)}
                      placeholder="City, State, Country"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="summary">Professional Summary</label>
                    <textarea
                      id="summary"
                      className="form-control"
                      value={resumeData.basicInfo.summary}
                      onChange={(e) => handleInputChange('basicInfo', 'summary', e.target.value)}
                      placeholder="Write a brief professional summary..."
                      rows="4"
                    />
                  </div>
              </Form>
            </div>
          </div>
        );
        
      case 2: // Portfolio Items Selection
        return (
          <div className="resume-step">
            <h2 className="step-title">Select Portfolio Items</h2>
            {portfolioLoading ? (
              <div className="loading-indicator">Loading your portfolio items...</div>
            ) : (
              <>
                {['projects', 'skills', 'education', 'experience', 'certifications'].map((itemType) => (
                  <div key={itemType} className="portfolio-section">
                    <h3 className="section-title capitalize">{itemType}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {portfolioItems
                        .filter(item => item.type === itemType)
                        .map(item => (
                          <div 
                            key={item.id} 
                            className={`portfolio-item-card cursor-pointer ${
                              resumeData.selectedItems[itemType].includes(item.id) ? 'selected' : ''
                            }`}
                            onClick={() => handlePortfolioItemToggle(itemType, item.id)}
                          >
                            <div className="card-inner p-4">
                              <div className="flex justify-between items-start">
                                <h4 className="item-title">{item.title}</h4>
                                <div className="selection-indicator">
                                  {resumeData.selectedItems[itemType].includes(item.id) ? (
                                    <span className="text-[#00FFFF]">✓</span>
                                  ) : null}
                                </div>
                              </div>
                              <p className="item-description">{item.description}</p>
                              <div className="item-date text-sm text-gray-400">{item.date}</div>
                            </div>
                          </div>
                        ))}
                      {portfolioItems.filter(item => item.type === itemType).length === 0 && (
                        <div className="empty-state col-span-full p-4 bg-[#161B22] rounded-lg">
                          <p>No {itemType} found in your portfolio. <a href="/portfolio/add" className="text-[#00FFFF]">Add some {itemType} items</a> first?</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            
            <div className="custom-sections mt-8">
              <h3 className="section-title">Custom Sections</h3>
              <p className="text-sm text-gray-400 mb-4">Add any additional sections you want to include in your resume.</p>
              
              {resumeData.customSections.map((section, index) => (
                <div key={index} className="custom-section mb-4 p-4 bg-[#161B22] rounded-lg">
                  <div className="flex justify-between mb-2">
                    <input
                      type="text"
                      className="form-control w-1/3"
                      value={section.title}
                      onChange={(e) => updateCustomSection(index, 'title', e.target.value)}
                      placeholder="Section Title"
                    />
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeCustomSection(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    className="form-control w-full h-32"
                    value={section.content}
                    onChange={(e) => updateCustomSection(index, 'content', e.target.value)}
                    placeholder="Section content..."
                  />
                </div>
              ))}
              
              <button 
                className="btn bg-[#161B22] hover:bg-[#1f262e] text-[#E5E5E5] px-4 py-2 rounded-lg"
                onClick={addCustomSection}
              >
                + Add Custom Section
              </button>
            </div>
          </div>
        );
        
      case 3: // Layout Customization
        return (
          <div className="resume-step">
            <h2 className="step-title">Customize Layout</h2>
            
            <div className="layout-options grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="layout-option">
                <h3 className="option-title">Color Scheme</h3>
                <div className="option-choices">
                  {['default', 'professional', 'creative', 'minimal'].map(scheme => (
                    <div 
                      key={scheme}
                      className={`option-choice ${resumeData.layoutOptions.colorScheme === scheme ? 'selected' : ''}`}
                      onClick={() => handleLayoutOptionChange('colorScheme', scheme)}
                    >
                      <div className={`color-preview ${scheme}-preview`}></div>
                      <span className="capitalize">{scheme}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="layout-option">
                <h3 className="option-title">Font Family</h3>
                <div className="option-choices">
                  {['Inter', 'Roboto', 'Poppins', 'Open Sans'].map(font => (
                    <div 
                      key={font}
                      className={`option-choice ${resumeData.layoutOptions.fontFamily === font ? 'selected' : ''}`}
                      onClick={() => handleLayoutOptionChange('fontFamily', font)}
                    >
                      <span style={{ fontFamily: font }}>{font}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="layout-option">
                <h3 className="option-title">Font Size</h3>
                <div className="option-choices">
                  {['small', 'medium', 'large'].map(size => (
                    <div 
                      key={size}
                      className={`option-choice ${resumeData.layoutOptions.fontSize === size ? 'selected' : ''}`}
                      onClick={() => handleLayoutOptionChange('fontSize', size)}
                    >
                      <span className={`font-${size}`}>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="layout-option">
                <h3 className="option-title">Spacing</h3>
                <div className="option-choices">
                  {['compact', 'comfortable', 'spacious'].map(spacing => (
                    <div 
                      key={spacing}
                      className={`option-choice ${resumeData.layoutOptions.spacing === spacing ? 'selected' : ''}`}
                      onClick={() => handleLayoutOptionChange('spacing', spacing)}
                    >
                      <div className={`spacing-preview ${spacing}-preview`}></div>
                      <span className="capitalize">{spacing}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="layout-option col-span-1 md:col-span-2">
                <h3 className="option-title">Photo</h3>
                <div className="flex items-center space-x-2">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={resumeData.layoutOptions.showPhoto}
                      onChange={(e) => handleLayoutOptionChange('showPhoto', e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span>{resumeData.layoutOptions.showPhoto ? 'Show photo' : 'No photo'}</span>
                </div>
                {resumeData.layoutOptions.showPhoto && (
                  <div className="photo-upload mt-4">
                    <input type="file" accept="image/*" className="photo-input" />
                    <p className="text-sm text-gray-400">Recommended: square image, 300x300px or larger</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="template-preview mt-8">
              <h3 className="section-title">Template Preview</h3>
              {template ? (
                <div className="template-card">
                  <img src={template.thumbnail} alt={template.name} className="w-full h-auto" />
                  <div className="template-info p-4">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                  <button 
                    className="change-template-btn mt-4 text-[#00FFFF]"
                    onClick={() => navigate('/resume/templates')}
                  >
                    Change Template
                  </button>
                </div>
              ) : (
                <div className="no-template-selected">
                  <p>No template selected. <button className="text-[#00FFFF]" onClick={() => navigate('/resume/templates')}>Select a template</button> first.</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 4: // Review & Generate
        return (
          <div className="resume-step">
            <h2 className="step-title">Review & Generate</h2>
            
            <div className="resume-review">
              <Card>
                <h3 className="section-title">Basic Information</h3>
                <div className="review-section">
                  <div className="review-item">
                    <span className="review-label">Name:</span>
                    <span className="review-value">{resumeData.basicInfo.name}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Title:</span>
                    <span className="review-value">{resumeData.basicInfo.title}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Contact:</span>
                    <span className="review-value">{resumeData.basicInfo.email} | {resumeData.basicInfo.phone}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Location:</span>
                    <span className="review-value">{resumeData.basicInfo.location}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="mt-4">
                <h3 className="section-title">Selected Portfolio Items</h3>
                <div className="review-section">
                  {['projects', 'skills', 'education', 'experience', 'certifications'].map((itemType) => {
                    const selectedCount = resumeData.selectedItems[itemType].length;
                    return (
                      <div key={itemType} className="review-item">
                        <span className="review-label capitalize">{itemType}:</span>
                        <span className="review-value">
                          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                    );
                  })}
                  <div className="review-item">
                    <span className="review-label">Custom Sections:</span>
                    <span className="review-value">
                      {resumeData.customSections.length} section{resumeData.customSections.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Card>
              
              <Card className="mt-4">
                <h3 className="section-title">Layout & Design</h3>
                <div className="review-section">
                  <div className="review-item">
                    <span className="review-label">Template:</span>
                    <span className="review-value">{template?.name || 'None selected'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Color Scheme:</span>
                    <span className="review-value capitalize">{resumeData.layoutOptions.colorScheme}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Font:</span>
                    <span className="review-value">{resumeData.layoutOptions.fontFamily}, {resumeData.layoutOptions.fontSize}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Spacing:</span>
                    <span className="review-value capitalize">{resumeData.layoutOptions.spacing}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Photo:</span>
                    <span className="review-value">{resumeData.layoutOptions.showPhoto ? 'Included' : 'Not included'}</span>
                  </div>
                </div>
              </Card>
            </div>
            
            {error && (
              <div className="error-message mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
                {error}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render the resume preview modal
  const renderPreviewModal = () => {
    if (!showPreview || !generatedResume) return null;
    
    return (
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} className="resume-preview-modal">
        <div className="resume-preview">
          <h2 className="preview-title">Resume Preview</h2>
          
          <div className="preview-iframe-container">
            {generatedResume.previewUrl && (
              <iframe 
                src={generatedResume.previewUrl} 
                title="Resume Preview" 
                className="preview-iframe"
              />
            )}
          </div>
          
          <div className="preview-actions mt-4 flex flex-wrap justify-between">
            <div className="download-options">
              <h3>Download as:</h3>
              <div className="flex space-x-2 mt-2">
                <Button 
                  className="download-btn pdf"
                  onClick={() => handleDownloadResume('pdf')}
                >
                  PDF
                </Button>
                <Button 
                  className="download-btn docx"
                  onClick={() => handleDownloadResume('docx')}
                >
                  DOCX
                </Button>
                <Button 
                  className="download-btn txt"
                  onClick={() => handleDownloadResume('txt')}
                >
                  TXT
                </Button>
              </div>
            </div>
            
            <div className="save-options">
              <Button 
                className="save-btn"
                onClick={() => setSaveModalOpen(true)}
              >
                Save Resume
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Render the save resume modal
  const renderSaveModal = () => {
    return (
      <Modal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)}>
        <div className="save-resume-modal">
          <h2>Save Your Resume</h2>
          
          <div className="form-group mt-4">
            <label htmlFor="resumeName">Resume Name</label>
            <input
              type="text"
              id="resumeName"
              className="form-control"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g. Software Developer Resume 2025"
            />
          </div>
          
          {error && (
            <div className="error-message mt-2 text-red-400">
              {error}
            </div>
          )}
          
          <div className="modal-actions mt-4 flex justify-end space-x-2">
            <Button 
              className="cancel-btn"
              onClick={() => setSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="confirm-btn"
              onClick={handleSaveResume}
            >
              Save Resume
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="build-resume-container">
      <div className="build-resume-header mb-6">
        <h1 className="page-title">Create Your Resume</h1>
        <div className="steps-progress">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step)}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Content'}
                {step === 3 && 'Layout'}
                {step === 4 && 'Generate'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="build-resume-content">
        {renderStep()}
      </div>
      
      <div className="build-resume-actions mt-6 flex justify-between">
        <Button 
          className="prev-btn"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous Step
        </Button>
        
        <Button 
          className={`next-btn ${currentStep === 4 ? 'generate-btn' : ''}`}
          onClick={nextStep}
          disabled={generating}
        >
          {currentStep < 4 ? 'Next Step' : (generating ? 'Generating...' : 'Generate Resume')}
        </Button>
      </div>
      
      {renderPreviewModal()}
      {renderSaveModal()}
    </div>
  );
};

export default BuildResume;