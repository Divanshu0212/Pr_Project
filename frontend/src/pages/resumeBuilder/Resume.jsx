
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, ChevronUp, Plus, X, Download, Zap, Award, User, Mail, Phone, Globe, Github, Linkedin, GraduationCap, Briefcase, Code, Trophy, Target } from 'lucide-react';
import '../../styles/pages/BuildResume.css';
import SummaryApi from '../../config';

// --- Auxiliary Components (These are correct, no changes needed) ---

const Section = ({ title, subtitle, icon, children, isExpanded, onToggle, onAdd, addLabel, required }) => {
    const { isDark } = useTheme();
    return (
        <div className={`form-section slide-in ${isDark ? 'dark-section' : ''}`}>
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
                        <span>{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                    </button>
                </div>
            </div>
            {isExpanded && <div className="section-content">{children}</div>}
        </div>
    );
};

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

const FormCard = ({ children, onRemove }) => {
    const { isDark } = useTheme();
    return (
        <div className={`form-card ${isDark ? 'dark-card' : ''}`}>
            <button type="button" onClick={onRemove} className="remove-card-btn">
                <X size={18} />
            </button>
            {children}
        </div>
    );
};

FormCard.propTypes = {
    children: PropTypes.node,
    onRemove: PropTypes.func.isRequired,
};

const InputField = ({ label, type = 'text', value, onChange, required = false, placeholder = '', className = '', icon }) => {
    const { isDark } = useTheme();
    return (
        <div className={`input-wrapper ${className}`}>
            <label className="form-label">{label}{required && <span className="required-indicator">*</span>}</label>
            <div className="input-container">
                {icon && <div className="input-icon">{icon}</div>}
                <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder || label} className={`form-input ${isDark ? 'dark-input' : ''} ${icon ? 'has-icon' : ''}`} />
            </div>
        </div>
    );
};

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

const BulletPointEditor = ({ label, items, onChange, onAdd, onRemove }) => {
    const { isDark } = useTheme();
    return (
        <div className="bullet-editor">
            <label className="form-label">{label}</label>
            <div className="bullet-list">
                {(items || []).map((item, index) => (
                    <div key={index} className="bullet-item">
                        <div className="bullet-dot"></div>
                        <textarea value={item} onChange={(e) => onChange(index, e.target.value)} className={`bullet-textarea ${isDark ? 'dark-input' : ''}`} rows="2" placeholder="Describe your responsibilities and achievements..." required />
                        <button type="button" onClick={() => onRemove(index)} className="bullet-remove-btn"><X size={14} /></button>
                    </div>
                ))}
                <button type="button" onClick={onAdd} className="add-bullet-btn"><Plus size={16} /><span>Add Point</span></button>
            </div>
        </div>
    );
};

