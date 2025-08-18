// backend/server.js
require('dotenv').config({ path: './.env' }); // Load .env variables at the very start
const express = require('express');
const mongoose = require('mongoose'); // Mongoose for database interaction
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { initializePassport } = require('./config/passport');

// Security Middleware Imports
const helmet = require('helmet'); // For setting security headers
const rateLimit = require('express-rate-limit'); // For rate limiting requests
const cookieParser = require('cookie-parser'); // For parsing cookies

// Import your database connection function
const connectDB = require('./db/mongoClient');

// Import your logger utility
const logger = require('./utils/logger'); // Used for security logging

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

// Connect Database with error handling
connectDB().catch(err => {
    logger.error('Failed to connect to MongoDB:', err);
    console.error('❌ Failed to connect to MongoDB. Server will continue but database operations will fail.');
    // Server continues to run but database operations will fail gracefully
});

// --- Core Security & Hardening Middleware ---

// 1. Helmet.js: Secure HTTP Headers
// It's recommended to place Helmet early in your middleware stack.
app.use(helmet());
logger.info('Helmet middleware applied for security headers.');

// 2. CORS Configuration: Restrictive Access
// Allows requests from your frontend client only.
app.use(cors({
    origin: process.env.CLIENT_URL, // Your frontend URL from .env (e.g., http://localhost:3000)
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Allowed request headers
}));
logger.info(`CORS configured for origin: ${process.env.CLIENT_URL}`);

// 3. Body Parsing with Limits
// express.json() for parsing application/json. Added limit to prevent large payloads (DoS).
app.use(express.json({ limit: '1mb' }));
// express.urlencoded() for parsing application/x-www-form-urlencoded. Added limit.
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
logger.info('Body parsers (JSON, URL-encoded) applied with 1MB limit.');

// 4. Cookie Parsing
// Required for parsing cookies sent by the client. Place before session if session relies on it.
app.use(cookieParser());
logger.info('Cookie-parser middleware applied.');

// 5. Session middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET, // Secret key for signing the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // Store sessions in MongoDB
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        httpOnly: true, // Prevent client-side JavaScript from accessing cookies
        sameSite: 'Lax', // Protect against CSRF attacks. 'Strict' is more secure but can break cross-site links. 'Lax' is a good balance.
        maxAge: 24 * 60 * 60 * 1000 // Session cookie expiration time (1 day)
    }
}));
logger.info('Express-session middleware applied. Cookie secure and httpOnly settings based on NODE_ENV.');

// Initialize Passport.js for authentication
initializePassport(passport); // Pass the passport instance to your config
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable Passport session support
logger.info('Passport.js initialized.');

// 6. Rate Limiting for Authentication Routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    // Log blocked attempts for security monitoring
    handler: (req, res, next, options) => {
        logger.security('Rate limit exceeded', {
            ip: req.ip,
            route: req.originalUrl,
            method: req.method,
            max: options.max,
            windowMs: options.windowMs / 1000 / 60 + ' minutes'
        });
        res.status(options.statusCode).send(options.message);
    }
});
// Apply to authentication routes to prevent brute-force attacks
app.use('/api/auth/login', authLimiter); // Assuming login is a POST route
app.use('/api/auth/signup', authLimiter); // Assuming signup is a POST route
logger.info('Rate limiting applied to /api/auth/login and /api/auth/signup.');

// Optional: Log routes for debugging (can be removed in production)
app.use((req, res, next) => {
    // console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Serve static files (e.g., for mock PDF downloads, if any)
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
app.use('/api/candidates', candidateRoutes); // Mount candidate search routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Backend API',
        port: PORT || process.env.PORT || 5000
    });
});

logger.info('All API routes registered.');

// 404 Not Found Handler - Catches requests to undefined routes
// This must come BEFORE the centralized error handler, but AFTER all valid routes.
app.use((req, res, next) => {
    const error = new Error(`Endpoint not found: ${req.originalUrl}`);
    error.statusCode = 404;
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, { ip: req.ip, userId: req.user ? req.user.id : 'N/A' });
    next(error); // Pass to the centralized error handler
});

// Centralized Error Handling Middleware (MUST BE LAST APP.USE BEFORE LISTEN)
// This will catch all errors, including those from routes and other middleware.
app.use(errorHandler);
logger.info('Centralized error handler applied.');

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});