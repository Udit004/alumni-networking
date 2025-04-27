const admin = require('../config/firebase-admin');

/**
 * Create a mock user for development mode
 * @param {Object} req - Express request object
 * @returns {Object} - Mock user object
 */
const createMockUser = (req) => {
    // Get user ID from query params, URL params, or use a default
    const userId = req.query.userId || req.params.userId || req.body?.userId || '4EOWySj0hHfLOCWFxi3JeJYsqTj2';

    // Get role from query params or use a default
    const role = req.query.role || req.body?.role || 'student';

    return {
        uid: userId,
        email: 'dev@example.com',
        role: role,
        mock: true
    };
};

/**
 * Main authentication middleware
 * Verifies Firebase token and adds user info to request
 */
const auth = async (req, res, next) => {
    try {
        // Check if we're in development mode with auth skipping enabled
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
            console.log('Development mode: Using mock user authentication');
            req.user = createMockUser(req);
            return next();
        }

        // Get token from Authorization header
        const token = req.headers.authorization?.split('Bearer ')[1];

        // If no token is provided
        if (!token) {
            // In development, use mock user
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: No token provided, using mock user');
                req.user = createMockUser(req);
                return next();
            }

            // In production, return error
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        try {
            // Check if we're using a mock Firebase Admin
            if (admin.isMock && admin.isMock()) {
                console.log('Using mock Firebase Admin, creating mock user');
                req.user = createMockUser(req);
                return next();
            }

            // Verify the Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);

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
                req.user = createMockUser(req);
                return next();
            }

            throw verifyError; // Re-throw for the outer catch block
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);

        // In development, use mock user even on error
        if (process.env.NODE_ENV === 'development') {
            console.log('DEV MODE: Using mock user after auth error');
            req.user = createMockUser(req);
            return next();
        }

        // In production, return error
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Verify token middleware for chat messages
 * Similar to auth middleware but with more logging
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');

        // Skip auth for development if needed
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
            console.log('Skipping auth in development mode');
            req.user = createMockUser(req);
            return next();
        }

        const token = authHeader?.split('Bearer ')[1];

        if (!token) {
            console.log('No token provided in request');

            // In development, use mock user
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: No token provided, using mock user');
                req.user = createMockUser(req);
                return next();
            }

            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        try {
            // Check if we're using a mock Firebase Admin
            if (admin.isMock && admin.isMock()) {
                console.log('Using mock Firebase Admin, creating mock user');
                req.user = createMockUser(req);
                return next();
            }

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
                req.user = createMockUser(req);
                return next();
            }

            throw verifyError; // Re-throw for the outer catch block
        }
    } catch (error) {
        console.error('Token Verification Error:', error);

        // In development, use mock user even on error
        if (process.env.NODE_ENV === 'development') {
            console.log('DEV MODE: Using mock user after token verification error');
            req.user = createMockUser(req);
            return next();
        }

        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

module.exports = { auth, verifyToken };
