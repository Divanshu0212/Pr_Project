import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Form from '../../components/common/Form';
import Modal from '../../components/common/Modal';
import usePortfolio from '../../hooks/usePortfolio';
import { resumeService } from '../../services/resumeService';
import './../../styles/pages/BuildResume.css';
import { AuthContext } from '../../context/AuthContext';

const BuildResume = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    fetchUserDetails,
    setCurrentUser
  } = useContext(AuthContext);

  const user = currentUser;

  const {
    portfolioData,
    loading: portfolioLoading,
    fetchAllPortfolioData
  } = usePortfolio();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [template, setTemplate] = useState(location?.state?.template || null);
  const [formErrors, setFormErrors] = useState({});
  const [resumeData, setResumeData] = useState({
    basicInfo: {
      name: '',
      email: '',
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
      colorScheme: location?.state?.template?.defaultColorScheme || 'default',
      fontFamily: location?.state?.template?.defaultFont || 'Inter',
      fontSize: location?.state?.template?.defaultFontSize || 'medium',
      spacing: location?.state?.template?.defaultSpacing || 'comfortable',
      showPhoto: location?.state?.template?.defaultShowPhoto || false,
    }
  });
  const [generatedResume, setGeneratedResume] = useState(null);
  const [error, setError] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [initialized, setInitialized] = useState(false);

  const availableTemplates = [
    {
      id: '1',
      name: 'Professional',
      description: 'Clean and modern design for all industries',
      thumbnail: '/images/templates/professional.jpg',
      defaultColorScheme: 'blue',
      defaultFont: 'Inter',
      defaultFontSize: 'medium',
      defaultSpacing: 'comfortable',
      defaultShowPhoto: true
    },
    {
      id: '2',
      name: 'Creative',
      description: 'Bold design for creative professionals',
      thumbnail: '/images/templates/creative.jpg',
      defaultColorScheme: 'purple',
      defaultFont: 'Poppins',
      defaultFontSize: 'medium',
      defaultSpacing: 'spacious',
      defaultShowPhoto: true
    },
  ];

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch all portfolio data first
        await fetchAllPortfolioData();

        // Initialize resumeData after portfolio data is loaded
        setResumeData({
          basicInfo: {
            name: user?.displayName || portfolioData?.portfolioDetails?.user?.name || '',
            email: user?.email || '',
            phone: '',
            location: portfolioData?.portfolioDetails?.location || '',
            title: portfolioData?.portfolioDetails?.jobTitle || '',
            summary: portfolioData?.portfolioDetails?.bio || '',
            linkedin: portfolioData?.portfolioDetails?.socialLinks?.linkedin || '',
            github: portfolioData?.portfolioDetails?.socialLinks?.github || '',
            website: '',
          },
          selectedItems: {
            projects: portfolioData?.projects?.map(project => project._id) || [],
            skills: portfolioData?.skills?.map(skill => skill._id) || [],
            education: [],
            experience: portfolioData?.experiences?.map(exp => exp._id) || [],
            certifications: portfolioData?.certificates?.map(cert => cert._id) || [],
          },
          customSections: [],
          layoutOptions: {
            colorScheme: location?.state?.template?.defaultColorScheme || 'default',
            fontFamily: location?.state?.template?.defaultFont || 'Inter',
            fontSize: location?.state?.template?.defaultFontSize || 'medium',
            spacing: location?.state?.template?.defaultSpacing || 'comfortable',
            showPhoto: location?.state?.template?.defaultShowPhoto || false,
          }
        });

        if (location?.state?.template) {
          setTemplate(location.state.template);
          setResumeData(prev => ({
            ...prev,
            layoutOptions: {
              colorScheme: location.state.template.defaultColorScheme || 'default',
              fontFamily: location.state.template.defaultFont || 'Inter',
              fontSize: location.state.template.defaultFontSize || 'medium',
              spacing: location.state.template.defaultSpacing || 'comfortable',
              showPhoto: location.state.template.defaultShowPhoto || false,
            }
          }));
        }

        setInitialized(true);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load portfolio data. Please try again.');
      }
    };

    initializeData();
  }, [location.state, user]);

  // Validate current step before proceeding
  const validateStep = () => {
    const errors = {};

    if (currentStep === 1) {
      if (!resumeData.basicInfo.name.trim()) errors.name = 'Name is required';
      if (!resumeData.basicInfo.title.trim()) errors.title = 'Professional title is required';
      if (!resumeData.basicInfo.email.trim()) errors.email = 'Email is required';
      if (!resumeData.basicInfo.phone.trim()) errors.phone = 'Phone number is required';
      if (!resumeData.basicInfo.location.trim()) errors.location = 'Location is required';
      if (!resumeData.basicInfo.summary.trim()) errors.summary = 'Professional summary is required';
    } else if (currentStep === 2) {
      const hasSelectedItems = Object.values(resumeData.selectedItems).some(
        items => items.length > 0
      );
      if (!hasSelectedItems && resumeData.customSections.length === 0) {
        errors.content = 'Please select at least one portfolio item or add a custom section';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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

    if (formErrors.content) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      });
    }
  };

  const addCustomSection = () => {
    setResumeData(prev => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        { title: '', content: '' }
      ]
    }));

    if (formErrors.content) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      });
    }
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
    if (!validateStep()) {
      return;
    }

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

  const handleStepNavigation = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (validateStep()) {
      setCurrentStep(step);
    } else {
      // Show warning for trying to skip ahead without completing
      setError('Please complete all required fields before proceeding');
    }
  };

  const handleSelectTemplate = (selectedTemplate) => {
    setTemplate(selectedTemplate);
    setResumeData(prev => ({
      ...prev,
      layoutOptions: {
        colorScheme: selectedTemplate.defaultColorScheme || 'default',
        fontFamily: selectedTemplate.defaultFont || 'Inter',
        fontSize: selectedTemplate.defaultFontSize || 'medium',
        spacing: selectedTemplate.defaultSpacing || 'comfortable',
        showPhoto: selectedTemplate.defaultShowPhoto || false,
      }
    }));

    // Clear any template errors
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.template;
      return newErrors;
    });

    // Automatically proceed to step 4 (Review & Generate)
    setCurrentStep(4);
  };

  const handleGenerateResume = async () => {
    setGenerating(true);
    setError(null);

    try {
      const selectedPortfolioItems = {};

      // Map through all portfolio item types
      ['projects', 'skills', 'education', 'experience', 'certifications'].forEach(type => {
        selectedPortfolioItems[type] = (portfolioData[type] || [])
          .filter(item => resumeData.selectedItems[type]?.includes(item._id))
          .map(item => ({
            id: item._id,
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

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return (
          <div className="resume-step">
            <h2 className="step-title">Basic Information</h2>
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  className={`form-control ${formErrors.name ? 'border-red-500' : ''}`}
                  value={resumeData.basicInfo.name}
                  onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
                {formErrors.name && <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="title">Professional Title *</label>
                <input
                  type="text"
                  id="title"
                  className={`form-control ${formErrors.title ? 'error' : ''}`}
                  value={resumeData.basicInfo.title}
                  onChange={(e) => handleInputChange('basicInfo', 'title', e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  required
                />
                {formErrors.title && <div className="error-message">{formErrors.title}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${formErrors.email ? 'error' : ''}`}
                  value={resumeData.basicInfo.email}
                  onChange={(e) => handleInputChange('basicInfo', 'email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  className={`form-control ${formErrors.phone ? 'error' : ''}`}
                  value={resumeData.basicInfo.phone}
                  onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                  placeholder="Your phone number"
                  required
                />
                {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  className={`form-control ${formErrors.location ? 'error' : ''}`}
                  value={resumeData.basicInfo.location}
                  onChange={(e) => handleInputChange('basicInfo', 'location', e.target.value)}
                  placeholder="City, State, Country"
                  required
                />
                {formErrors.location && <div className="error-message">{formErrors.location}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="summary">Professional Summary *</label>
                <textarea
                  id="summary"
                  className={`form-control ${formErrors.summary ? 'error' : ''}`}
                  value={resumeData.basicInfo.summary}
                  onChange={(e) => handleInputChange('basicInfo', 'summary', e.target.value)}
                  placeholder="Write a brief professional summary..."
                  rows="4"
                  required
                />
                {formErrors.summary && <div className="error-message">{formErrors.summary}</div>}
              </div>

              {/* Optional fields */}
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  type="url"
                  id="linkedin"
                  className="form-control"
                  value={resumeData.basicInfo.linkedin}
                  onChange={(e) => handleInputChange('basicInfo', 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="form-group">
                <label htmlFor="github">GitHub</label>
                <input
                  type="url"
                  id="github"
                  className="form-control"
                  value={resumeData.basicInfo.github}
                  onChange={(e) => handleInputChange('basicInfo', 'github', e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  className="form-control"
                  value={resumeData.basicInfo.website}
                  onChange={(e) => handleInputChange('basicInfo', 'website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

            </div>
          </div>
        );

      case 2: // Portfolio Items Selection
        return (
          <div className="resume-step">
            <h2 className="step-title">Select Portfolio Items</h2>
            {formErrors.content && (
              <div className="text-red-500 mb-4 p-2 bg-red-500 bg-opacity-10 rounded">
                {formErrors.content}
              </div>
            )}

            {portfolioLoading ? (
              <div className="loading-indicator">Loading your portfolio items...</div>
            ) : (
              <>
                {['projects', 'skills', 'experiences', 'certificates'].map((itemType) => (
                  <div key={itemType} className="portfolio-section">
                    <h3 className="section-title capitalize">
                      {itemType === 'experiences' ? 'Experience' :
                        itemType === 'certificates' ? 'Certifications' : itemType}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(portfolioData[itemType] || []).map(item => (
                        <div
                          key={item._id}
                          className={`portfolio-item-card cursor-pointer ${resumeData.selectedItems[itemType === 'certificates' ? 'certifications' :
                            itemType === 'experiences' ? 'experience' : itemType]?.includes(item._id) ? 'selected' : ''
                            }`}
                          onClick={() => handlePortfolioItemToggle(
                            itemType === 'certificates' ? 'certifications' :
                              itemType === 'experiences' ? 'experience' : itemType,
                            item._id
                          )}
                        >
                          <div className="card-inner p-4">
                            <div className="flex justify-between items-start">
                              <h4 className="item-title">{item.title || item.name || item.position}</h4>
                              <div className="selection-indicator">
                                {resumeData.selectedItems[
                                  itemType === 'certificates' ? 'certifications' :
                                    itemType === 'experiences' ? 'experience' : itemType
                                ]?.includes(item._id) ? (
                                  <span className="text-[#00FFFF]">✓</span>
                                ) : null}
                              </div>
                            </div>
                            <p className="item-description">
                              {item.description || item.issuer || item.company}
                            </p>
                            <div className="item-date text-sm text-gray-400">
                              {item.startDate || item.issueDate || ''}
                              {item.endDate ? ` - ${item.endDate}` : item.isCurrent ? ' - Present' : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="custom-sections mt-8">
              <h3 className="section-title">Custom Sections</h3>
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
            <h2 className="step-title">Choose a Template</h2>
            {formErrors.template && (
              <div className="text-red-500 mb-4 p-2 bg-red-500 bg-opacity-10 rounded">
                {formErrors.template}
              </div>
            )}

            <div className="template-grid">
              {availableTemplates.map((templateOption) => (
                <div
                  key={templateOption.id}
                  className={`template-card ${template?.id === templateOption.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTemplate(templateOption)}
                >
                  <img
                    src={templateOption.thumbnail}
                    alt={templateOption.name}
                    className="template-thumbnail"
                  />
                  <div className="template-info">
                    <h4>{templateOption.name}</h4>
                    <p>{templateOption.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="template-actions mt-6">
              <Button
                className="back-btn"
                onClick={prevStep}
              >
                Back to Content
              </Button>
            </div>
          </div>
        );

      case 4: // Review & Generate
        return (
          <div className="resume-step">
            <h2 className="step-title">Review & Generate</h2>

            {!template && (
              <div className="alert alert-warning mb-4">
                No template selected. Please go back to step 3 to select a template.
              </div>
            )}

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
                  <div className="review-item">
                    <span className="review-label">Summary:</span>
                    <span className="review-value">{resumeData.basicInfo.summary}</span>
                  </div>
                </div>
              </Card>

              <Card className="mt-4">
                <h3 className="section-title">Selected Portfolio Items</h3>
                <div className="review-section">
                  {['projects', 'skills', 'experience', 'certifications'].map((itemType) => {
                    const selectedCount = resumeData.selectedItems[itemType]?.length || 0;
                    return (
                      <div key={itemType} className="review-item">
                        <span className="review-label capitalize">{itemType}:</span>
                        <span className="review-value">
                          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                          {selectedCount > 0 && (
                            <ul className="selected-items-list mt-1">
                              {portfolioData[itemType === 'certifications' ? 'certificates' :
                                itemType === 'experience' ? 'experiences' : itemType]
                                ?.filter(item => resumeData.selectedItems[itemType]?.includes(item._id))
                                ?.map(item => (
                                  <li key={item._id} className="text-sm text-gray-400">
                                    {item.title || item.name || item.position}
                                  </li>
                                ))}
                            </ul>
                          )}
                        </span>
                      </div>
                    );
                  })}
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
              onClick={() => handleStepNavigation(step)}
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

      {error && (
        <div className="error-message mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

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