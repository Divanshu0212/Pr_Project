import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft, FaSave } from 'react-icons/fa';
import SummaryApi from '../../config';
import axios from 'axios';

const ProjectForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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

  useEffect(() => {
    if (editMode && id) {
      const fetchProject = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(SummaryApi.projects.single.url(id), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setProject(response.data.project);
          setPreview(response.data.project.image.url);
        } catch (err) {
          setError('Failed to fetch project details');
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

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', project.title);
      formData.append('description', project.description);
      formData.append('link', project.link);
      formData.append('technologies', JSON.stringify(project.technologies));
      formData.append('status', project.status);
      formData.append('progress', project.progress);
      formData.append('isPinned', project.isPinned);
      formData.append('tasks', JSON.stringify(project.tasks));
      
      if (image) {
        formData.append('image', image);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (editMode) {
        response = await axios.put(SummaryApi.projects.update.url(id), formData, config);
      } else {
        response = await axios.post(SummaryApi.projects.add.url, formData, config);
      }

      if (response.data.success) {
        navigate('/portfolioHome');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E5E5E5] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/portfolioHome')}
          className="flex items-center gap-2 mb-6 text-[#00FFFF] hover:underline"
        >
          <FaArrowLeft /> Back to Portfolio
        </button>

        <h1 className="text-3xl font-bold mb-8 text-[#00FFFF]">
          {editMode ? 'Edit Project' : 'Add New Project'}
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Project Image</label>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-600">
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Project preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
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
                  className="px-4 py-2 bg-[#161B22] border border-[#00FFFF] text-[#00FFFF] rounded-lg cursor-pointer hover:bg-[#0D1117] transition-colors"
                >
                  Choose Image
                </label>
                <p className="text-xs text-gray-400 mt-2">JPEG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Project Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={project.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#161B22] border border-gray-700 rounded-lg focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] outline-none"
              />
            </div>

            <div>
              <label htmlFor="link" className="block text-sm font-medium mb-2">
                Project Link*
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={project.link}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#161B22] border border-gray-700 rounded-lg focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={project.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-[#161B22] border border-gray-700 rounded-lg focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] outline-none"
            />
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium mb-2">Technologies*</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.technologies.map((tech, index) => (
                <span 
                  key={index} 
                  className="flex items-center gap-1 px-3 py-1 bg-[#0D1117] border border-[#00FFFF] text-[#00FFFF] rounded-full text-xs"
                >
                  {tech}
                  <button 
                    type="button" 
                    onClick={() => removeTechnology(tech)}
                    className="text-red-400 hover:text-red-300"
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
                placeholder="Add technology"
                className="flex-1 px-4 py-2 bg-[#161B22] border border-gray-700 rounded-lg focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] outline-none"
              />
              <button
                type="button"
                onClick={addTechnology}
                className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Status*
              </label>
              <select
                id="status"
                name="status"
                value={project.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#161B22] border border-gray-700 rounded-lg focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] outline-none"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="progress" className="block text-sm font-medium mb-2">
                Progress ({project.progress}%)
              </label>
              <input
                type="range"
                id="progress"
                name="progress"
                min="0"
                max="100"
                value={project.progress}
                onChange={handleChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00FFFF]"
              />
            </div>
          </div>

          {/* Pinned */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPinned"
              name="isPinned"
              checked={project.isPinned}
              onChange={(e) => setProject(prev => ({ ...prev, isPinned: e.target.checked }))}
              className="w-4 h-4 text-[#00FFFF] bg-gray-700 border-gray-600 rounded focus:ring-[#00FFFF] focus:ring-2"
            />
            <label htmlFor="isPinned" className="ml-2 text-sm font-medium">
              Pin this project to your portfolio
            </label>
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-sm font-medium mb-2">Tasks</label>
            <div className="space-y-3">
              {project.tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompleted(index)}
                    className="w-4 h-4 text-[#00FFFF] bg-gray-700 border-gray-600 rounded focus:ring-[#00FFFF] focus:ring-2"
                  />
                  <input
                    type="text"
                    name="title"
                    value={task.title}
                    onChange={(e) => handleTaskChange(index, e)}
                    placeholder="Task description"
                    className="flex-1 px-4 py-2 bg-[#161B22] border border-gray-700 rounded-lg focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                    disabled={project.tasks.length <= 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTask}
                className="flex items-center gap-2 px-4 py-2 text-[#00FFFF] border border-[#00FFFF] rounded-lg hover:bg-[#00FFFF]/10 transition-colors"
              >
                <FaPlus /> Add Task
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <FaSave /> {editMode ? 'Update Project' : 'Save Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;