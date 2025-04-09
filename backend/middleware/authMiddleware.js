const admin = require('../config/firebase-admin');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No authentication token provided' });
        }

        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Add user info to request
        req.user = {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'student' // Default to student if role not set
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
    }
}; 