BulletPointEditor.propTypes = {
    label: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

const EmptyState = ({ message }) => {
    const { isDark } = useTheme();
    return <div className={`empty-state ${isDark ? 'dark-empty-state' : ''}`}><p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{message}</p></div>;
};

EmptyState.propTypes = {
    message: PropTypes.string.isRequired,
};

// --- ResumeOptimizer Main Component ---

const ResumeOptimizer = () => {
    const { isDark } = useTheme();
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(!!resumeId);

    // Initialize resumeData with a blank structure immediately if not in edit mode
    // This ensures the form can render even if no resumeId is present.
    const [resumeData, setResumeData] = useState(() => {
        if (resumeId) {
            return null; // Will be fetched in useEffect
        } else {
            return {
                name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "",
                target_profession: "", education: [], experiences: [], projects: [],
                skills: [
                    { category: "Programming Languages", skills: [] },
                    { category: "Frameworks & Libraries", skills: [] },
                    { category: "Tools & Platforms", skills: [] }
                ],
                achievements: [], coding_profiles: []
            };
        }
    });
    const [loading, setLoading] = useState(!!resumeId); // Only set loading true if resumeId exists (i.e., in edit mode)
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        personal: true, education: true, experience: true, projects: true,
        skills: true, achievements: false, coding: false
    });

    useEffect(() => {
        const fetchResumeData = async () => {
            if (resumeId) { // Only fetch if in edit mode
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(SummaryApi.resumes.single.url(resumeId), { withCredentials: true });
                    let fetchedData = response.data.resume;
                    
                    // Ensure data structure consistency
                    fetchedData.education = fetchedData.education || [];
                    fetchedData.experiences = fetchedData.experiences || [];
                    fetchedData.projects = (fetchedData.projects || []).map(p => ({
                        ...p,
                        technologies: Array.isArray(p.technologies) ? p.technologies : (p.technologies || '').split(',').map(t => t.trim()).filter(Boolean)
                    }));
                    fetchedData.skills = fetchedData.skills || [{ category: "Programming Languages", skills: [] }];
                    fetchedData.achievements = fetchedData.achievements || [];
                    fetchedData.coding_profiles = fetchedData.coding_profiles || [];
                    
                    setResumeData(fetchedData);
                } catch (err) {
                    console.error('ResumeOptimizer: Fetch error:', err);
                    let errorMessage = `Failed to load resume. `;
                    if (axios.isAxiosError(err) && err.response) {
                        errorMessage += `Server responded with status ${err.response.status}.`;
                    } else {
                        errorMessage += `Please check your network connection and try again.`;
                    }
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchResumeData();
    }, [resumeId]);

    // --- All your handler functions (handleInputChange, etc.) go here ---
    // --- NO CHANGES ARE NEEDED IN THE HANDLERS as per instructions ---

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleInputChange = (e, section, index, field) => {
        const value = e && e.target ? e.target.value : e;
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const newData = { ...prevData };
            if (index === undefined && field === undefined) {
                newData[section] = value;
            } else if (field === 'category' && index !== undefined) {
                const updatedSkills = [...(newData.skills || [])];
                if (updatedSkills[index]) {
                    updatedSkills[index] = { ...updatedSkills[index], category: value };
                }
                newData.skills = updatedSkills;
            } else if (index !== undefined && field) {
                const updatedSection = [...(newData[section] || [])];
                if (updatedSection[index]) {
                    if (field === 'technologies' && typeof value === 'string') {
                        updatedSection[index] = {
                            ...updatedSection[index],
                            [field]: value.split(',').map(t => t.trim()).filter(t => t)
                        };
                    } else {
                        updatedSection[index] = {
                            ...updatedSection[index],
                            [field]: value
                        };
                    }
                }
                newData[section] = updatedSection;
            }
            return newData;
        });
    };

    const handleTextAreaChange = (e, section, index, subIndex, field) => {
        const value = e && e.target ? e.target.value : e;
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const newData = { ...prevData };
            const updatedSection = [...(newData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            const updatedBulletPoints = [...(updatedItem[field] || [])];
            updatedBulletPoints[subIndex] = value;
            updatedItem[field] = updatedBulletPoints;
            updatedSection[index] = updatedItem;
            newData[section] = updatedSection;
            return newData;
        });
    };

    const handleSkillChange = (e, categoryIndex, skillIndex) => {
        const value = e && e.target ? e.target.value : e;
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const newData = { ...prevData };
            const updatedSkills = [...(newData.skills || [])];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            const updatedSkillList = [...(updatedCategory.skills || [])];
            updatedSkillList[skillIndex] = value;
            updatedCategory.skills = updatedSkillList;
            updatedSkills[categoryIndex] = updatedCategory;
            newData.skills = updatedSkills;
            return newData;
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
        setResumeData(prevData => {
            if (!prevData) return prevData;
            if (section === 'skills') {
                return {
                    ...prevData,
                    skills: [...(prevData.skills || []), { category: '', skills: [''] }]
                };
            }
            return {
                ...prevData,
                [section]: [...(prevData[section] || []), getNewItemTemplate(section)]
            };
        });
    };

    const handleRemoveItem = (section, index) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            return {
                ...prevData,
                [section]: (prevData[section] || []).filter((_, i) => i !== index)
            };
        });
    };

    const handleAddBulletPoint = (section, index, field = 'description') => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSection = [...(prevData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            const updatedBulletPoints = [...(updatedItem[field] || []), ''];
            updatedItem[field] = updatedBulletPoints;
            updatedSection[index] = updatedItem;
            return { ...prevData, [section]: updatedSection };
        });
    };

    const handleRemoveBulletPoint = (section, index, subIndex, field = 'description') => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSection = [...(prevData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            const updatedBulletPoints = (updatedItem[field] || []).filter((_, i) => i !== subIndex);
            updatedItem[field] = updatedBulletPoints;
            updatedSection[index] = updatedItem;
            return { ...prevData, [section]: updatedSection };
        });
    };

    const handleAddSkill = (categoryIndex) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSkills = [...(prevData.skills || [])];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            updatedCategory.skills = [...(updatedCategory.skills || []), ''];
            updatedSkills[categoryIndex] = updatedCategory;
            return { ...prevData, skills: updatedSkills };
        });
    };

    const handleRemoveSkill = (categoryIndex, skillIndex) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSkills = [...(prevData.skills || [])];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            updatedCategory.skills = (updatedCategory.skills || []).filter((_, i) => i !== skillIndex);
            updatedSkills[categoryIndex] = updatedCategory;
            return { ...prevData, skills: updatedSkills };
        });
    };

    // --- Form Submission ---
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
                title: resumeData.name || `Resume - ${new Date().toLocaleDateString()}`,
                resumeData: {
                    ...resumeData,
                    projects: resumeData.projects.map(p => ({
                        ...p,
                        technologies: Array.isArray(p.technologies)
                            ? p.technologies
                            : (typeof p.technologies === 'string' ? p.technologies.split(',').map(t => t.trim()).filter(t => t) : [])
                    })),
                    skills: resumeData.skills.map(s => ({
                        ...s,
                        skills: Array.isArray(s.skills) ? s.skills : []
                    }))
                }
            };

            let response;
            if (isEditMode && resumeId) {
                response = await axios({
                    method: SummaryApi.resumes.update.method,
                    url: SummaryApi.resumes.update.url(resumeId),
                    data: dataToSend,
                    withCredentials: true
                });
            } else {
                response = await axios({
                    method: SummaryApi.resumes.create.method,
                    url: SummaryApi.resumes.create.url,
                    data: dataToSend,
                    withCredentials: true
                });
            }

            setOptimizationResult(response.data);
            setTimeout(() => {
                navigate('/resume/my-resumes');
            }, 2000);

        } catch (err) {
            console.error('ResumeOptimizer: Operation error:', err);
            let errorMessage = isEditMode
                ? 'Failed to update resume. '
                : 'Failed to create resume. ';

            if (axios.isAxiosError(err)) {
                if (err.code === 'ERR_NETWORK') {
                    errorMessage += 'Network error, please ensure the backend is running and reachable.';
                } else if (err.response) {
                    errorMessage += `Server responded with status ${err.response.status}. Message: ${err.response.data?.message || err.response.data?.error || 'No specific message.'}`;
                } else {
                    errorMessage += `Request failed: ${err.message}.`;
                }
            } else {
                errorMessage += `Error: ${err.message}.`;
            }
            setError(errorMessage);
        } finally {
            setOptimizing(false);
        }
    };

    // --- Definitive Render Logic ---

    const renderHero = () => (
        <div className="hero-section">
            <div className="hero-content">
                <div className="hero-icon"><Zap size={40} /></div>
                <h1 className="hero-title">
                    <span className="gradient-text">{isEditMode ? 'Edit ATS Resume' : 'ATS Resume Builder'}</span>
                </h1>
                <p className="hero-subtitle">
                    {isEditMode
                        ? 'Update your resume with AI-powered optimization for better ATS compatibility'
                        : 'Create your resume with AI-powered optimization for better ATS compatibility'
                    }
                </p>
            </div>
        </div>
    );

    // Show loading state only if in edit mode and data is being fetched
    if (loading && resumeId) {
        return (
            <div className={`resume-optimizer-container ${isDark ? 'dark' : ''}`}>
                {renderHero()}
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Loading resume data...
                    </p>
                </div>
            </div>
        );
    }

    // Displays if there was an error during the initial data fetch (resumeData would be null) AND we are in edit mode
    if (error && !resumeData && resumeId) {
        return (
            <div className={`resume-optimizer-container ${isDark ? 'dark' : ''}`}>
                {renderHero()}
                <div className={`error-alert slide-in ${isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-800'}`}>
                    <div className="error-content">
                        <X size={20} />
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    // The form will always attempt to render now, as resumeData is either fetched or initialized to a blank object.
    return (
        <div className={`resume-optimizer-container ${isDark ? 'dark' : ''}`}>
            {renderHero()}

            {/* Error message ONLY for submission failures */}
            {/* This error will only show if optimizing is false (submission attempt finished) AND an error exists */}
            {error && !optimizing && !loading && (
                <div className={`error-alert slide-in ${isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-800'}`}>
                    <div className="error-content"><X size={20} /><span>{error}</span></div>
                </div>
            )}

            {/* Form always renders as resumeData is now guaranteed to be an object (either fetched or blank) */}
            <form onSubmit={handleSubmit} className="optimizer-form">
                {/* Personal Information */}
                <Section title="Personal Information" icon={<User size={20} />} isExpanded={expandedSections.personal} onToggle={() => toggleSection('personal')} required>
                    <div className="form-grid">
                        <InputField label="Full Name" value={resumeData.name} onChange={e => handleInputChange(e, 'name')} required icon={<User size={16} />} />
                        <InputField label="Email Address" type="email" value={resumeData.email} onChange={e => handleInputChange(e, 'email')} required icon={<Mail size={16} />} />
                        <InputField label="Phone Number" type="tel" value={resumeData.phone} onChange={e => handleInputChange(e, 'phone')} required icon={<Phone size={16} />} />
                        <InputField label="LinkedIn Profile" value={resumeData.linkedin || ''} onChange={e => handleInputChange(e, 'linkedin')} icon={<Linkedin size={16} />} />
                        <InputField label="GitHub Profile" value={resumeData.github || ''} onChange={e => handleInputChange(e, 'github')} icon={<Github size={16} />} />
                        <InputField label="Portfolio Website" value={resumeData.portfolio || ''} onChange={e => handleInputChange(e, 'portfolio')} icon={<Globe size={16} />} />
                        <InputField label="Target Profession" value={resumeData.target_profession} onChange={e => handleInputChange(e, 'target_profession')} required placeholder="e.g., Software Engineer" icon={<Target size={16} />} className="col-span-2" />
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
                    onAdd={() => handleAddItem('skills')} // This will now add a new skill category
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
                                {(skillCat.skills || []).map((skill, skillIndex) => (
                                    <div key={skillIndex} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={e => handleSkillChange(e, catIndex, skillIndex)}
                                            className={`input-field flex-grow ${isDark ? 'dark-input' : ''}`}
                                            placeholder={`Skill ${skillIndex + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(catIndex, skillIndex)}
                                            className="remove-button-circle"
                                            aria-label="Remove skill"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAddSkill(catIndex)}
                                className="add-item-button mt-4"
                            >
                                <Plus size={16} /> Add Skill
                            </button>
                        </FormCard>
                    ))}
                    {resumeData.skills.length === 0 && (
                        <EmptyState message="No skill categories added yet. Click 'Add Skill Category' to list your skills." />
                    )}
                </Section>

                {/* Achievements */}
                <Section
                    title="Achievements"
                    icon={<Trophy size={20} />}
                    isExpanded={expandedSections.achievements}
                    onToggle={() => toggleSection('achievements')}
                    onAdd={() => handleAddItem('achievements')}
                    addLabel="Add Achievement"
                >
                    {resumeData.achievements.map((achievement, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('achievements', index)}>
                            <InputField
                                label="Title"
                                value={achievement.title}
                                onChange={e => handleInputChange(e, 'achievements', index, 'title')}
                                required
                            />
                            <div className="input-group">
                                <label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Description</label>
                                <input
                                    type="text"
                                    value={achievement.description || ''}
                                    onChange={e => handleInputChange(e, 'achievements', index, 'description')}
                                    className={`input-field ${isDark ? 'dark-input' : ''}`}
                                    placeholder="e.g., Awarded 'Employee of the Year' for Q4 2023"
                                />
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.achievements.length === 0 && (
                        <EmptyState message="No achievements added yet. Showcase your accomplishments!" />
                    )}
                </Section>

                {/* Coding Profiles (Optional) */}
                <Section
                    title="Coding Profiles"
                    icon={<Code size={20} />}
                    isExpanded={expandedSections.coding}
                    onToggle={() => toggleSection('coding')}
                    onAdd={() => handleAddItem('coding_profiles')}
                    addLabel="Add Profile"
                >
                    {resumeData.coding_profiles.map((profile, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('coding_profiles', index)}>
                            <div className="form-grid">
                                <InputField
                                    label="Platform"
                                    value={profile.platform}
                                    onChange={e => handleInputChange(e, 'coding_profiles', index, 'platform')}
                                    required
                                    placeholder="e.g., LeetCode, HackerRank"
                                />
                                <InputField
                                    label="URL"
                                    type="url"
                                    value={profile.url}
                                    onChange={e => handleInputChange(e, 'coding_profiles', index, 'url')}
                                    required
                                    placeholder="https://leetcode.com/yourprofile"
                                />
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.coding_profiles.length === 0 && (
                        <EmptyState message="No coding profiles added. Add links to your competitive programming or coding challenge profiles." />
                    )}
                </Section>

                <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={optimizing}>
                        {optimizing ? (
                            <>
                                <div className="loading-spinner small"></div>
                                {isEditMode ? 'Updating...' : 'Building & Optimizing...'}
                            </>
                        ) : (
                            <>
                                <Zap size={20} /> {isEditMode ? 'Update Resume' : 'Build & Optimize Resume'}
                            </>
                        )}
                    </button>
                    {isEditMode && (
                        <button type="button" className="download-button" onClick={() => console.log("Download PDF functionality to be implemented")}>
                            <Download size={20} /> Download PDF
                        </button>
                    )}
                </div>

                {optimizationResult && (
                    <div className="optimization-result slide-in">
                        <h3 className="result-title">🚀 Resume {isEditMode ? 'Updated' : 'Created'} Successfully!</h3>
                        <p className="result-message">{optimizationResult.message}</p>
                        {optimizationResult.resumeId && (
                            <p className="result-id">Resume ID: {optimizationResult.resumeId}</p>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ResumeOptimizer;