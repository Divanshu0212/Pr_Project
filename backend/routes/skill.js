// backend/routes/skill.js
const express = require('express');
const passport = require('passport');
const Skill = require('../models/Skill');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Private
router.post('/manage', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res) => {
  const { name, category, proficiency, icon, isFeatured } = req.body;

  // Validation
  if (!name || !category) {
    res.status(400);
    throw new Error('Please include name and category');
  }

  try {
    const skill = new Skill({
      userId: req.user._id,
      name,
      category,
      proficiency: proficiency || 5,
      icon: icon || '',
      isFeatured: isFeatured || false
    });

    const createdSkill = await skill.save();
    res.status(201).json(createdSkill);
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ message: 'Error creating skill', error: error.message });
  }
}));

// @desc    Get all skills for a user
// @route   GET /api/skills
// @access  Private
router.get('/manage', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res) => {
  const skills = await Skill.find({ userId: req.user._id }).sort({ order: 1 });
  res.json(skills);
}));

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
router.put('/manage/:id', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res) => {
  const { name, category, proficiency, icon, isFeatured, order } = req.body;

  const skill = await Skill.findById(req.params.id);

  if (skill) {
    if (skill.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this skill');
    }

    skill.name = name || skill.name;
    skill.category = category || skill.category;
    skill.proficiency = proficiency || skill.proficiency;
    skill.icon = icon || skill.icon;
    skill.isFeatured = isFeatured !== undefined ? isFeatured : skill.isFeatured;
    skill.order = order !== undefined ? order : skill.order;

    const updatedSkill = await skill.save();
    res.json(updatedSkill);
  } else {
    res.status(404);
    throw new Error('Skill not found');
  }
}));

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
router.delete('/manage/:id', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (skill) {
    if (skill.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this skill');
    }

    await skill.remove();
    res.json({ message: 'Skill removed' });
  } else {
    res.status(404);
    throw new Error('Skill not found');
  }
}));

// @desc    Reorder skills
// @route   PUT /api/skills/reorder
// @access  Private
router.put('/manage/reorder', passport.authenticate('jwt', { session: false }), asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;

  const skills = await Skill.find({ userId: req.user._id });

  // Create a map of id to order
  const orderMap = {};
  orderedIds.forEach((id, index) => {
    orderMap[id] = index;
  });

  // Update skills with new order
  const updatePromises = skills.map(skill => {
    if (orderMap[skill._id.toString()] !== undefined) {
      skill.order = orderMap[skill._id.toString()];
      return skill.save();
    }
    return Promise.resolve();
  });

  await Promise.all(updatePromises);

  res.json({ message: 'Skills reordered successfully' });
}));

module.exports = router;