// backend/utils/logger.js
const moment = require('moment-timezone'); // For consistent timestamps

// Set the timezone for logging (e.g., 'Asia/Kolkata' for IST)
const TIMEZONE = 'Asia/Kolkata';

const log = (level, message, metadata = {}) => {
    const timestamp = moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss.SSS Z');
    // Ensure metadata does not contain sensitive PII directly
    // JSON.stringify can handle objects and prevent [object Object]
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : ''}`;

    switch (level) {
        case 'info':
            console.info(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        case 'error':
            console.error(logMessage);
            break;
        case 'debug':
            // Only log debug messages in development environments
            if (process.env.NODE_ENV !== 'production') {
                console.log(logMessage);
            }
            break;
        case 'security': // Custom level for security-sensitive events
            console.log(`[${timestamp}] [SECURITY] ${message} ${Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : ''}`);
            break;
        default:
            console.log(logMessage);
    }
};

module.exports = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),
    security: (msg, meta) => log('security', msg, meta), // For security-focused logs
};

