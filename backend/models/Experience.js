const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  companyLogo: {
    public_id: String,
    url: String
  },
  location: {
    type: String,
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time'
  }
}, {
  timestamps: true
});

// Calculate duration in months
experienceSchema.virtual('duration').get(function() {
  const end = this.isCurrent ? new Date() : this.endDate;
  const start = this.startDate;
  
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  
  return (years * 12) + months;
});

// Calculate duration in years for display
experienceSchema.virtual('displayDuration').get(function() {
  const months = this.duration;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let result = '';
  if (years > 0) result += `${years} yr${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) result += ` ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
  
  return result.trim();
});

module.exports = mongoose.model('Experience', experienceSchema);
