const Project = require('../models/Project');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinaryProjects');
const fs = require('fs');
const path = require('path');

// Add a new project
const addProject = async (req, res) => {
  try {
    const { title, description, link, technologies, status, progress, isPinned, tasks } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'Project image is required' });
    }

    // Upload image to Cloudinary
    const image = await uploadToCloudinary(req.file.path);

    const project = new Project({
      userId,
      title,
      description,
      image,
      link,
      technologies: JSON.parse(technologies),
      status,
      progress,
      isPinned,
      tasks: JSON.parse(tasks)
    });

    await project.save();

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all projects for a user (with filtering)
const getProjects = async (req, res) => {
  try {
    const { status, isPinned } = req.query;
    const userId = req.user._id;

    const filter = { userId };
    if (status) filter.status = status;
    if (isPinned) filter.isPinned = isPinned === 'true';

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project counts (for stats)
const getProjectCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Project.countDocuments({ userId });
    const completed = await Project.countDocuments({ userId, status: 'completed' });
    const pinned = await Project.countDocuments({ userId, isPinned: true });

    res.status(200).json({
      success: true,
      counts: { total, completed, pinned }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching project' 
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { title, description, link, technologies, status, progress, isPinned, tasks } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let image = project.image;
    if (req.file) {
      // Delete old image from Cloudinary
      await deleteFromCloudinary(project.image.public_id);
      // Upload new image
      image = await uploadToCloudinary(req.file.path);
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.link = link || project.link;
    project.technologies = technologies ? JSON.parse(technologies) : project.technologies;
    project.status = status || project.status;
    project.progress = progress || project.progress;
    project.isPinned = isPinned || project.isPinned;
    project.tasks = tasks ? JSON.parse(tasks) : project.tasks;
    project.image = image;

    await project.save();

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(project.image.public_id);

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProject,
  getProjects,
  getProjectCounts,
  getProject,
  updateProject,
  deleteProject
};