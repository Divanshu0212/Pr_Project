const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    },
    minlength: 8,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  githubId: {
    type: String,  
    sparse: true // Allows multiple null values
  },
  profileImage: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash password if it's explicitly modified by the application code
  // and not during OAuth account linking
  if (this.isModified('password') && 
      this.password && 
      !this._skipPasswordHashing && 
      !this.password.startsWith('$2a$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
// Method to validate password
UserSchema.methods.validatePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Method to return user without password
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

UserSchema.index({
  username: 'text',
  displayName: 'text'
});

module.exports = mongoose.model('User', UserSchema);