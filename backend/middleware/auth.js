const admin = require('../config/firebase-admin');

/**
 * Authentication middleware
 * Verifies Firebase ID token and sets user information in the request
 * Falls back to query parameters if token verification fails
 */
const auth = async (req, res, next) => {
    try {
        // Check if the authorization header exists
        const token = req.headers.authorization?.split('Bearer ')[1];

        // First try to authenticate with the token
        if (token) {
            console.log('🔍 Auth token received, length:', token.length);
            console.log('🔍 Token first 10 chars:', token.substring(0, 10) + '...');

            try {
                // Verify the token
                console.log('🔄 Verifying Firebase token...');
                const decodedToken = await admin.auth().verifyIdToken(token);
                console.log('✅ Token verified successfully for user:', decodedToken.uid);

                // Set the user in the request
                req.user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    role: req.query.role || decodedToken.role || 'student',
                    authMethod: 'token'
                };

                console.log('👤 Authenticated user with token:', req.user.uid, 'Role:', req.user.role);
                return next();
            } catch (verifyError) {
                console.error('❌ Token verification failed:', verifyError.message);
                console.error('❌ Error details:', verifyError);
                // Continue to fallback authentication
            }
        } else {
            console.log('⚠️ No auth token provided');
        }

        // Fallback: Check for firebaseUID in query params
        if (req.query.firebaseUID) {
            console.log('Using firebaseUID from query params:', req.query.firebaseUID);
            req.user = {
                uid: req.query.firebaseUID,
                role: req.query.role || 'student',
                authMethod: 'query' // Mark that this was authenticated via query params
            };
            return next();
        }

        // Fallback: Check for firebaseUID in request body
        if (req.body && req.body.firebaseUID) {
            console.log('Using firebaseUID from request body:', req.body.firebaseUID);
            req.user = {
                uid: req.body.firebaseUID,
                role: req.body.role || req.query.role || 'student',
                authMethod: 'body' // Mark that this was authenticated via request body
            };
            return next();
        }

        // If we get here, authentication failed
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No valid authentication method found',
            details: 'Please provide a valid Firebase ID token or firebaseUID parameter'
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication',
            details: error.message
        });
    }
};

/**
 * Verify token middleware for API requests
 * Similar to auth middleware but with additional fallbacks for development
 */
const verifyToken = async (req, res, next) => {
    try {
        // Check if the authorization header exists
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');

        // Skip auth for development if needed
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
            console.log('Skipping auth in development mode');
            req.user = {
                uid: req.params.userId || req.query.firebaseUID || 'dev-user-id',
                role: req.query.role || 'student',
                authMethod: 'dev-bypass'
            };
            return next();
        }

        // First try to authenticate with the token
        const token = authHeader?.split('Bearer ')[1];
        if (token) {
            console.log('🔍 verifyToken: Auth token received, length:', token.length);
            console.log('🔍 verifyToken: Token first 10 chars:', token.substring(0, 10) + '...');

            try {
                // Verify the Firebase token
                console.log('🔄 verifyToken: Verifying Firebase token...');
                const decodedToken = await admin.auth().verifyIdToken(token);
                console.log('✅ verifyToken: Token verified for user:', decodedToken.uid);

                // Add user info to request
                req.user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    role: req.query.role || decodedToken.role || 'student',
                    authMethod: 'token'
                };

                console.log('👤 verifyToken: User authenticated with role:', req.user.role);
                return next();
            } catch (verifyError) {
                console.error('❌ verifyToken: Token verification failed:', verifyError.message);
                console.error('❌ verifyToken: Error details:', verifyError);

                // For development only - bypass auth if token verification fails
                if (process.env.NODE_ENV === 'development') {
                    console.log('DEV MODE: Bypassing auth after token verification failure');
                    req.user = {
                        uid: req.params.userId || req.query.firebaseUID || 'dev-user-id',
                        role: req.query.role || 'student',
                        authMethod: 'dev-bypass'
                    };
                    return next();
                }

                // Continue to fallback authentication for production
            }
        }

        // Fallback: Check for firebaseUID in query params
        if (req.query.firebaseUID) {
            console.log('Using firebaseUID from query params:', req.query.firebaseUID);
            req.user = {
                uid: req.query.firebaseUID,
                role: req.query.role || 'student',
                authMethod: 'query'
            };
            return next();
        }

        // Fallback: Check for firebaseUID in request body
        if (req.body && req.body.firebaseUID) {
            console.log('Using firebaseUID from request body:', req.body.firebaseUID);
            req.user = {
                uid: req.body.firebaseUID,
                role: req.body.role || req.query.role || 'student',
                authMethod: 'body'
            };
            return next();
        }

        // Fallback: Check for userId in route params (for chat routes)
        if (req.params.userId) {
            console.log('Using userId from route params:', req.params.userId);
            req.user = {
                uid: req.params.userId,
                role: req.query.role || 'student',
                authMethod: 'params'
            };
            return next();
        }

        // If we get here, authentication failed
        console.error('All authentication methods failed');
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            details: 'No valid authentication method found'
        });
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
