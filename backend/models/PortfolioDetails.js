const mongoose = require('mongoose');

const portfolioDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  jobTitle: {
    type: String,
    default: 'Software Developer'
  },
  location: {
    type: String,
    default: ''
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' }
  },
  availability: {
    type: String,
    enum: ['available', 'not-available', 'freelance'],
    default: 'available'
  },
  bio: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
}, { timestamps: true });

// In your PortfolioDetails model
portfolioDetailsSchema.index({
  jobTitle: 'text',
  skills: 'text'
});

module.exports = mongoose.model('PortfolioDetails', portfolioDetailsSchema);