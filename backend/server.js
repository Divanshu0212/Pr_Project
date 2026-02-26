// backend/server.js
// Load .env only in local development; on Vercel env vars come from the dashboard
if (!process.env.VERCEL) {
    require('dotenv').config({ path: './.env' });
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { initializePassport } = require('./config/passport');

// Security Middleware Imports
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Import your database connection function
const connectDB = require('./db/mongoClient');

// Import your logger utility
const logger = require('./utils/logger');

// Import your route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const portfolioDetailsRoutes = require('./routes/portfolioDetails');
const skillRoutes = require('./routes/skill');
const projectRoutes = require('./routes/project');
const certificateRoutes = require('./routes/certificate');
const experienceRoutes = require('./routes/experience');
const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');
const candidateRoutes = require('./routes/candidates');

// Import the centralized error handling middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Health check endpoint (no DB, no auth, responds instantly) ---
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Backend is running', timestamp: new Date().toISOString() });
});

// --- Database Connection Middleware ---
// Runs on every request; cached connection is reused on warm serverless invocations.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        logger.error('Failed to connect to MongoDB:', err);
        return res.status(503).json({ success: false, message: 'Database unavailable, please try again.' });
    }
});

// --- Core Security & Hardening Middleware ---

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(cookieParser());

// Session middleware — reuse the mongoose connection for MongoStore (no second connection)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        clientPromise: connectDB().then(() => mongoose.connection.getClient()),
        ttl: 24 * 60 * 60, // 1 day in seconds
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Initialize Passport.js for authentication
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Rate Limiting for Authentication Routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Serve static files
app.use('/mock_files', express.static('mock_files'));

// Define API Routes
// All route definitions should come BEFORE the error handling middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portfolio', portfolioDetailsRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ats', atsRoutes); // Mount ATS routes
app.use('/api/candidates', candidateRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
    const error = new Error(`Endpoint not found: ${req.originalUrl}`);
    error.statusCode = 404;
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, { ip: req.ip, userId: req.user ? req.user.id : 'N/A' });
    next(error); // Pass to the centralized error handler
});

// Centralized Error Handling Middleware (MUST BE LAST APP.USE BEFORE LISTEN)
// This will catch all errors, including those from routes and other middleware.
app.use(errorHandler);

// Start the server (only in local development)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SERVER_LISTEN === 'true') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
}

// Export app for Vercel serverless
module.exports = app;