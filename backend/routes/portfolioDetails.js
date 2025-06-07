const express = require('express');
const router = express.Router();
const passport = require('passport');
const PortfolioDetails = require('../models/PortfolioDetails');

// Get portfolio details
router.get('/portfolio-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const details = await PortfolioDetails.findOne({ user: req.user._id });
    if (!details) {
      return res.status(404).json({ success: false, message: 'Portfolio details not found' });
    }
    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create or update portfolio details
router.put('/portfolio-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { jobTitle, location, yearsOfExperience, socialLinks, availability, bio } = req.body;
    
    const details = await PortfolioDetails.findOneAndUpdate(
      { user: req.user._id },
      { jobTitle, location, yearsOfExperience, socialLinks, availability, bio },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;