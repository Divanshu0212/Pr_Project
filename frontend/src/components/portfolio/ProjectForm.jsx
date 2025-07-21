import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft, FaSave, FaImage, FaCode, FaTasks, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // Added FaCheckCircle, FaExclamationCircle
import { useTheme } from '../../context/ThemeContext';
import '../../styles/animations.css';

const ProjectForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDark } = useTheme();

  const [project, setProject] = useState({
    title: '',
    description: '',
    link: '',
    technologies: [],
    status: 'planned',
    progress: 0,
    isPinned: false,
    tasks: [{ title: '', completed: false }]
  });
  const [newTech, setNewTech] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(''); // NEW: State for submission messages
  const [showSubmissionStatus, setShowSubmissionStatus] = useState(false); // NEW: State to control status visibility

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (editMode && id) {
      const fetchProject = async () => {
        setLoading(true);
        setError('');
        try {
          // Mock API call - replace with your actual API
          console.log('Fetching project:', id);
          // Simulate loading
          await new Promise(resolve => setTimeout(resolve, 1000));
          // In a real app, you'd set the fetched project data here:
          // setProject(fetchedProjectData);
          // if (fetchedProjectData.imageUrl) {
          //   setPreview(fetchedProjectData.imageUrl);
          // }
        } catch (err) {
          setError('Failed to fetch project details');
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [editMode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !project.technologies.includes(newTech.trim())) {
      setProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTechnology = (tech) => {
    setProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleTaskChange = (index, e) => {
    const newTasks = [...project.tasks];
    newTasks[index][e.target.name] = e.target.value;
    setProject(prev => ({
      ...prev,
      tasks: newTasks
    }));
  };

  const addTask = () => {
    setProject(prev => ({
      ...prev,
      tasks: [...prev.tasks, { title: '', completed: false }]
    }));
  };

  const removeTask = (index) => {
    if (project.tasks.length > 1) {
      const newTasks = [...project.tasks];
      newTasks.splice(index, 1);
      setProject(prev => ({
        ...prev,
        tasks: newTasks
      }));
    }
  };

  const toggleTaskCompleted = (index) => {
    const newTasks = [...project.tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setProject(prev => ({
      ...prev,
      tasks: newTasks
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmissionMessage('Saving project...'); // Initial submission message
    setShowSubmissionStatus(true);

    try {
      // Validate required fields
      if (!project.title || !project.description || !project.link || project.technologies.length === 0) {
        throw new Error('Please fill in all required fields (title, description, link, and at least one technology).');
      }

      // Mock API call - replace with your actual API
      console.log('Submitting project:', project);
      // Simulate network delay and processing
      await new Promise(resolve => setTimeout(resolve, 2500)); // Increased delay for effect

      // Simulate a successful response
      setSubmissionMessage('Project saved successfully! Redirecting...');
      // In a real app, you would handle the actual API call here, e.g.:
      // const response = await fetch('/api/projects', { method: 'POST', body: JSON.stringify(project), headers: { 'Content-Type': 'application/json' } });
      // if (!response.ok) throw new Error('API submission failed.');
      // const result = await response.json();

      await new Promise(resolve => setTimeout(resolve, 1500)); // Give time for user to read success message
      navigate('/portfolio/projects'); // Navigate to the projects list
    } catch (err) {
      setError(err.message || 'Something went wrong while saving the project.');
      setSubmissionMessage('Error: ' + (err.message || 'Failed to save project.'));
    } finally {
      setLoading(false);
      // Keep success/error message visible briefly before hiding
      setTimeout(() => {
        setShowSubmissionStatus(false);
        setSubmissionMessage('');
      }, error ? 4000 : 2000); // Keep error message longer
    }
  };

  const themeClasses = {
    container: isDark
      ? 'min-h-screen bg-[rgb(var(--color-background-primary))] text-[rgb(var(--color-text-primary))]'
      : 'min-h-screen bg-[rgb(var(--color-background-primary))] text-[rgb(var(--color-text-primary))]',
    card: isDark
      ? 'bg-[rgb(var(--color-background-secondary))] border-gray-700/50'
      : 'bg-[rgb(var(--color-background-secondary))] border-gray-200/50',
    input: isDark
      ? 'bg-[rgb(var(--color-background-secondary))] border-gray-700 text-[rgb(var(--color-text-primary))] focus:border-[rgb(var(--color-accent-primary))] focus:ring-[rgb(var(--color-accent-primary))]'
      : 'bg-[rgb(var(--color-background-secondary))] border-gray-300 text-[rgb(var(--color-text-primary))] focus:border-[rgb(var(--color-accent-primary))] focus:ring-[rgb(var(--color-accent-primary))]',
    button: 'bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] hover:shadow-lg hover:shadow-[rgb(var(--color-accent-primary))]/25',
    techTag: isDark
      ? 'bg-[rgb(var(--color-background-primary))] border-[rgb(var(--color-accent-primary))] text-[rgb(var(--color-accent-primary))]'
      : 'bg-[rgb(var(--color-background-primary))] border-[rgb(var(--color-accent-primary))] text-[rgb(var(--color-accent-primary))]'
  };

  return (
    <div className={themeClasses.container}>
       {/* Animated Background Gradient */}
    <div className="fixed inset-0 bg-gradient-to-br from-[rgb(var(--color-accent-primary))]/5 via-transparent to-[rgb(var(--color-highlight))]/5 animate-pulse" />

    <div className="relative z-10 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with Animation */}
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Changed to /portfolio/projects - Move the comment here */}
          <button
            onClick={() => navigate('/portfolio/projects')}
            className="group flex items-center gap-2 mb-6 text-[rgb(var(--color-accent-primary))] hover:text-[rgb(var(--color-highlight))] transition-all duration-300 transform hover:scale-105"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            <span className="relative">
              Back to Portfolio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] transition-all duration-300 group-hover:w-full" />
            </span>
          </button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] bg-clip-text text-transparent animate-pulse">
                {editMode ? 'Edit Project' : 'Add New Project'}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] rounded-full mt-2" />
            </div>
          </div>

          {/* Error Alert with Animation */}
          {error && (
            <div className="transform transition-all duration-500 animate-shake bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Submission Status Message (NEW) */}
          {showSubmissionStatus && submissionMessage && (
            <div className={`
              fixed top-20 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-xl text-white z-50
              flex items-center gap-3 transition-all duration-500 animate-fade-in-down
              ${error ? 'bg-red-600' : 'bg-green-600'}
            `}>
              {error ? <FaExclamationCircle className="text-xl" /> : <FaCheckCircle className="text-xl" />}
              <span>{submissionMessage}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Image Section */}
            <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className={`${themeClasses.card} rounded-2xl p-6 border backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <FaImage className="text-[rgb(var(--color-accent-primary))] text-xl" />
                  <label className="text-lg font-semibold">Project Image</label>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-[rgb(var(--color-accent-primary))]/50 group-hover:border-[rgb(var(--color-accent-primary))] transition-all duration-300">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Project preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))] flex items-center justify-center">
                          <FaImage className="text-[rgb(var(--color-accent-primary))]/50 text-2xl" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className={`inline-block px-6 py-2 ${themeClasses.button} text-white font-medium rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105`}
                    >
                      Choose Image
                    </label>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">JPEG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info Section */}
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className={`${themeClasses.card} rounded-2xl p-6 border backdrop-blur-sm`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="title" className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-primary))]">
                      Project Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={project.title}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 ${themeClasses.input} rounded-lg outline-none transition-all duration-300 group-hover:shadow-md focus:shadow-lg`}
                      placeholder="Enter your project title"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="link" className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-primary))]">
                      Project Link*
                    </label>
                    <input
                      type="url"
                      id="link"
                      name="link"
                      value={project.link}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 ${themeClasses.input} rounded-lg outline-none transition-all duration-300 group-hover:shadow-md focus:shadow-lg`}
                      placeholder="https://your-project.com"
                    />
                  </div>
                </div>

                <div className="mt-6 group">
                  <label htmlFor="description" className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-primary))]">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={project.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 ${themeClasses.input} rounded-lg outline-none transition-all duration-300 group-hover:shadow-md focus:shadow-lg resize-none`}
                    placeholder="Describe your project in detail..."
                  />
                </div>
              </div>
            </div>

            {/* Technologies Section */}
            <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className={`${themeClasses.card} rounded-2xl p-6 border backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <FaCode className="text-[rgb(var(--color-accent-primary))] text-xl" />
                  <label className="text-lg font-semibold">Technologies*</label>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className={`group flex items-center gap-2 px-3 py-1 ${themeClasses.techTag} rounded-full text-xs border transition-all duration-300 hover:scale-105 hover:shadow-md`}
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 hover:scale-110"
                      >
                        <FaTrash size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Add technology (e.g., React, Node.js)"
                    className={`flex-1 px-4 py-3 ${themeClasses.input} rounded-lg outline-none transition-all duration-300 focus:shadow-lg`}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className={`px-6 py-3 ${themeClasses.button} text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>

            {/* Status & Progress Section */}
            <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className={`${themeClasses.card} rounded-2xl p-6 border backdrop-blur-sm`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="status" className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-primary))]">
                      Status*
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={project.status}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 ${themeClasses.input} rounded-lg outline-none transition-all duration-300 group-hover:shadow-md focus:shadow-lg`}
                    >
                      <option value="planned">🎯 Planned</option>
                      <option value="in-progress">⚡ In Progress</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                  </div>

                  <div className="group">
                    <label htmlFor="progress" className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-primary))]">
                      Progress ({project.progress}%)
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        id="progress"
                        name="progress"
                        min="0"
                        max="100"
                        value={project.progress}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[rgb(var(--color-accent-primary))] [&::-webkit-slider-thumb]:to-[rgb(var(--color-highlight))] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                      />
                      <div
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))] rounded-lg transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="isPinned"
                      name="isPinned"
                      checked={project.isPinned}
                      onChange={(e) => setProject(prev => ({ ...prev, isPinned: e.target.checked }))}
                      className="w-5 h-5 text-[rgb(var(--color-accent-primary))] bg-[rgb(var(--color-background-secondary))] border-gray-600 rounded focus:ring-[rgb(var(--color-accent-primary))] focus:ring-2 transition-all duration-300"
                    />
                    <span className="text-sm font-medium group-hover:text-[rgb(var(--color-accent-primary))] transition-colors duration-300">
                      📌 Pin this project to your portfolio
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className={`${themeClasses.card} rounded-2xl p-6 border backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <FaTasks className="text-[rgb(var(--color-accent-primary))] text-xl" />
                  <label className="text-lg font-semibold">Tasks</label>
                </div>

                <div className="space-y-3">
                  {project.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompleted(index)}
                        className="w-5 h-5 text-[rgb(var(--color-accent-primary))] bg-[rgb(var(--color-background-secondary))] border-gray-600 rounded focus:ring-[rgb(var(--color-accent-primary))] focus:ring-2 transition-all duration-300"
                      />
                      <input
                        type="text"
                        name="title"
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, e)}
                        placeholder={`Task ${index + 1} description`}
                        className={`flex-1 px-4 py-2 ${themeClasses.input} rounded-lg outline-none transition-all duration-300 group-hover:shadow-md focus:shadow-lg ${task.completed ? 'line-through opacity-75' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                        disabled={project.tasks.length <= 1}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTask}
                    className="flex items-center gap-2 px-4 py-2 text-[rgb(var(--color-accent-primary))] border border-[rgb(var(--color-accent-primary))] rounded-lg hover:bg-[rgb(var(--color-accent-primary))]/10 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaPlus /> Add Task
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 ${themeClasses.button} text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 group`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      {submissionMessage || 'Processing...'} {/* Display dynamic message */}
                    </>
                  ) : (
                    <>
                      <FaSave className="transition-transform group-hover:rotate-12" />
                      {editMode ? 'Update Project' : 'Save Project'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default ProjectForm;