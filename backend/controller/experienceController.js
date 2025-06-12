const Experience = require('../models/Experience');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinaryExperience');

// @desc    Get all experiences for a user
// @route   GET /api/experiences
// @access  Private
exports.getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ user: req.user._id }).sort('-startDate');
    res.status(200).json({ success: true, experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch experiences', error: error.message });
  }
};

// @desc    Add a new experience
// @route   POST /api/experiences
// @access  Private
exports.addExperience = async (req, res) => {
  try {
    const { company, position, startDate, endDate, isCurrent, description, skills, location, employmentType } = req.body;

    const result = await uploadToCloudinary(req.file.path);

    const experience = new Experience({
      user: req.user._id,
      company,
      position,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent,
      description,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      location,
      employmentType,
      companyLogo: req.file ? {
        public_id: result.public_id,
        url: result.secure_url
      } : null
    });

    await experience.save();
    res.status(201).json({ success: true, experience });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to add experience', error: error.message });
  }
};

// @desc    Update an experience
// @route   PUT /api/experiences/:id
// @access  Private
exports.updateExperience = async (req, res) => {
  try {
    const { company, position, startDate, endDate, isCurrent, description, skills, location, employmentType } = req.body;
    const experience = await Experience.findOne({ _id: req.params.id, user: req.user._id });

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    // Delete old logo if new one is uploaded
    if (req.file && experience.companyLogo?.public_id) {
      await deleteFromCloudinary(experience.companyLogo.public_id);
    }

    experience.company = company;
    experience.position = position;
    experience.startDate = startDate;
    experience.endDate = isCurrent ? null : endDate;
    experience.isCurrent = isCurrent;
    experience.description = description;
    experience.skills = skills ? skills.split(',').map(skill => skill.trim()) : [];
    experience.location = location;
    experience.employmentType = employmentType;
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      experience.companyLogo = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    await experience.save();
    res.status(200).json({ success: true, experience });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update experience', error: error.message });
  }
};

// @desc    Delete an experience
// @route   DELETE /api/experiences/:id
// @access  Private
exports.deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    // Delete company logo from cloudinary if exists
    if (experience.companyLogo?.public_id) {
      await deleteFromCloudinary(experience.companyLogo.public_id);
    }

    res.status(200).json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete experience', error: error.message });
  }
};

// @desc    Calculate total experience in years
// @route   GET /api/experiences/total
// @access  Private
exports.getTotalExperience = async (req, res) => {
  try {
    const experiences = await Experience.find({ user: req.user._id });
    
    let totalMonths = 0;
    const now = new Date();
    
    experiences.forEach(exp => {
      const end = exp.isCurrent ? now : exp.endDate;
      const start = exp.startDate;
      
      const years = end.getFullYear() - start.getFullYear();
      const months = end.getMonth() - start.getMonth();
      
      totalMonths += (years * 12) + months;
    });
    
    const totalYears = Math.round(totalMonths / 12);
    res.status(200).json({ success: true, totalYears });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to calculate total experience', error: error.message });
  }
};
