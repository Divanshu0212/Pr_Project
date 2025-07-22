// backend/routes/portfolioDetails.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getPortfolioDetails, updateOrCreatePortfolioDetails, getPublicPortfolio } = require('../controller/portfolioDetailsController');

// Private routes for authenticated users to manage their own portfolio details
// @desc    Get portfolio details for authenticated user
// @route   GET /api/portfolio-details
// @access  Private
router.get('/portfolio-details', passport.authenticate('jwt', { session: false }), getPortfolioDetails);

// @desc    Create or update portfolio details for authenticated user
// @route   PUT /api/portfolio-details
// @access  Private
router.put('/portfolio-details', passport.authenticate('jwt', { session: false }), updateOrCreatePortfolioDetails);

// Public route to get aggregated portfolio data by username
// @desc    Get public portfolio data by username
// @route   GET /api/portfolio/public/:username
// @access  Public
router.get('/public/:username', getPublicPortfolio); // No authentication needed for public view

module.exports = router;























//Previously


// const express = require('express');
// const router = express.Router();
// const passport = require('passport');
// const PortfolioDetails = require('../models/PortfolioDetails');
// const { getPortfolioDetails, updateOrCreatePortfolioDetails, getPublicPortfolio } = require('../controller/portfolioDetailsController');
// // Get portfolio details
// router.get('/portfolio-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//     const details = await PortfolioDetails.findOne({ user: req.user._id });
//     if (!details) {
//       return res.status(404).json({ success: false, message: 'Portfolio details not found' });
//     }
//     res.json({ success: true, data: details });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Create or update portfolio details
// router.put('/portfolio-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//     const { jobTitle, location, yearsOfExperience, socialLinks, availability, bio } = req.body;
    
//     const details = await PortfolioDetails.findOneAndUpdate(
//       { user: req.user._id },
//       { jobTitle, location, yearsOfExperience, socialLinks, availability, bio },
//       { new: true, upsert: true }
//     );

//     res.json({ success: true, data: details });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// module.exports = router;