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
            id: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'student' // Default to student if role not set
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};

// Verify token middleware for chat messages
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');

        // Skip auth for development if needed
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
            console.log('Skipping auth in development mode');
            req.user = { uid: req.params.userId || 'dev-user-id' };
            return next();
        }

        const token = authHeader?.split('Bearer ')[1];

        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        try {
            // Verify the Firebase token
            console.log('Verifying token...');
            const decodedToken = await admin.auth().verifyIdToken(token);
            console.log('Token verified for user:', decodedToken.uid);

            // Add user info to request
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                role: decodedToken.role || 'student' // Default to student if role not set
            };

            next();
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError);

            // For development only - bypass auth if token verification fails
            if (process.env.NODE_ENV === 'development') {
                console.log('DEV MODE: Bypassing auth after token verification failure');
                req.user = { uid: req.params.userId || 'dev-user-id' };
                return next();
            }

            throw verifyError; // Re-throw for the outer catch block
        }
    } catch (error) {
        console.error('Token Verification Error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

module.exports = { auth, verifyToken };