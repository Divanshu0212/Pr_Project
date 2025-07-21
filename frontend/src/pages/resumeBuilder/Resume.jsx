import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; // Import PropTypes
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, ChevronUp, Plus, X, Download, Zap, Award, User, Mail, Phone, Globe, Github, Linkedin, GraduationCap, Briefcase, Code, Trophy, Target } from 'lucide-react';
import '../../styles/pages/BuildResume.css';


const ResumeOptimizer = () => {
    const { theme, isDark } = useTheme();
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        personal: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
        achievements: false,
        coding: false
    });

    // Define the backend URL (replace if different)
    const BACKEND_URL = 'http://localhost:8000'; // Adjust if your backend runs elsewhere

    // Fetch default data on component mount
    useEffect(() => {
        const fetchDefaultData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${BACKEND_URL}/api/default-resume`);

                // Ensure all expected arrays are initialized to empty arrays if not present
                const data = response.data;
                data.education = data.education || [];
                data.experiences = data.experiences || [];
                data.projects = data.projects || [];
                // For skills, ensure it's an array of objects with 'category' and 'skills' array
                data.skills = data.skills || [];
                if (!Array.isArray(data.skills) || data.skills.some(s => !s.category || !Array.isArray(s.skills))) {
                    data.skills = [{ category: "Programming Languages", skills: [] }, { category: "Frameworks", skills: [] }];
                }
                data.achievements = data.achievements || [];
                data.coding_profiles = data.coding_profiles || [];

                setResumeData(data);
            } catch (err) {
                setError('Failed to load default resume data. Please ensure the backend is running.');
                // Fallback to a minimal but complete structure if fetch fails
                setResumeData({
                    name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "", target_profession: "Software Engineer",
                    education: [],
                    experiences: [],
                    projects: [],
                    skills: [{ category: "Programming Languages", skills: [] }, { category: "Frameworks", skills: [] }], // Default skill categories
                    achievements: [],
                    coding_profiles: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchDefaultData();
    }, []);

    // Section toggle handler
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // --- Helper Functions for Form Handling ---

    const handleInputChange = (e, section, index, field) => {
        const { value } = e.target;
        setResumeData(prevData => {
            const newData = { ...prevData };
            if (index === undefined) { // Top-level field
                newData[section] = value;
            } else { // Field within an array item
                const updatedSection = [...(newData[section] || [])]; // Ensure it's an array
                updatedSection[index] = { ...updatedSection[index], [field]: value };
                newData[section] = updatedSection;
            }
            return newData;
        });
    };

    const handleTextAreaChange = (e, section, index, subIndex, field) => {
        const { value } = e.target;
        setResumeData(prevData => {
            const newData = { ...prevData };
            const updatedSection = [...(newData[section] || [])]; // Ensure it's an array
            const updatedItem = { ...updatedSection[index] };
            const updatedDescription = [...(updatedItem[field] || [])]; // Ensure field is an array (e.g., 'description' for bullets)
            updatedDescription[subIndex] = value;
            updatedItem[field] = updatedDescription;
            updatedSection[index] = updatedItem;
            newData[section] = updatedSection;
            return newData;
        });
    };

    const handleSkillChange = (e, categoryIndex, skillIndex) => {
        const { value } = e.target;
        setResumeData(prevData => {
            const newData = { ...prevData };
            const updatedSkills = [...(newData.skills || [])]; // Ensure it's an array
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            const updatedSkillList = [...(updatedCategory.skills || [])]; // Ensure skills list is an array
            updatedSkillList[skillIndex] = value;
            updatedCategory.skills = updatedSkillList;
            updatedSkills[categoryIndex] = updatedCategory;
            newData.skills = updatedSkills;
            return newData;
        });
    };

    const handleAddItem = (section) => {
        setResumeData(prevData => {
            const newData = { ...prevData };
            const newItem = getNewItemTemplate(section);
            newData[section] = [...(newData[section] || []), newItem]; // Ensure section exists
            return newData;
        });
    };

    const handleRemoveItem = (section, index) => {
        setResumeData(prevData => {
            const newData = { ...prevData };
            const updatedSection = [...(newData[section] || [])]; // Ensure it's an array
            updatedSection.splice(index, 1);
            newData[section] = updatedSection;
            return newData;
        });
    };

    const handleAddBulletPoint = (section, index, field = 'description') => {
        setResumeData(prevData => {
            const newData = { ...prevData };
            const updatedSection = [...(newData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            updatedItem[field] = [...(updatedItem[field] || []), ""]; // Add empty string for new bullet, ensure field is array
            updatedSection[index] = updatedItem;
            newData[section] = updatedSection;
            return newData;
        });
    };

    const handleRemoveBulletPoint = (section, index, subIndex, field = 'description') => {
        setResumeData(prevData => {
            const newData = { ...prevData };
            const updatedSection = [...(newData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            const updatedList = [...(updatedItem[field] || [])];
            updatedList.splice(subIndex, 1);
            updatedItem[field] = updatedList;
            updatedSection[index] = updatedItem;
            newData[section] = updatedSection;
            return newData;
        });
    };

    const handleAddSkill = (categoryIndex) => {
        setResumeData(prevData => {
            const newData = { ...prevData };
            const updatedSkills = [...(newData.skills || [])];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            updatedCategory.skills = [...(updatedCategory.skills || []), ""]; // Ensure skills is an array
            updatedSkills[categoryIndex] = updatedCategory;
            newData.skills = updatedSkills;
            return newData;
        })
    }

    const handleRemoveSkill = (categoryIndex, skillIndex) => {
        setResumeData(prevData => {
            const newData = { ...prevData };
            const updatedSkills = [...(newData.skills || [])];
            const updatedCategory = { ...updatedSkills[categoryIndex] };
            const updatedSkillList = [...(updatedCategory.skills || [])];
            updatedSkillList.splice(skillIndex, 1);
            updatedCategory.skills = updatedSkillList;
            updatedSkills[categoryIndex] = updatedCategory;
            newData.skills = updatedSkills;
            return newData;
        })
    }

    // --- Template for New Items ---
    const getNewItemTemplate = (section) => {
        switch (section) {
            case 'education':
                return { institution: "", degree: "", field: "", date_range: "", gpa: "" };
            case 'experiences':
                return { company: "", position: "", date_range: "", description: [""] };
            case 'projects':
                return { name: "", description: [""], link: "", technologies: "" }; // Tech as string for input ease
            case 'skills':
                return { category: "", skills: [""] };
            case 'achievements':
                return { title: "", description: "" };
            case 'coding_profiles':
                return { platform: "", url: "" };
            default:
                return {};
        }
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setOptimizing(true);
        setError(null);
        setOptimizationResult(null);

        try {
            // Basic validation example (expand as needed)
            if (!resumeData.name || !resumeData.email || !resumeData.phone || !resumeData.target_profession) {
                throw new Error("Please fill in all required fields (Name, Email, Phone, Target Profession).");
            }

            // Clean up data before sending (e.g., parse technologies string)
            const dataToSend = {
                ...resumeData,
                projects: resumeData.projects.map(p => ({
                    ...p,
                    // Split technologies string into array, trim whitespace
                    technologies: typeof p.technologies === 'string'
                        ? p.technologies.split(',').map(t => t.trim()).filter(t => t)
                        : (p.technologies || []) // Keep as is if already array or null/undefined
                }))
            };

            const response = await axios.post(`${BACKEND_URL}/api/optimize-resume`, dataToSend);
            setOptimizationResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to optimize resume.');
        } finally {
            setOptimizing(false);
        }
    };

    // --- Render Loading/Error/Form ---
    if (loading) {
        return (
            <div className="resume-optimizer-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading resume data...</p>
                </div>
            </div>
        );
    }

    // Render form only when resumeData is available
    if (!resumeData) {
        return (
            <div className="resume-optimizer-container">
                <div className="error-state">
                    <p>{error || 'Could not load resume data.'}</p>
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
                        <span className="gradient-text">ATS Resume Optimizer</span>
                    </h1>
                    <p className="hero-subtitle">
                        Transform your resume with AI-powered optimization for better ATS compatibility
                    </p>
                </div>
            </div>

            {error && (
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
                    {/* Ensure resumeData.education is an array before mapping */}
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
                    {/* Ensure resumeData.experiences is an array before mapping */}
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
                                items={exp.description || []} // Ensure items is an array
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
                    {/* Ensure resumeData.projects is an array before mapping */}
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
                                items={proj.description || []} // Ensure items is an array
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
                    {/* Ensure resumeData.skills is an array before mapping */}
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
                    {/* Ensure resumeData.achievements is an array before mapping */}
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
                    {/* Ensure resumeData.coding_profiles is an array before mapping */}
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
                    <button
                        type="submit"
                        disabled={optimizing || loading}
                        className="submit-btn"
                    >
                        {optimizing ? (
                            <>
                                <div className="loading-spinner small"></div>
                                <span>Optimizing Resume...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={20} />
                                <span>Optimize Resume & Generate PDF</span>
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
            <button type="button" onClick={onAdd} className="add-bullet-btn">
                <Plus size={16} />
                <span>Add Point</span>
            </button>
        </div>
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