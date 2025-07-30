import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, ChevronUp, Plus, X, Download, Zap, Award, User, Mail, Phone, Globe, Github, Linkedin, GraduationCap, Briefcase, Code, Trophy, Target, Upload } from 'lucide-react';
import '../../styles/pages/BuildResume.css';
import SummaryApi from '../../config';

// Sample data from the Python file
const SAMPLE_RESUME_DATA = {
    personal_info: {
        name: "Divanshu Bhargava",
        email: "divanshubhargava026@gmail.com",
        phone: "+91-9359992426",
        location: "Jabalpur, India",
        github: "https://github.com/divanshu0212",
        linkedin: "linkedin.com/in/divanshu-bhargava"
    },
    professional_summary: "Passionate Full Stack Developer and Computer Science student with expertise in MERN stack development, AI/ML integration, and scalable web applications. Proven track record of building healthcare platforms, professional networking solutions, and AI-powered applications serving thousands of users. Strong background in competitive programming with 375+ problems solved across multiple platforms.",
    work_experience: [
        {
            company: "Self-Employed (Freelance)",
            position: "Full Stack Developer",
            start_date: "01/2024",
            end_date: "Present",
            location: "Remote",
            responsibilities: [
                "Developed full-stack web applications using MERN stack with modern frameworks",
                "Collaborated with multiple clients to deliver custom software solutions",
                "Implemented AI-powered features using machine learning models",
                "Built scalable applications with JWT authentication and high uptime requirements",
                "Managed project timelines and client communication for multiple concurrent projects"
            ],
            achievements: [
                "Developed 3+ full-stack web applications serving 500+ users, resulting in 40% improvement in client engagement and 25% increase in conversion rates",
                "Built scalable MERN stack applications with JWT authentication supporting 2,000+ concurrent users and 99.9% uptime",
                "Implemented AI-powered features using machine learning models, achieving 92% accuracy in prediction tasks and reducing processing time by 60%",
                "Collaborated with 5+ clients to deliver custom solutions within tight deadlines, maintaining 100% client satisfaction rate"
            ]
        }
    ],
    education: [
        {
            institution: "Indian Institute Of Information Technology Jabalpur",
            degree: "Bachelor of Technology",
            field_of_study: "Computer Science and Engineering",
            graduation_date: "05/2027",
            gpa: "8.1",
            relevant_coursework: ["Data Structures & Algorithms", "Database Management Systems", "Operating Systems", "Computer Networks", "Machine Learning"]
        },
        {
            institution: "KRSD Public School",
            degree: "CBSE Class XII",
            field_of_study: "Science",
            graduation_date: "06/2022",
            gpa: "94.2%",
            relevant_coursework: ["Physics", "Chemistry", "Mathematics", "Computer Science"]
        },
        {
            institution: "Rajiv International School",
            degree: "CBSE Class X",
            field_of_study: "General",
            graduation_date: "05/2020",
            gpa: "93.6%",
            relevant_coursework: []
        }
    ],
    skills: {
        "Programming Languages": ["Python", "JavaScript", "TypeScript", "C++", "Java", "SQL", "HTML5", "CSS3"],
        "Frontend Technologies": ["React.js", "Next.js", "Redux", "Vue.js", "Tailwind CSS", "Bootstrap"],
        "Backend Technologies": ["Node.js", "Express.js", "Django", "Django REST Framework"],
        "Databases": ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
        "Tools & DevOps": ["Git", "Docker", "AWS", "Linux", "RESTful APIs", "JWT", "Postman"],
        "Machine Learning": ["Scikit-learn", "NumPy", "Pandas", "Matplotlib", "TensorFlow", "BERT", "VisionTransformer"],
        "Core Concepts": ["Data Structures & Algorithms", "Object-Oriented Programming", "Database Management", "Operating Systems"]
    },
    projects: [
        {
            name: "BigDocs - Healthcare Management System",
            description: "Comprehensive healthcare platform with telemedicine, appointment scheduling, and AI-powered disease prediction across 7 core modules",
            technologies: ["MERN Stack", "Machine Learning", "BERT", "AI/ML", "Healthcare APIs"],
            achievements: [
                "Architected platform serving 1,000+ users with comprehensive healthcare functionalities",
                "Developed custom BERT-based ML model achieving 92% accuracy in disease prediction across 100+ conditions, reducing diagnosis time from 30 minutes to 3 seconds",
                "Implemented real-time appointment system supporting 50+ concurrent bookings, decreasing scheduling time by 75% and improving patient satisfaction by 60%",
                "Built secure telemedicine infrastructure with HD video quality and integrated prescription management processing 1,000+ daily medical records"
            ],
            url: "https://github.com/divanshu0212/bigdocs"
        },
        {
            name: "InternFlow - Professional Networking Platform",
            description: "Career platform combining LinkedIn and job portal functionalities with intelligent matching algorithms",
            technologies: ["MERN Stack", "JWT", "Natural Language Processing", "Machine Learning"],
            achievements: [
                "Engineered platform connecting 10,000+ students with 500+ companies through intelligent matching algorithms",
                "Built advanced skill-based filtering system processing 25+ resume parameters against 1,000+ job postings, achieving 94% accuracy in candidate-role matching",
                "Developed automated resume parsing system generating 70+ detailed candidate profiles weekly, reducing recruiter screening time by 65%",
                "Created comprehensive company dashboard managing 200+ job postings and 150+ internship opportunities with real-time analytics tracking 12 key performance metrics"
            ],
            url: "https://github.com/divanshu0212/internflow"
        },
        {
            name: "Plant Z - AI Plant Healthcare Platform",
            description: "Full-stack plant healthcare platform with AI-powered disease detection and personalized care recommendations",
            technologies: ["MERN Stack", "Gemini API", "VisionTransformer", "AI/ML", "Computer Vision"],
            achievements: [
                "Developed platform achieving 86% accuracy in plant disease detection through VisionTransformer ML model",
                "Implemented personalized plant care system with multilingual support and automated scheduling, reducing user plant mortality rate by 45%",
                "Built community platform with AI content moderation serving 500+ plant enthusiasts, facilitating knowledge sharing and peer-to-peer learning"
            ],
            url: "https://github.com/divanshu0212/plantz"
        }
    ],
    certifications: [
        "HackByte 3.0 Winner - Top 8 position among 120 elite teams",
        "JEE Main 2023 - 98.83 percentile (AIR 13,679)"
    ],
    languages: ["English", "Hindi"],
    target_job_description: `We are seeking a talented Full Stack Developer to join our growing team.

Requirements:
- Bachelor's degree in Computer Science or related field
- 2+ years of experience in full-stack web development
- Proficiency in JavaScript, React.js, Node.js, and Express.js
- Experience with MongoDB, PostgreSQL, or other databases
- Knowledge of RESTful APIs and JWT authentication
- Experience with AI/ML integration is a plus
- Strong problem-solving skills and competitive programming background
- Experience with healthcare or fintech applications preferred
- Knowledge of Docker, AWS, and cloud deployment
- Excellent communication and teamwork skills

Responsibilities:
- Develop and maintain full-stack web applications
- Collaborate with cross-functional teams to deliver high-quality software
- Implement AI-powered features and machine learning models
- Optimize application performance and scalability
- Participate in code reviews and maintain code quality standards
- Work on healthcare technology solutions
- Mentor junior developers and contribute to technical documentation`
};

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
    onAdd: PropTypes.func,
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

    // Updated data structure to use sample data as default
    const [resumeData, setResumeData] = useState(() => {
        if (resumeId) {
            return null; // Will be fetched in useEffect
        } else {
            // Use sample data as default instead of empty data
            return SAMPLE_RESUME_DATA;
        }
    });

    const [loading, setLoading] = useState(!!resumeId);
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        personal: true, summary: true, education: true, experience: true,
        projects: true, skills: true, certifications: false, additional: false
    });
    const [manualUploadBlob, setManualUploadBlob] = useState(null);
    const [manualUploadResumeId, setManualUploadResumeId] = useState(null);
    const [manualUploadError, setManualUploadError] = useState(null);

    useEffect(() => {
        const fetchResumeData = async () => {
            if (resumeId) {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(SummaryApi.resumes.single.url(resumeId), { withCredentials: true });
                    let fetchedData = response.data.resume;

                    // Convert old format to new format if needed
                    if (!fetchedData.personal_info && fetchedData.name) {
                        fetchedData = {
                            personal_info: {
                                name: fetchedData.name || "",
                                email: fetchedData.email || "",
                                phone: fetchedData.phone || "",
                                location: fetchedData.location || "",
                                linkedin: fetchedData.linkedin || "",
                                github: fetchedData.github || ""
                            },
                            professional_summary: fetchedData.professional_summary || "",
                            work_experience: fetchedData.experiences || [],
                            education: fetchedData.education || [],
                            skills: fetchedData.skills || {},
                            projects: fetchedData.projects || [],
                            certifications: fetchedData.certifications || [],
                            languages: fetchedData.languages || [],
                            target_job_description: fetchedData.target_profession || ""
                        };
                    }

                    setResumeData(fetchedData);
                } catch (err) {
                    console.error('ResumeOptimizer: Fetch error:', err);
                    setError(`Failed to load resume. ${err.response?.data?.message || 'Please try again.'}`);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchResumeData();
    }, [resumeId]);

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

            if (section === 'personal_info') {
                newData.personal_info = { ...newData.personal_info, [field]: value };
            } else if (section === 'professional_summary') {
                newData.professional_summary = value;
            } else if (section === 'target_job_description') {
                newData.target_job_description = value;
            } else if (section === 'certifications' && typeof value === 'string') {
                newData.certifications = value.split('\n').filter(c => c.trim());
            } else if (section === 'languages' && typeof value === 'string') {
                newData.languages = value.split(',').map(l => l.trim()).filter(l => l);
            } else if (index !== undefined && field) {
                const updatedSection = [...(newData[section] || [])];
                if (updatedSection[index]) {
                    updatedSection[index] = {
                        ...updatedSection[index],
                        [field]: value
                    };
                }
                newData[section] = updatedSection;
            } else if (section === 'skills' && field === 'category' && index !== undefined) {
                // Handle skill category changes
                const categories = Object.keys(newData.skills || {});
                const oldCategory = categories[index];
                const newSkills = { ...newData.skills };
                if (oldCategory && oldCategory !== value) {
                    newSkills[value] = newSkills[oldCategory];
                    delete newSkills[oldCategory];
                }
                newData.skills = newSkills;
            }

            return newData;
        });
    };

    const handleArrayItemChange = (section, index, subIndex, field, value) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const newData = { ...prevData };
            const updatedSection = [...(newData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            const updatedArray = [...(updatedItem[field] || [])];
            updatedArray[subIndex] = value;
            updatedItem[field] = updatedArray;
            updatedSection[index] = updatedItem;
            newData[section] = updatedSection;
            return newData;
        });
    };

    const handleSkillChange = (category, skillIndex, value) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const newData = { ...prevData };
            const updatedSkills = { ...newData.skills };
            if (!updatedSkills[category]) updatedSkills[category] = [];
            const updatedCategorySkills = [...updatedSkills[category]];
            updatedCategorySkills[skillIndex] = value;
            updatedSkills[category] = updatedCategorySkills;
            newData.skills = updatedSkills;
            return newData;
        });
    };

    const getNewItemTemplate = (section) => {
        switch (section) {
            case 'education':
                return {
                    institution: '', degree: '', field_of_study: '',
                    graduation_date: '', gpa: '', relevant_coursework: []
                };
            case 'work_experience':
                return {
                    company: '', position: '', start_date: '', end_date: '',
                    location: '', responsibilities: [], achievements: []
                };
            case 'projects':
                return {
                    name: '', description: '', technologies: [],
                    achievements: [], url: ''
                };
            default:
                return {};
        }
    };

    const handleAddItem = (section) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            if (section === 'skills') {
                const newSkills = { ...prevData.skills };
                const newCategory = `New Category ${Object.keys(newSkills).length + 1}`;
                newSkills[newCategory] = [''];
                return { ...prevData, skills: newSkills };
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

    const handleAddArrayItem = (section, index, field) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSection = [...(prevData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            const updatedArray = [...(updatedItem[field] || []), ''];
            updatedItem[field] = updatedArray;
            updatedSection[index] = updatedItem;
            return { ...prevData, [section]: updatedSection };
        });
    };

    const handleRemoveArrayItem = (section, index, subIndex, field) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSection = [...(prevData[section] || [])];
            const updatedItem = { ...updatedSection[index] };
            const updatedArray = (updatedItem[field] || []).filter((_, i) => i !== subIndex);
            updatedItem[field] = updatedArray;
            updatedSection[index] = updatedItem;
            return { ...prevData, [section]: updatedSection };
        });
    };

    const handleAddSkill = (category) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSkills = { ...prevData.skills };
            if (!updatedSkills[category]) updatedSkills[category] = [];
            updatedSkills[category] = [...updatedSkills[category], ''];
            return { ...prevData, skills: updatedSkills };
        });
    };

    const handleRemoveSkill = (category, skillIndex) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSkills = { ...prevData.skills };
            updatedSkills[category] = (updatedSkills[category] || []).filter((_, i) => i !== skillIndex);
            if (updatedSkills[category].length === 0) {
                delete updatedSkills[category];
            }
            return { ...prevData, skills: updatedSkills };
        });
    };

    const handleAddSkillCategory = () => {
        const categoryName = prompt('Enter category name:');
        if (categoryName && categoryName.trim()) {
            setResumeData(prevData => {
                if (!prevData) return prevData;
                const updatedSkills = { ...prevData.skills };
                updatedSkills[categoryName.trim()] = [''];
                return { ...prevData, skills: updatedSkills };
            });
        }
    };

    const handleRemoveSkillCategory = (category) => {
        setResumeData(prevData => {
            if (!prevData) return prevData;
            const updatedSkills = { ...prevData.skills };
            delete updatedSkills[category];
            return { ...prevData, skills: updatedSkills };
        });
    };

    // Helper to upload PDF to Node backend (which uploads to Cloudinary)
    // Updated uploadPdfToCloudinary function
    const uploadPdfToCloudinary = async (file, resumeId) => {
        try {
            const formData = new FormData();
            // Must match exactly with Multer's field name
            formData.append('resume', file);

            if (resumeId) {
                formData.append('resumeId', resumeId);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to upload resumes');
            }

            const response = await fetch('http://localhost:5000/api/resumes/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Let browser set Content-Type automatically
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    // Manual upload handler for Cloudinary PDF upload
    const handleManualUpload = async () => {
        setManualUploadError(null);
        try {
            if (!manualUploadBlob || !manualUploadResumeId) throw new Error('No PDF to upload.');
            await uploadPdfToCloudinary(manualUploadBlob, manualUploadResumeId);
            setManualUploadBlob(null);
            setManualUploadResumeId(null);
            alert('Resume uploaded to Cloudinary successfully!');
        } catch (err) {
            setManualUploadError('Manual upload failed: ' + err.message);
        }
    };

    // Updated handleUserFileManualUpload
    const handleUserFileManualUpload = async (event) => {
        setManualUploadError(null);
        const file = event.target.files[0];

        if (!file) {
            setManualUploadError('No file selected');
            return;
        }

        // Validate file type
        const validTypes = ['application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            setManualUploadError('Only PDF, DOC, and DOCX files are allowed');
            return;
        }

        try {
            // Optional: Get resume ID or generate one
            const resumeId = prompt('Enter resume identifier (or leave blank):') ||
                `resume_${Date.now()}`;

            const result = await uploadPdfToCloudinary(file, resumeId);
            alert(`Resume uploaded successfully! URL: ${result.url}`);

            // Reset file input
            event.target.value = '';
        } catch (error) {
            setManualUploadError(error.message);
            if (error.message.includes('401')) {
                // Handle expired token
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    // Form Submission - Updated to match HTML backend format
    const handleSubmit = async (e) => {
        e.preventDefault();
        setOptimizing(true);
        setError(null);
        setOptimizationResult(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to upload resumes');
                return;
            }
            if (!resumeData.personal_info.name || !resumeData.personal_info.email) {
                throw new Error("Please fill in all required fields (Name and Email).");
            }

            // Format data exactly like HTML version
            const requestData = {
                resume_data: resumeData,
                job_description: resumeData.target_job_description,
                resume_format: "professional"
            };

            let response;
            if (isEditMode && resumeId) {
                // Update existing resume
                response = await axios({
                    method: 'PUT',
                    url: `${SummaryApi.resumes.update.url(resumeId)}`,
                    data: requestData,
                    withCredentials: true
                });
            } else {
                // Create new resume using HTML backend endpoint
                response = await fetch('http://0.0.0.0:8000/api/generate-resume', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    let errorMessage = 'Failed to create resume. ';
                    if (response.status === 422) {
                        errorMessage += 'Validation error.';
                    } else if (response.status === 500) {
                        errorMessage += 'Server error.';
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                setOptimizationResult(data);

                // --- Cloudinary upload logic ---
                if (data && data.resume_id && data.pdf_available) {
                    const pdfResponse = await fetch(`http://0.0.0.0:8000/api/resume/${data.resume_id}/pdf`);
                    if (!pdfResponse.ok) throw new Error('Failed to fetch PDF from backend');
                    const pdfBlob = await pdfResponse.blob();
                    try {
                        await uploadPdfToCloudinary(pdfBlob, data.resume_id);
                    } catch (err) {
                        setManualUploadBlob(pdfBlob);
                        setManualUploadResumeId(data.resume_id);
                        setManualUploadError('Resume optimized, but failed to upload to Cloudinary. You can try manual upload below.');
                    }
                }

                // Show success message (do not navigate away)
                return;
            }

            setOptimizationResult(response.data);
            // Do not navigate away after update

        } catch (err) {
            console.error('ResumeOptimizer: Operation error:', err);
            let errorMessage = isEditMode
                ? 'Failed to update resume. '
                : 'Failed to create resume. ';

            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                errorMessage += 'Network error, please ensure the backend is running and reachable.';
            } else if (err.response) {
                errorMessage += err.response.data?.message || err.response.statusText;
            } else {
                errorMessage += err.message;
            }
            setError(errorMessage);
        } finally {
            setOptimizing(false);
        }
    };

    const downloadPDF = () => {
        if (optimizationResult && optimizationResult.resume_id) {
            window.open(`http://0.0.0.0:8000/api/resume/${optimizationResult.resume_id}/pdf`, '_blank');
        } else {
            alert('No resume generated yet');
        }
    };

    // Render functions
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
                <p className="hero-note">
                    📝 Sample data has been prefilled to help you get started. Feel free to modify or replace with your own information.
                </p>
            </div>
        </div>
    );

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

    return (
        <div className={`resume-optimizer-container ${isDark ? 'dark' : ''}`}>
            {renderHero()}

            {error && !optimizing && !loading && (
                <div className={`error-alert slide-in ${isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-800'}`}>
                    <div className="error-content"><X size={20} /><span>{error}</span></div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="optimizer-form">
                {/* Personal Information */}
                <Section title="Personal Information" icon={<User size={20} />} isExpanded={expandedSections.personal} onToggle={() => toggleSection('personal')} required>
                    <div className="form-grid">
                        <InputField
                            label="Full Name"
                            value={resumeData.personal_info.name}
                            onChange={e => handleInputChange(e, 'personal_info', null, 'name')}
                            required
                            icon={<User size={16} />}
                        />
                        <InputField
                            label="Email Address"
                            type="email"
                            value={resumeData.personal_info.email}
                            onChange={e => handleInputChange(e, 'personal_info', null, 'email')}
                            required
                            icon={<Mail size={16} />}
                        />
                        <InputField
                            label="Phone Number"
                            type="tel"
                            value={resumeData.personal_info.phone}
                            onChange={e => handleInputChange(e, 'personal_info', null, 'phone')}
                            icon={<Phone size={16} />}
                        />
                        <InputField
                            label="Location"
                            value={resumeData.personal_info.location}
                            onChange={e => handleInputChange(e, 'personal_info', null, 'location')}
                            icon={<Globe size={16} />}
                        />
                        <InputField
                            label="LinkedIn Profile"
                            value={resumeData.personal_info.linkedin}
                            onChange={e => handleInputChange(e, 'personal_info', null, 'linkedin')}
                            icon={<Linkedin size={16} />}
                        />
                        <InputField
                            label="GitHub Profile"
                            value={resumeData.personal_info.github}
                            onChange={e => handleInputChange(e, 'personal_info', null, 'github')}
                            icon={<Github size={16} />}
                        />
                    </div>
                </Section>

                {/* Professional Summary */}
                <Section title="Professional Summary" icon={<User size={20} />} isExpanded={expandedSections.summary} onToggle={() => toggleSection('summary')}>
                    <div className="input-wrapper">
                        <label className="form-label">Professional Summary</label>
                        <textarea
                            value={resumeData.professional_summary}
                            onChange={e => handleInputChange(e, 'professional_summary')}
                            className={`form-input ${isDark ? 'dark-input' : ''}`}
                            rows="4"
                            placeholder="Briefly describe your professional background and key skills (3-4 sentences)"
                        />
                    </div>
                </Section>

                {/* Work Experience */}
                <Section
                    title="Work Experience"
                    icon={<Briefcase size={20} />}
                    isExpanded={expandedSections.experience}
                    onToggle={() => toggleSection('experience')}
                    onAdd={() => handleAddItem('work_experience')}
                    addLabel="Add Experience"
                >
                    {resumeData.work_experience.map((exp, index) => (
                        <FormCard key={index} onRemove={() => handleRemoveItem('work_experience', index)}>
                            <div className="form-grid mb-4">
                                <InputField
                                    label="Company"
                                    value={exp.company}
                                    onChange={e => handleInputChange(e, 'work_experience', index, 'company')}
                                    required
                                />
                                <InputField
                                    label="Position"
                                    value={exp.position}
                                    onChange={e => handleInputChange(e, 'work_experience', index, 'position')}
                                    required
                                />
                                <InputField
                                    label="Start Date"
                                    value={exp.start_date}
                                    onChange={e => handleInputChange(e, 'work_experience', index, 'start_date')}
                                    placeholder="MM/YYYY"
                                    required
                                />
                                <InputField
                                    label="End Date"
                                    value={exp.end_date}
                                    onChange={e => handleInputChange(e, 'work_experience', index, 'end_date')}
                                    placeholder="MM/YYYY or Present"
                                />
                                <InputField
                                    label="Location"
                                    value={exp.location || ''}
                                    onChange={e => handleInputChange(e, 'work_experience', index, 'location')}
                                    className="col-span-2"
                                />
                            </div>

                            {/* Responsibilities */}
                            <div className="mb-4">
                                <label className="form-label">Responsibilities</label>
                                {(exp.responsibilities || []).map((resp, respIndex) => (
                                    <div key={respIndex} className="flex items-center mb-2">
                                        <span className="me-2">•</span>
                                        <input
                                            type="text"
                                            value={resp}
                                            onChange={e => handleArrayItemChange('work_experience', index, respIndex, 'responsibilities', e.target.value)}
                                            className={`form-input flex-grow ${isDark ? 'dark-input' : ''}`}
                                            placeholder="Describe your responsibility"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveArrayItem('work_experience', index, respIndex, 'responsibilities')}
                                            className="remove-button-circle ml-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddArrayItem('work_experience', index, 'responsibilities')}
                                    className="add-item-button"
                                >
                                    <Plus size={16} /> Add Responsibility
                                </button>
                            </div>

                            {/* Achievements */}
                            <div>
                                <label className="form-label">Achievements</label>
                                {(exp.achievements || []).map((ach, achIndex) => (
                                    <div key={achIndex} className="flex items-center mb-2">
                                        <span className="me-2">•</span>
                                        <input
                                            type="text"
                                            value={ach}
                                            onChange={e => handleArrayItemChange('work_experience', index, achIndex, 'achievements', e.target.value)}
                                            className={`form-input flex-grow ${isDark ? 'dark-input' : ''}`}
                                            placeholder="Describe your achievement (quantify when possible)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveArrayItem('work_experience', index, achIndex, 'achievements')}
                                            className="remove-button-circle ml-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddArrayItem('work_experience', index, 'achievements')}
                                    className="add-item-button"
                                >
                                    <Plus size={16} /> Add Achievement
                                </button>
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.work_experience.length === 0 && (
                        <EmptyState message="No experience added yet. Click 'Add Experience' to get started." />
                    )}
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
                            <div className="form-grid mb-4">
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
                                    placeholder="e.g., Bachelor of Science"
                                />
                                <InputField
                                    label="Field of Study"
                                    value={edu.field_of_study}
                                    onChange={e => handleInputChange(e, 'education', index, 'field_of_study')}
                                    required
                                    placeholder="e.g., Computer Science"
                                />
                                <InputField
                                    label="Graduation Date"
                                    value={edu.graduation_date}
                                    onChange={e => handleInputChange(e, 'education', index, 'graduation_date')}
                                    required
                                    placeholder="MM/YYYY"
                                />
                                <InputField
                                    label="GPA (optional)"
                                    value={edu.gpa || ''}
                                    onChange={e => handleInputChange(e, 'education', index, 'gpa')}
                                    placeholder="e.g., 3.8"
                                />
                            </div>

                            {/* Relevant Coursework */}
                            <div>
                                <label className="form-label">Relevant Coursework (optional)</label>
                                {(edu.relevant_coursework || []).map((course, courseIndex) => (
                                    <div key={courseIndex} className="flex items-center mb-2">
                                        <span className="me-2">•</span>
                                        <input
                                            type="text"
                                            value={course}
                                            onChange={e => handleArrayItemChange('education', index, courseIndex, 'relevant_coursework', e.target.value)}
                                            className={`form-input flex-grow ${isDark ? 'dark-input' : ''}`}
                                            placeholder="Course name"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveArrayItem('education', index, courseIndex, 'relevant_coursework')}
                                            className="remove-button-circle ml-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddArrayItem('education', index, 'relevant_coursework')}
                                    className="add-item-button"
                                >
                                    <Plus size={16} /> Add Course
                                </button>
                            </div>
                        </FormCard>
                    ))}
                    {resumeData.education.length === 0 && (
                        <EmptyState message="No education added yet. Click 'Add Education' to get started." />
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
                                    label="Project URL (optional)"
                                    type="url"
                                    value={proj.url || ''}
                                    onChange={e => handleInputChange(e, 'projects', index, 'url')}
                                    icon={<Globe size={16} />}
                                />
                                <div className="col-span-2">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        value={proj.description}
                                        onChange={e => handleInputChange(e, 'projects', index, 'description')}
                                        className={`form-input ${isDark ? 'dark-input' : ''}`}
                                        rows="2"
                                        required
                                        placeholder="Describe your project"
                                    />
                                </div>
                            </div>

                            {/* Technologies */}
                            <div className="mb-4">
                                <label className="form-label">Technologies Used</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(proj.technologies || []).map((tech, techIndex) => (
                                        <span key={techIndex} className="tech-tag">
                                            {tech}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveArrayItem('projects', index, techIndex, 'technologies')}
                                                className="ml-1 text-red-500"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g., Python, React, AWS"
                                        className={`form-input flex-grow ${isDark ? 'dark-input' : ''}`}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const value = e.target.value.trim();
                                                if (value) {
                                                    const techs = value.split(',').map(t => t.trim()).filter(t => t);
                                                    techs.forEach(tech => {
                                                        handleAddArrayItem('projects', index, 'technologies');
                                                        // Set the value for the new item
                                                        const currentTechs = resumeData.projects[index].technologies || [];
                                                        handleArrayItemChange('projects', index, currentTechs.length, 'technologies', tech);
                                                    });
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            const input = e.target.parentElement.querySelector('input');
                                            const value = input.value.trim();
                                            if (value) {
                                                const techs = value.split(',').map(t => t.trim()).filter(t => t);
                                                setResumeData(prevData => {
                                                    const newData = { ...prevData };
                                                    const updatedProjects = [...newData.projects];
                                                    const updatedProject = { ...updatedProjects[index] };
                                                    updatedProject.technologies = [...(updatedProject.technologies || []), ...techs];
                                                    updatedProjects[index] = updatedProject;
                                                    newData.projects = updatedProjects;
                                                    return newData;
                                                });
                                                input.value = '';
                                            }
                                        }}
                                        className="add-button"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Project Achievements */}
                            <div>
                                <label className="form-label">Achievements (quantify when possible)</label>
                                {(proj.achievements || []).map((ach, achIndex) => (
                                    <div key={achIndex} className="flex items-center mb-2">
                                        <span className="me-2">•</span>
                                        <input
                                            type="text"
                                            value={ach}
                                            onChange={e => handleArrayItemChange('projects', index, achIndex, 'achievements', e.target.value)}
                                            className={`form-input flex-grow ${isDark ? 'dark-input' : ''}`}
                                            placeholder="Describe project achievement"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveArrayItem('projects', index, achIndex, 'achievements')}
                                            className="remove-button-circle ml-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddArrayItem('projects', index, 'achievements')}
                                    className="add-item-button"
                                >
                                    <Plus size={16} /> Add Achievement
                                </button>
                            </div>
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
                    onAdd={handleAddSkillCategory}
                    addLabel="Add Skill Category"
                >
                    {Object.keys(resumeData.skills || {}).map((category, catIndex) => (
                        <FormCard key={category} onRemove={() => handleRemoveSkillCategory(category)}>
                            <InputField
                                label="Skill Category"
                                value={category}
                                onChange={e => {
                                    const newCategory = e.target.value;
                                    if (newCategory !== category) {
                                        setResumeData(prevData => {
                                            const newSkills = { ...prevData.skills };
                                            newSkills[newCategory] = newSkills[category];
                                            delete newSkills[category];
                                            return { ...prevData, skills: newSkills };
                                        });
                                    }
                                }}
                                required
                                className="mb-4"
                                placeholder="e.g., Programming Languages, Frameworks"
                            />
                            <div className="skills-grid">
                                {(resumeData.skills[category] || []).map((skill, skillIndex) => (
                                    <div key={skillIndex} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={e => handleSkillChange(category, skillIndex, e.target.value)}
                                            className={`input-field flex-grow ${isDark ? 'dark-input' : ''}`}
                                            placeholder={`Skill ${skillIndex + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(category, skillIndex)}
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
                                onClick={() => handleAddSkill(category)}
                                className="add-item-button mt-4"
                            >
                                <Plus size={16} /> Add Skill
                            </button>
                        </FormCard>
                    ))}
                    {Object.keys(resumeData.skills || {}).length === 0 && (
                        <EmptyState message="No skill categories added yet. Click 'Add Skill Category' to list your skills." />
                    )}
                </Section>

                {/* Certifications */}
                <Section
                    title="Certifications"
                    icon={<Trophy size={20} />}
                    isExpanded={expandedSections.certifications}
                    onToggle={() => toggleSection('certifications')}
                >
                    <div className="input-wrapper">
                        <label className="form-label">Certifications (one per line)</label>
                        <textarea
                            value={resumeData.certifications.join('\n')}
                            onChange={e => handleInputChange(e, 'certifications')}
                            className={`form-input ${isDark ? 'dark-input' : ''}`}
                            rows="3"
                            placeholder="AWS Certified Developer - Associate&#10;Google Analytics Certification"
                        />
                    </div>
                </Section>

                {/* Additional Information */}
                <Section
                    title="Additional Information"
                    icon={<User size={20} />}
                    isExpanded={expandedSections.additional}
                    onToggle={() => toggleSection('additional')}
                >
                    <div className="form-grid">
                        <div className="input-wrapper">
                            <label className="form-label">Languages (comma separated)</label>
                            <input
                                type="text"
                                value={resumeData.languages.join(', ')}
                                onChange={e => handleInputChange(e, 'languages')}
                                className={`form-input ${isDark ? 'dark-input' : ''}`}
                                placeholder="English, Spanish, French"
                            />
                        </div>
                        <div className="input-wrapper col-span-2">
                            <label className="form-label">Target Job Description (optional - paste the job description you're applying for)</label>
                            <textarea
                                value={resumeData.target_job_description}
                                onChange={e => handleInputChange(e, 'target_job_description')}
                                className={`form-input ${isDark ? 'dark-input' : ''}`}
                                rows="15"
                                placeholder="Paste the job description here to optimize your resume specifically for this role"
                            />
                        </div>
                    </div>
                </Section>

                <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={optimizing}>
                        {optimizing ? (
                            <>
                                <div className="loading-spinner small"></div>
                                {isEditMode ? 'Updating...' : 'Optimizing Resume...'}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center space-x-2 gap-3">
                                    <Zap size={20} /> {isEditMode ? 'Update Resume' : 'Optimize My Resume'}
                                </div>
                            </>
                        )}
                    </button>
                    {optimizationResult && (
                        <button type="button" className="download-button" onClick={downloadPDF}>
                            <Download size={20} /> Download PDF
                        </button>
                    )}
                    {manualUploadBlob && manualUploadResumeId && (
                        <button type="button" className="download-button bg-yellow-500 hover:bg-yellow-600 text-white ml-4" onClick={handleManualUpload}>
                            <Upload size={20} /> Manual Upload to Cloudinary
                        </button>
                    )}

                    <label
                        htmlFor="resume-upload"
                        className="download-button rounded-lg p-2 bg-blue-500 hover:bg-blue-600 text-white ml-4 cursor-pointer" style={{ display: 'inline-block' }}
                    >
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleUserFileManualUpload}
                            className="hidden"
                            id="resume-upload"
                        />
                        <div className="flex items-center space-x-2">
                            <Upload size={20} style={{ verticalAlign: 'middle' }} />
                            <span>Upload Resume</span> 
                        </div>
                    </label>
                </div>
                {manualUploadError && (
                    <div className="error-alert slide-in bg-yellow-100 border-yellow-400 text-yellow-800 mt-4">
                        <div className="error-content">
                            <X size={20} />
                            <span>{manualUploadError}</span>
                        </div>
                    </div>
                )}

                {optimizationResult && (
                    <div className="optimization-result slide-in">
                        <h3 className="result-title">🚀 Resume {isEditMode ? 'Updated' : 'Optimized'} Successfully!</h3>
                        {optimizationResult.score && (
                            <div className="score-display">
                                <div className={`score-circle ${optimizationResult.score >= 85 ? 'score-excellent' :
                                    optimizationResult.score >= 70 ? 'score-good' :
                                        optimizationResult.score >= 50 ? 'score-fair' : 'score-poor'
                                    }`}>
                                    {optimizationResult.score}
                                </div>
                                <p className="score-text">
                                    {optimizationResult.score >= 85 ? 'Excellent' :
                                        optimizationResult.score >= 70 ? 'Good' :
                                            optimizationResult.score >= 50 ? 'Fair' : 'Needs Work'}
                                </p>
                            </div>
                        )}
                        {optimizationResult.message && (
                            <p className="result-message">{optimizationResult.message}</p>
                        )}
                        {optimizationResult.resume_id && (
                            <p className="result-id">Resume ID: {optimizationResult.resume_id}</p>
                        )}
                        {optimizationResult.suggestions && optimizationResult.suggestions.length > 0 && (
                            <div className="suggestions-list">
                                <h4>Suggestions:</h4>
                                <ul>
                                    {optimizationResult.suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ResumeOptimizer;