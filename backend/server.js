require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { initializePassport } = require('./config/passport');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const portfolioDetailsRoutes = require('./routes/portfolioDetails');
const skillRoutes = require('./routes/skill');
const projectRoutes = require('./routes/project');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Log routes for debugging
app.use((req, res, next) => {
  next();
});

// app.use('/api/skills', skillRoutes);
// Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api/portfolio', portfolioDetailsRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/projects', projectRoutes)
} catch (err) {
  console.error('Error registering routes:', err);
}

// Replace your current error handler with this:
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Add 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});