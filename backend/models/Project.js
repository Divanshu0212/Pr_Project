const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  link: {
    type: String,
    required: true
  },
  technologies: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed'],
    default: 'planned'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  tasks: [{
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);