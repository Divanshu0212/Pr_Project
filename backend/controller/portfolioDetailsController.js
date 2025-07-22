// backend/controller/portfolioDetailsController.js
const PortfolioDetails = require('../models/PortfolioDetails');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Experience = require('../models/Experience');
const asyncHandler = require('express-async-handler'); // For handling async errors

// Controller functions for portfolioDetails (existing from Step 2.1)
// @desc    Get portfolio details for authenticated user
// @route   GET /api/portfolio-details
// @access  Private
exports.getPortfolioDetails = asyncHandler(async (req, res) => {
    const details = await PortfolioDetails.findOne({ user: req.user._id });
    if (!details) {
        return res.status(404).json({ success: false, message: 'Portfolio details not found' });
    }
    res.json({ success: true, data: details });
});

// @desc    Create or update portfolio details for authenticated user
// @route   PUT /api/portfolio-details
// @access  Private
exports.updateOrCreatePortfolioDetails = asyncHandler(async (req, res) => {
    const { jobTitle, location, yearsOfExperience, socialLinks, availability, bio } = req.body;

    const details = await PortfolioDetails.findOneAndUpdate(
        { user: req.user._id },
        { jobTitle, location, yearsOfExperience, socialLinks, availability, bio },
        { new: true, upsert: true, runValidators: true } // runValidators ensures schema validation on upsert
    );

    res.json({ success: true, data: details });
});


// @desc    Get public portfolio data by username
// @route   GET /api/portfolio/public/:username
// @access  Public
exports.getPublicPortfolio = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // 1. Find the user by username
    const user = await User.findOne({ username }).select('-password -__v -createdAt -updatedAt'); // Exclude sensitive/unnecessary fields

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    const userId = user._id;

    // 2. Fetch PortfolioDetails
    const portfolioDetails = await PortfolioDetails.findOne({ user: userId }).select('-user -__v -createdAt -updatedAt');
    if (!portfolioDetails === null) {
      console.log('Portfolio details are not found for this user.')
    }

    // 3. Fetch Skills
    const skills = await Skill.find({ userId }).select('-userId -__v -createdAt -updatedAt').sort({ order: 1 });

    // 4. Fetch Projects
    // Consider filtering by isPinned or other public flags if needed, and select public fields
    const projects = await Project.find({ userId }).select('-userId -__v -createdAt -updatedAt -tasks'); // Exclude tasks for public view
    
    // 5. Fetch Certificates
    const certificates = await Certificate.find({ userId }).select('-userId -__v -createdAt -updatedAt');

    // 6. Fetch Experiences
    const experiences = await Experience.find({ user: userId }).select('-user -__v -createdAt -updatedAt');

    // Aggregate all data
    res.status(200).json({
        success: true,
        data: {
            user: {
                username: user.username,
                displayName: user.displayName,
                profileImage: user.profileImage?.url || null,
                email: user.email // Depending on privacy, you might remove email for public profile
            },
            portfolioDetails: portfolioDetails || {}, // Provide empty object if not found
            skills: skills || [],
            projects: projects || [],
            certificates: certificates || [],
            experiences: experiences || []
        }
    });
});