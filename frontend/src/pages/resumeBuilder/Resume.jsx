import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; // Import PropTypes
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, ChevronUp, Plus, X, Download, Zap, Award, User, Mail, Phone, Globe, Github, Linkedin, GraduationCap, Briefcase, Code, Trophy, Target } from 'lucide-react';
import '../../styles/pages/BuildResume.css';

// 1. Add these imports at the top
import { useParams, useNavigate } from 'react-router-dom';
import SummaryApi from '../../config';

const ResumeOptimizer = () => {
    const { theme, isDark } = useTheme();
    // 2. Add these state variables in the ResumeOptimizer component
    const { resumeId } = useParams(); // Get resumeId from URL params
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [error, setError] = useState(null); // Now directly stores the error message
    const [expandedSections, setExpandedSections] = useState({
        personal: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
        achievements: false,
        coding: false
    });

    // Define the backend URL
    const BACKEND_URL = 'http://localhost:5000'; // Confirmed to be 5000

    // 3. Update the useEffect to handle both new and edit modes
    useEffect(() => {
        const fetchResumeData = async () => {
            console.log('ResumeOptimizer: resumeId from params:', resumeId);
            
            try {
                setLoading(true);
                setError(null);
                
                if (resumeId) {
                    // Edit mode - fetch existing resume
                    console.log('ResumeOptimizer: Fetching existing resume for ID:', resumeId);
                    setIsEditMode(true);
                    
                    const response = await axios.get(
                        SummaryApi.resumes.single.url(resumeId),
                        { withCredentials: true }
                    );
                    
                    console.log('ResumeOptimizer: Fetched existing resume:', response.data);
                    const resumeData = response.data.resume || response.data;
                    
                    // Ensure all expected arrays are initialized
                    resumeData.education = resumeData.education || [];
                    resumeData.experiences = resumeData.experiences || [];
                    resumeData.projects = resumeData.projects || [];
                    resumeData.skills = resumeData.skills || [
                        { category: "Programming Languages", skills: [] }, 
                        { category: "Frameworks", skills: [] }
                    ];
                    resumeData.achievements = resumeData.achievements || [];
                    resumeData.coding_profiles = resumeData.coding_profiles || [];
                    
                    setResumeData(resumeData);
                } else {
                    // New resume mode - fetch default template
                    console.log('ResumeOptimizer: Creating new resume with default data');
                    setIsEditMode(false);
                    
                    const response = await axios.get(`${BACKEND_URL}/api/default-resume`);
                    const data = response.data;
                    
                    // Initialize with empty data for new resume
                    data.education = data.education || [];
                    data.experiences = data.experiences || [];
                    data.projects = data.projects || [];
                    data.skills = data.skills || [
                        { category: "Programming Languages", skills: [] }, 
                        { category: "Frameworks", skills: [] }
                    ];
                    data.achievements = data.achievements || [];
                    data.coding_profiles = data.coding_profiles || [];
                    
                    setResumeData(data);
                }
            } catch (err) {
                console.error('ResumeOptimizer: Fetch error:', err);
                let errorMessage = isEditMode 
                    ? 'Failed to load resume data. ' 
                    : 'Failed to load default resume data. ';
                
                if (err.code === 'ERR_NETWORK') {
                    errorMessage += 'Network error, backend might not be running or reachable.';
                } else if (err.response) {
                    errorMessage += `Server responded with status ${err.response.status}. Message: ${err.response.data?.message || err.response.data?.error || 'No specific message.'}`;
                } else {
                    errorMessage += `Error: ${err.message}.`;
                }
                setError(errorMessage);
                
                // Fallback structure
                setResumeData({
                    name: "", email: "", phone: "", linkedin: "", github: "", 
                    portfolio: "", target_profession: "Software Engineer",
                    education: [], experiences: [], projects: [],
                    skills: [{ category: "Programming Languages", skills: [] }],
                    achievements: [], coding_profiles: []
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchResumeData();
    }, [resumeId]); // Dependency on resumeId

    // Section toggle handler
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // --- Helper Functions for Form Handling (unchanged) ---
    // These functions need to be defined within the ResumeOptimizer component
    // or imported if they are external utilities.
    // For this update, assuming they are defined right after the state declarations
    // or are placed logically before their first use.
    // I'm adding placeholder comments for them as they were 'unchanged' in your instructions.

    const handleInputChange = (e, section, index, field) => {
        setResumeData(prevData => {
            if (index !== undefined && field) { // For nested arrays like education, experience, projects
                const updatedSection = [...prevData[section]];
                if (field === 'technologies' && typeof e.target.value === 'string') {
                    updatedSection[index] = {
                        ...updatedSection[index],
                        [field]: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    };
                } else {
                    updatedSection[index] = {
                        ...updatedSection[index],
                        [field]: e.target.value
                    };
                }
                return { ...prevData, [section]: updatedSection };
            } else if (index !== undefined) { // For skill categories (only category field is directly input)
                const updatedSection = [...prevData[section]];
                updatedSection[index] = {
                    ...updatedSection[index],
                    category: e.target.value
                };
                return { ...prevData, [section]: updatedSection };
            }
            // For top-level fields like name, email, phone, etc.
            return { ...prevData, [section]: e.target.value };
        });
    };
    
    const handleTextAreaChange = (e, section, index, subIndex, field) => {
        setResumeData(prevData => {
            const updatedSection = [...prevData[section]];
            const updatedItem = { ...updatedSection[index] };
            const updatedBulletPoints = [...(updatedItem[field] || [])];
            updatedBulletPoints[subIndex] = e.target.value;
            updatedItem[field] = updatedBulletPoints;
            updatedSection[index] = updatedItem;
            return { ...prevData, [section]: updatedSection };
        });
    };
    
    const handleSkillChange = (e, categoryIndex, skillIndex) => {
        setResumeData(prevData => {
            const updatedSkills = [...prevData.skills];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            const updatedSkillList = [...updatedCategory.skills];
            updatedSkillList[skillIndex] = e.target.value;
            updatedCategory.skills = updatedSkillList;
            updatedSkills[categoryIndex] = updatedCategory;
            return { ...prevData, skills: updatedSkills };
        });
    };
    
    const getNewItemTemplate = (section) => {
        switch (section) {
            case 'education':
                return { institution: '', degree: '', field: '', date_range: '', gpa: '' };
            case 'experiences':
                return { company: '', position: '', date_range: '', description: [''] };
            case 'projects':
                return { name: '', link: '', technologies: '', description: [''] };
            case 'skills':
                return { category: '', skills: [''] };
            case 'achievements':
                return { title: '', description: '' };
            case 'coding_profiles':
                return { platform: '', url: '' };
            default:
                return {};
        }
    };

    const handleAddItem = (section) => {
        setResumeData(prevData => ({
            ...prevData,
            [section]: [...prevData[section], getNewItemTemplate(section)]
        }));
    };

    const handleRemoveItem = (section, index) => {
        setResumeData(prevData => ({
            ...prevData,
            [section]: prevData[section].filter((_, i) => i !== index)
        }));
    };

    const handleAddBulletPoint = (section, index, field = 'description') => {
        setResumeData(prevData => {
            const updatedSection = [...prevData[section]];
            const updatedItem = { ...updatedSection[index] };
            const updatedBulletPoints = [...(updatedItem[field] || []), ''];
            updatedItem[field] = updatedBulletPoints;
            updatedSection[index] = updatedItem;
            return { ...prevData, [section]: updatedSection };
        });
    };

    const handleRemoveBulletPoint = (section, index, subIndex, field = 'description') => {
        setResumeData(prevData => {
            const updatedSection = [...prevData[section]];
            const updatedItem = { ...updatedSection[index] };
            const updatedBulletPoints = (updatedItem[field] || []).filter((_, i) => i !== subIndex);
            updatedItem[field] = updatedBulletPoints;
            updatedSection[index] = updatedItem;
            return { ...prevData, [section]: updatedSection };
        });
    };

    const handleAddSkill = (categoryIndex) => {
        setResumeData(prevData => {
            const updatedSkills = [...prevData.skills];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            updatedCategory.skills = [...updatedCategory.skills, ''];
            updatedSkills[categoryIndex] = updatedCategory;
            return { ...prevData, skills: updatedSkills };
        });
    };

    const handleRemoveSkill = (categoryIndex, skillIndex) => {
        setResumeData(prevData => {
            const updatedSkills = [...prevData.skills];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            updatedCategory.skills = updatedCategory.skills.filter((_, i) => i !== skillIndex);
            updatedSkills[categoryIndex] = updatedCategory;
            return { ...prevData, skills: updatedSkills };
        });
    };

    // 4. Update the handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setOptimizing(true);
        setError(null);
        setOptimizationResult(null);

        try {
            if (!resumeData.name || !resumeData.email || !resumeData.phone || !resumeData.target_profession) {
                throw new Error("Please fill in all required fields (Name, Email, Phone, Target Profession).");
            }

            const dataToSend = {
                ...resumeData,
                projects: resumeData.projects.map(p => ({
                    ...p,
                    technologies: typeof p.technologies === 'string'
                        ? p.technologies.split(',').map(t => t.trim()).filter(t => t)
                        : (p.technologies || [])
                }))
            };

            console.log('ResumeOptimizer: Submitting data for optimization:', dataToSend);
            
            let response;
            if (isEditMode && resumeId) {
                // Update existing resume
                console.log('ResumeOptimizer: Updating existing resume');
                response = await axios.put(
                    SummaryApi.resumes.update.url(resumeId),
                    dataToSend,
                    { withCredentials: true }
                );
            } else {
                // Create new resume
                console.log('ResumeOptimizer: Creating new resume');
                response = await axios.post(
                    SummaryApi.resumes.create.url,
                    dataToSend,
                    { withCredentials: true }
                );
            }
            
            setOptimizationResult(response.data);
            console.log('ResumeOptimizer: Operation successful:', response.data);
            
            // Navigate to my-resumes after successful save
            setTimeout(() => {
                navigate('/resume/my-resumes');
            }, 2000);
            
        } catch (err) {
            console.error('ResumeOptimizer: Operation error:', err);
            let errorMessage = isEditMode 
                ? 'Failed to update resume. ' 
                : 'Failed to create resume. ';
                
            if (err.code === 'ERR_NETWORK') {
                errorMessage += 'Network error, backend might not be running or reachable.';
            } else if (err.response) {
                errorMessage += `Server responded with status ${err.response.status}. Message: ${err.response.data?.message || err.response.data?.error || 'No specific message.'}`;
            } else {
                errorMessage += `Error: ${err.message}.`;
            }
            setError(errorMessage);
        } finally {
            setOptimizing(false);
        }
    };

    // --- Render Loading/Error/Form ---
    if (loading) {
        return (
            <div className={`resume-optimizer-container ${isDark ? 'dark' : ''}`}>
                {/* Hero section is visible even during loading */}
                <div className="hero-section">
                    <div className="hero-content">
                        <div className="hero-icon">
                            <Zap size={40} />
                        </div>
                        <h1 className="hero-title">
                            {/* 6. Update the hero title based on mode */}
                            <span className="gradient-text">
                                {isEditMode ? 'Edit ATS Resume' : 'ATS Resume Builder'}
                            </span>
                        </h1>
                        <p className="hero-subtitle">
                            {isEditMode 
                                ? 'Update your resume with AI-powered optimization for better ATS compatibility'
                                : 'Create your resume with AI-powered optimization for better ATS compatibility'
                            }
                        </p>
                    </div>
                </div>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Loading resume data...</p>
                </div>
            </div>
        );
    }

    // Render form only when resumeData is available
    if (!resumeData) {
        // This state implies loading is false, but resumeData is null.
        // This means the fetch attempt failed and the error state should contain a message.
        return (
            <div className={`resume-optimizer-container ${isDark ? 'dark' : ''}`}>
                {/* Hero section remains visible */}
                <div className="hero-section">
                    <div className="hero-content">
                        <div className="hero-icon">
                            <Zap size={40} />
                        </div>
                        <h1 className="hero-title">
                            {/* 6. Update the hero title based on mode */}
                            <span className="gradient-text">
                                {isEditMode ? 'Edit ATS Resume' : 'ATS Resume Builder'}
                            </span>
                        </h1>
                        <p className="hero-subtitle">
                            {isEditMode 
                                ? 'Update your resume with AI-powered optimization for better ATS compatibility'
                                : 'Create your resume with AI-powered optimization for better ATS compatibility'
                            }
                        </p>
                    </div>
                </div>
                {/* Display a prominent error message here */}
                <div className={`error-alert slide-in ${isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-800'}`}>
                    <div className="error-content">
                        <X size={20} />
                        <span>{error || 'Could not load resume data. Please check connection and try again.'}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`resume-optimizer-container ${isDark ? 'dark' : ''}`}>
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon">
                        <Zap size={40} />
                    </div>
                    <h1 className="hero-title">
                        {/* 6. Update the hero title based on mode */}
                        <span className="gradient-text">
                            {isEditMode ? 'Edit ATS Resume' : 'ATS Resume Builder'}
                        </span>
                    </h1>
                    <p className="hero-subtitle">
                        {isEditMode 
                            ? 'Update your resume with AI-powered optimization for better ATS compatibility'
                            : 'Create your resume with AI-powered optimization for better ATS compatibility'
                        }
                    </p>
                </div>
            </div>

            {error && ( // This error refers to submission errors now, or previous errors not caught by the !resumeData block
                <div className="error-alert slide-in">
                    <div className="error-content">
                        <X size={20} />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="optimizer-form">
                {/* Personal Information */}
                <Section
                    title="Personal Information"
                    icon={<User size={20} />}
                    isExpanded={expandedSections.personal}
                    onToggle={() => toggleSection('personal')}
                    required
                >
                    <div className="form-grid">
                        <InputField
                            label="Full Name"
                            value={resumeData.name}
                            onChange={e => handleInputChange(e, 'name')}
                            required
                            icon={<User size={16} />}
                        />
                        <InputField
                            label="Email Address"
                            type="email"
                            value={resumeData.email}
                            onChange={e => handleInputChange(e, 'email')}
                            required
                            icon={<Mail size={16} />}
                        />
                        <InputField
                            label="Phone Number"
                            type="tel"
                            value={resumeData.phone}
                            onChange={e => handleInputChange(e, 'phone')}
                            required
                            icon={<Phone size={16} />}
                        />
                        <InputField
                            label="LinkedIn Profile"
                            value={resumeData.linkedin || ''}
                            onChange={e => handleInputChange(e, 'linkedin')}
                            icon={<Linkedin size={16} />}
                        />
                        <InputField
                            label="GitHub Profile"
                            value={resumeData.github || ''}
                            onChange={e => handleInputChange(e, 'github')}
                            icon={<Github size={16} />}
                        />
                        <InputField
                            label="Portfolio Website"
                            value={resumeData.portfolio || ''}
                            onChange={e => handleInputChange(e, 'portfolio')}
                            icon={<Globe size={16} />}
                        />
                        <InputField
                            label="Target Profession"
                            value={resumeData.target_profession}
                            onChange={e => handleInputChange(e, 'target_profession')}
                            required
                            placeholder="e.g., Software Engineer, Data Scientist"
                            icon={<Target size={16} />}
                            className="col-span-2"
                        />
                    </div>
                </Section>

                {/* Education */}
                <Section
                    title="Education"
                    icon={<GraduationCap size={20} />}
                    isExpanded={expandedSections.education}
                    onToggle={() => toggleSection('education')}
                    onAdd={() => handleAddItem('education')}
                    addLabel="Add Education"
                >
                    {resumeData.education.map((edu, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('education', index)}>
                            <div className="form-grid">
                                <InputField
                                    label="Institution"
                                    value={edu.institution}
                                    onChange={e => handleInputChange(e, 'education', index, 'institution')}
                                    required
                                />
                                <InputField
                                    label="Degree"
                                    value={edu.degree}
                                    onChange={e => handleInputChange(e, 'education', index, 'degree')}
                                    required
                                />
                                <InputField
                                    label="Field of Study"
                                    value={edu.field}
                                    onChange={e => handleInputChange(e, 'education', index, 'field')}
                                />
                                <InputField
                                    label="Date Range"
                                    value={edu.date_range}
                                    onChange={e => handleInputChange(e, 'education', index, 'date_range')}
                                    required
                                    placeholder="e.g., Aug 2020 - May 2024"
                                />
                                <InputField
                                    label="GPA / Percentage"
                                    value={edu.gpa || ''}
                                    onChange={e => handleInputChange(e, 'education', index, 'gpa')}
                                />
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.education.length === 0 && (
                        <EmptyState message="No education added yet. Click 'Add Education' to get started." />
                    )}
                </Section>

                {/* Experience */}
                <Section
                    title="Experience"
                    icon={<Briefcase size={20} />}
                    isExpanded={expandedSections.experience}
                    onToggle={() => toggleSection('experience')}
                    onAdd={() => handleAddItem('experiences')}
                    addLabel="Add Experience"
                >
                    {resumeData.experiences.map((exp, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('experiences', index)}>
                            <div className="form-grid mb-4">
                                <InputField
                                    label="Company"
                                    value={exp.company}
                                    onChange={e => handleInputChange(e, 'experiences', index, 'company')}
                                    required
                                />
                                <InputField
                                    label="Position"
                                    value={exp.position}
                                    onChange={e => handleInputChange(e, 'experiences', index, 'position')}
                                    required
                                />
                                <InputField
                                    label="Date Range"
                                    value={exp.date_range}
                                    onChange={e => handleInputChange(e, 'experiences', index, 'date_range')}
                                    required
                                    placeholder="e.g., Jun 2022 - Present"
                                    className="col-span-2"
                                />
                            </div>
                            <BulletPointEditor
                                label="Job Description"
                                items={exp.description || []}
                                onChange={(descIndex, value) => handleTextAreaChange({ target: { value } }, 'experiences', index, descIndex, 'description')}
                                onAdd={() => handleAddBulletPoint('experiences', index)}
                                onRemove={(descIndex) => handleRemoveBulletPoint('experiences', index, descIndex)}
                            />
                        </FormCard>
                    ))}
                    {resumeData.experiences.length === 0 && (
                        <EmptyState message="No experience added yet. Click 'Add Experience' to get started." />
                    )}
                </Section>

                {/* Projects */}
                <Section
                    title="Projects"
                    icon={<Code size={20} />}
                    isExpanded={expandedSections.projects}
                    onToggle={() => toggleSection('projects')}
                    onAdd={() => handleAddItem('projects')}
                    addLabel="Add Project"
                >
                    {resumeData.projects.map((proj, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('projects', index)}>
                            <div className="form-grid mb-4">
                                <InputField
                                    label="Project Name"
                                    value={proj.name}
                                    onChange={e => handleInputChange(e, 'projects', index, 'name')}
                                    required
                                />
                                <InputField
                                    label="Project Link"
                                    value={proj.link || ''}
                                    onChange={e => handleInputChange(e, 'projects', index, 'link')}
                                    icon={<Globe size={16} />}
                                />
                                <InputField
                                    label="Technologies"
                                    value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '')}
                                    onChange={e => handleInputChange(e, 'projects', index, 'technologies')}
                                    placeholder="e.g., React, Node.js, MongoDB"
                                    className="col-span-2"
                                />
                            </div>
                            <BulletPointEditor
                                label="Project Description"
                                items={proj.description || []}
                                onChange={(descIndex, value) => handleTextAreaChange({ target: { value } }, 'projects', index, descIndex, 'description')}
                                onAdd={() => handleAddBulletPoint('projects', index)}
                                onRemove={(descIndex) => handleRemoveBulletPoint('projects', index, descIndex)}
                            />
                        </FormCard>
                    ))}
                    {resumeData.projects.length === 0 && (
                        <EmptyState message="No projects added yet. Click 'Add Project' to showcase your work." />
                    )}
                </Section>

                {/* Skills */}
                <Section
                    title="Skills"
                    icon={<Award size={20} />}
                    isExpanded={expandedSections.skills}
                    onToggle={() => toggleSection('skills')}
                    onAdd={() => handleAddItem('skills')}
                    addLabel="Add Skill Category"
                >
                    {resumeData.skills.map((skillCat, catIndex) => (
                        <FormCard key={catIndex} onRemove={() => handleRemoveItem('skills', catIndex)}>
                            <InputField
                                label="Skill Category"
                                value={skillCat.category}
                                onChange={e => handleInputChange(e, 'skills', catIndex, 'category')}
                                required
                                className="mb-4"
                                placeholder="e.g., Programming Languages, Frameworks"
                            />
                            <div className="skills-grid">
                                {skillCat.skills.map((skill, skillIndex) => (
                                    <div key={skillIndex} className="skill-input-group">
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={e => handleSkillChange(e, catIndex, skillIndex)}
                                            className="skill-input"
                                            placeholder="Enter a skill"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(catIndex, skillIndex)}
                                            className="skill-remove-btn"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddSkill(catIndex)}
                                    className="add-skill-btn"
                                >
                                    <Plus size={16} />
                                    <span>Add Skill</span>
                                </button>
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.skills.length === 0 && (
                        <EmptyState message="No skill categories added yet. Click 'Add Skill Category' to organize your skills." />
                    )}
                </Section>

                {/* Achievements */}
                <Section
                    title="Achievements"
                    subtitle="(Optional)"
                    icon={<Trophy size={20} />}
                    isExpanded={expandedSections.achievements}
                    onToggle={() => toggleSection('achievements')}
                    onAdd={() => handleAddItem('achievements')}
                    addLabel="Add Achievement"
                >
                    {resumeData.achievements.map((ach, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('achievements', index)}>
                            <InputField
                                label="Achievement Title"
                                value={ach.title}
                                onChange={e => handleInputChange(e, 'achievements', index, 'title')}
                                className="mb-4"
                            />
                            <div className="textarea-wrapper">
                                <label className="form-label">Description</label>
                                <textarea
                                    value={ach.description}
                                    onChange={e => handleInputChange(e, 'achievements', index, 'description')}
                                    className="form-textarea"
                                    rows="3"
                                    placeholder="Describe your achievement..."
                                />
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.achievements.length === 0 && (
                        <EmptyState message="No achievements added yet. Click 'Add Achievement' to showcase your accomplishments." />
                    )}
                </Section>

                {/* Coding Profiles */}
                <Section
                    title="Coding Profiles"
                    subtitle="(Optional)"
                    icon={<Code size={20} />}
                    isExpanded={expandedSections.coding}
                    onToggle={() => toggleSection('coding')}
                    onAdd={() => handleAddItem('coding_profiles')}
                    addLabel="Add Profile"
                >
                    {resumeData.coding_profiles.map((prof, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('coding_profiles', index)}>
                            <div className="form-grid">
                                <InputField
                                    label="Platform"
                                    value={prof.platform}
                                    onChange={e => handleInputChange(e, 'coding_profiles', index, 'platform')}
                                    placeholder="e.g., LeetCode, CodeChef, HackerRank"
                                />
                                <InputField
                                    label="Profile URL"
                                    value={prof.url}
                                    onChange={e => handleInputChange(e, 'coding_profiles', index, 'url')}
                                    icon={<Globe size={16} />}
                                />
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.coding_profiles.length === 0 && (
                        <EmptyState message="No coding profiles added yet. Add your competitive programming profiles to stand out." />
                    )}
                </Section>

                {/* Submit Button */}
                <div className="submit-section">
                    {/* 5. Update the submit button text based on mode */}
                    <button
                        type="submit"
                        disabled={optimizing || loading}
                        className="submit-btn"
                    >
                        {optimizing ? (
                            <>
                                <div className="loading-spinner small"></div>
                                <span>
                                    {isEditMode ? 'Updating Resume...' : 'Creating Resume...'}
                                </span>
                            </>
                        ) : (
                            <>
                                <Zap size={20} />
                                <span>
                                    {isEditMode ? 'Update Resume & Generate PDF' : 'Create Resume & Generate PDF'}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Optimization Results */}
            {optimizationResult && (
                <div className="results-section slide-in">
                    <div className="results-header">
                        <div className="results-icon">
                            <Zap size={32} />
                        </div>
                        <h2 className="results-title">
                            <span className="gradient-text">Optimization Complete!</span>
                        </h2>
                    </div>

                    <div className="results-content">
                        <div className="ats-score-card">
                            <h3>ATS Compatibility Score</h3>
                            <div className="score-display">
                                <span className="score-number">{optimizationResult.ats_score.toFixed(1)}</span>
                                <span className="score-max">/ 100</span>
                            </div>
                            <div className="score-bar">
                                <div
                                    className="score-fill"
                                    style={{ width: `${optimizationResult.ats_score}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="improvements-card">
                            <h3>Improvement Suggestions</h3>
                            <ul className="improvements-list">
                                {optimizationResult.improvement_notes.map((note, index) => (
                                    <li key={index} className="improvement-item">
                                        <div className="improvement-bullet"></div>
                                        <span>{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="download-card">
                            <h3>Download Your Optimized Resume</h3>
                            <a
                                href={optimizationResult.pdf_url}
                                download="optimized_resume.pdf"
                                className="download-btn"
                            >
                                <Download size={20} />
                                <span>Download PDF</span>
                            </a>
                            <p className="download-note">
                                Your optimized resume is ready for download as a PDF file.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Components with PropTypes ---

const Section = ({ title, subtitle, icon, children, isExpanded, onToggle, onAdd, addLabel, required }) => (
    <div className="form-section slide-in">
        <div className="section-header" onClick={onToggle}>
            <div className="section-title-group">
                <div className="section-icon">{icon}</div>
                <div>
                    <h2 className="section-title">
                        {title} {subtitle && <span className="section-subtitle">{subtitle}</span>}
                        {required && <span className="required-indicator">*</span>}
                    </h2>
                </div>
            </div>
            <div className="section-actions">
                {onAdd && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); onAdd(); }} className="add-btn">
                        <Plus size={16} />
                        <span>{addLabel}</span>
                    </button>
                )}
                <button type="button" className="expand-btn">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>
        </div>
        {isExpanded && <div className="section-content">{children}</div>}
    </div>
);

Section.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    icon: PropTypes.element,
    children: PropTypes.node,
    isExpanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    onAdd: PropTypes.func, // Optional prop
    addLabel: PropTypes.string,
    required: PropTypes.bool,
};

const FormCard = ({ children, onRemove }) => (
    <div className="form-card">
        <button type="button" onClick={onRemove} className="remove-card-btn">
            <X size={18} />
        </button>
        {children}
    </div>
);

FormCard.propTypes = {
    children: PropTypes.node,
    onRemove: PropTypes.func.isRequired,
};

const InputField = ({ label, type = 'text', value, onChange, required = false, placeholder = '', className = '', icon }) => (
    <div className={`input-wrapper ${className}`}>
        <label className="form-label">
            {label}
            {required && <span className="required-indicator">*</span>}
        </label>
        <div className="input-container">
            {icon && <div className="input-icon">{icon}</div>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder || label}
                className={`form-input ${icon ? 'has-icon' : ''}`}
            />
        </div>
    </div>
);

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    icon: PropTypes.element,
};

const BulletPointEditor = ({ label, items, onChange, onAdd, onRemove }) => (
    <div className="bullet-editor">
        <label className="form-label">{label}</label>
        <div className="bullet-list">
            {(items || []).map((item, index) => ( // Ensure items is an array
                <div key={index} className="bullet-item">
                    <div className="bullet-dot"></div>
                    <textarea
                        value={item}
                        onChange={(e) => onChange(index, e.target.value)}
                        className="bullet-textarea"
                        rows="2"
                        placeholder="Describe your responsibilities and achievements..."
                        required
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="bullet-remove-btn"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
        <button type="button" onClick={onAdd} className="add-bullet-btn">
            <Plus size={16} />
            <span>Add Point</span>
        </button>
    </div>
);

BulletPointEditor.propTypes = {
    label: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.string).isRequired, // Expects an array of strings
    onChange: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

const EmptyState = ({ message }) => (
    <div className="empty-state">
        <p>{message}</p>
    </div>
);

EmptyState.propTypes = {
    message: PropTypes.string.isRequired,
};

export default ResumeOptimizer;