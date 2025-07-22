// backend/middleware/errorHandler.js
const logger = require('../utils/logger'); // Import the logger utility

/**
 * Custom Error Handler Middleware
 * This middleware catches errors passed by `next(err)` or thrown in async functions.
 * It provides a consistent error response to the client and logs detailed info internally.
 */
const errorHandler = (err, req, res, next) => {
    // Determine the status code and message for the client
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An internal server error occurred.';

    // Log the error internally for debugging and security analysis
    // Avoid logging sensitive request body data directly unless specifically necessary and masked
    logger.error(`Unhandled Error: ${err.message}`, {
        method: req.method,
        path: req.originalUrl,
        statusCode: statusCode,
        ip: req.ip, // Log IP address for security analysis
        userId: req.user ? req.user.id : 'N/A', // Log user ID if available and authenticated
        errorName: err.name,
        errorMessage: err.message,
        // In production, avoid sending full stack traces to the client
        // Log stack trace internally for debugging
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only log stack in dev for security
        // Capture specific error details if they are custom properties (e.g., Joi errors)
        errors: err.errors || undefined
    });

    // Send a consistent, non-verbose error response to the client
    // Only include stack trace in development for debugging
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'An internal server error occurred. Please try again later.'
            : message, // For other errors (e.g., 400, 401, 404), can send specific messages
        // Only include error stack in development environment for security
        errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        // Include specific error details only if explicitly meant for client (e.g., validation errors)
        errors: err.errors // This can be used for Joi validation error details
    });
};

module.exports = errorHandler;