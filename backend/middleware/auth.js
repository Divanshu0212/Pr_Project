// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common practice for JWTs

    // Check if not token
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied.' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assuming JWT_SECRET in .env
        req.user = decoded.user; // Attach user information (e.g., user ID) to the request
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        res.status(401).json({ success: false, message: 'Token is not valid.' });
    }
};