// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = function (req, res, next) {
    // Get token from header - support both x-auth-token and Authorization Bearer formats
    let token = req.header('x-auth-token');
    
    // If no x-auth-token, check for Authorization header with Bearer format
    if (!token) {
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7); // Remove 'Bearer ' prefix
        }
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied.' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assuming JWT_SECRET in .env
        
        // The JWT payload contains { id, email } directly, not wrapped in a user object
        // Create a user object for compatibility with existing code
        req.user = {
            id: decoded.id,
            email: decoded.email,
            _id: decoded.id // Also add _id for compatibility
        };
        
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        res.status(401).json({ success: false, message: 'Token is not valid.' });
    }
};