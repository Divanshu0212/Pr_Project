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

    if (!username) {
        return res.status(400).json({
            success: false,
            message: 'Username is required'
        });
    }

    try {
        // 1. Find the user by username
        const user = await User.findOne({ username })
            .select('-password -__v -createdAt -updatedAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userId = user._id;

        // 2. Fetch PortfolioDetails with null checks
        const portfolioDetails = await PortfolioDetails.findOne({ user: userId })
            .select('-user -__v -createdAt -updatedAt') || {};

        // 3. Fetch other data with empty array fallbacks
        const [skills, projects, certificates, experiences] = await Promise.all([
            Skill.find({ userId }).select('-userId -__v -createdAt -updatedAt').sort({ order: 1 }) || [],
            Project.find({ userId }).select('-userId -__v -createdAt -updatedAt -tasks') || [],
            Certificate.find({ userId }).select('-userId -__v -createdAt -updatedAt') || [],
            Experience.find({ user: userId }).select('-user -__v -createdAt -updatedAt') || []
        ]);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    profileImage: user.profileImage || null,
                    email: user.email
                },
                portfolioDetails,
                skills,
                projects,
                certificates,
                experiences
            }
        });

    } catch (error) {
        console.error('Error fetching public portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio data'
        });
    }
});

// In your backend controller (portfolioDetailsController.js)
exports.searchPortfolios = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'portfoliodetails',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'portfolioDetails'
                }
            },
            { $unwind: { path: '$portfolioDetails', preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    $or: [
                        { username: { $regex: q, $options: 'i' } },
                        { displayName: { $regex: q, $options: 'i' } },
                        { 'portfolioDetails.jobTitle': { $regex: q, $options: 'i' } },
                        { 'portfolioDetails.skills': { $regex: q, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    displayName: 1,
                    profileImage: 1,
                    'portfolioDetails.jobTitle': 1,
                    'portfolioDetails.skills': 1
                }
            },
            { $limit: 10 }
        ]);

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});