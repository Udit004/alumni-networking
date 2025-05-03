const admin = require('../config/firebase-admin');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            // For development, use a mock user if SKIP_AUTH is true
            if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
                console.log('⚠️ Development mode with SKIP_AUTH: Using mock user');
                req.user = {
                    id: req.query.userId || req.params.userId || 'mock-user-id',
                    email: 'mock@example.com',
                    role: req.query.role || 'student'
                };
                return next();
            }

            return res.status(401).json({ success: false, message: 'No authentication token provided' });
        }

        try {
            // Verify the Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Add user info to request
            req.user = {
                id: decodedToken.uid,
                email: decodedToken.email,
                role: decodedToken.role || 'student' // Default to student if role not set
            };

            next();
        } catch (verifyError) {
            console.error('Auth Middleware Token Verification Error:', verifyError);

            // For development, use a mock user if SKIP_AUTH is true
            if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
                console.log('⚠️ Development mode with SKIP_AUTH: Using mock user after token verification failure');
                req.user = {
                    id: req.query.userId || req.params.userId || 'mock-user-id',
                    email: 'mock@example.com',
                    role: req.query.role || 'student'
                };
                return next();
            }

            throw verifyError;
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
    }
};

// Middleware that attempts authentication but doesn't require it
exports.attemptAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            // Continue without authentication
            console.log('No token provided, continuing without authentication');
            return next();
        }

        try {
            // Verify the Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Add user info to request
            req.user = {
                id: decodedToken.uid,
                email: decodedToken.email,
                role: decodedToken.role || 'student' // Default to student if role not set
            };
        } catch (verifyError) {
            console.error('Token verification failed in attemptAuth middleware:', verifyError.message);
            // Continue without setting req.user
        }

        // Always continue to the next middleware
        next();
    } catch (error) {
        console.error('Error in attemptAuth middleware:', error);
        next();
    }
};