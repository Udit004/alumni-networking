const admin = require('../config/firebase-admin');

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Add user info to request
        req.user = {
            uid: decodedToken.uid, // Changed from id to uid to match what the routes expect
            email: decodedToken.email,
            role: decodedToken.role || 'student' // Default to student if role not set
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};

module.exports = auth;