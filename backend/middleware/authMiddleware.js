const admin = require('../config/firebase-admin');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        // Disable mock authentication for security
        const useMockAuth = false;
        const useDeployedMockAuth = false;

        if (!token) {
            // Use mock user if configured to do so
            if (useMockAuth || useDeployedMockAuth) {
                console.log('⚠️ Using mock user due to missing token (SKIP_AUTH or RENDER_MOCK_AUTH enabled)');

                // Extract user ID from request if available
                const userId = req.query.userId || req.params.userId ||
                               req.body.userId || req.body.user_id ||
                               req.body.uid || 'mock-user-id';

                // Extract role from request if available
                const role = req.query.role || req.body.role || 'student';

                req.user = {
                    id: userId,
                    uid: userId, // Add uid for compatibility
                    email: `${userId}@example.com`,
                    role: role
                };

                console.log(`🔑 Using mock user: ${userId} with role ${role}`);
                return next();
            }

            return res.status(401).json({
                success: false,
                message: 'No authentication token provided',
                authInfo: {
                    headerPresent: !!req.headers.authorization,
                    tokenFormat: req.headers.authorization ? 'Invalid format' : 'Missing'
                }
            });
        }

        try {
            // Verify the Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Add user info to request
            req.user = {
                id: decodedToken.uid,
                uid: decodedToken.uid, // Add uid for compatibility
                email: decodedToken.email,
                role: decodedToken.role || 'student', // Default to student if role not set
                // Add additional user info if available
                displayName: decodedToken.name || decodedToken.displayName,
                photoURL: decodedToken.picture || decodedToken.photoURL,
                // Add token info for debugging
                tokenInfo: {
                    iss: decodedToken.iss,
                    aud: decodedToken.aud,
                    exp: decodedToken.exp,
                    auth_time: decodedToken.auth_time
                }
            };

            console.log(`✅ Authenticated user: ${req.user.id} with role ${req.user.role}`);
            next();
        } catch (verifyError) {
            console.error('Token verification failed, using mock user for development:', verifyError);

            // Use mock user if configured to do so
            if (useMockAuth || useDeployedMockAuth) {
                console.log('⚠️ Using mock user after token verification failure');

                // Since we have proper Firebase credentials now, we don't need this complex extraction
                // Just use a simple mock user ID
                let userId = 'mock-user-id';

                // Extract role from request if available
                const role = req.query.role || req.body.role || 'teacher';

                req.user = {
                    id: userId,
                    uid: userId, // Add uid for compatibility
                    email: `${userId.replace(/[^a-zA-Z0-9]/g, '')}@example.com`,
                    role: role
                };

                console.log(`User for request: ${JSON.stringify(req.user, null, 2)}`);
                return next();
            }

            throw verifyError;
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);

        // Provide more detailed error information
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message,
            errorType: error.name || 'Unknown',
            // Include token info for debugging (without revealing the full token)
            tokenInfo: req.headers.authorization ? {
                format: req.headers.authorization.startsWith('Bearer ') ? 'Bearer' : 'Unknown',
                length: req.headers.authorization.split(' ')[1]?.length || 0,
                prefix: req.headers.authorization.split(' ')[1]?.substring(0, 10) || ''
            } : null
        });
    }
};

// Middleware that attempts authentication but doesn't require it
exports.attemptAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        // Disable mock authentication for security
        const useMockAuth = false;
        const useDeployedMockAuth = false;

        if (!token) {
            // Use mock user if configured to do so
            if (useMockAuth || useDeployedMockAuth) {
                console.log('⚠️ Using mock user in attemptAuth (SKIP_AUTH or RENDER_MOCK_AUTH enabled)');

                // Extract user ID from request if available
                const userId = req.query.userId || req.params.userId ||
                               req.body.userId || req.body.user_id ||
                               req.body.uid || 'mock-user-id';

                // Extract role from request if available
                const role = req.query.role || req.body.role || 'student';

                req.user = {
                    id: userId,
                    uid: userId,
                    email: `${userId}@example.com`,
                    role: role,
                    isMockUser: true
                };

                return next();
            }

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
                uid: decodedToken.uid,
                email: decodedToken.email,
                role: decodedToken.role || 'student', // Default to student if role not set
                // Add additional user info if available
                displayName: decodedToken.name || decodedToken.displayName,
                photoURL: decodedToken.picture || decodedToken.photoURL,
                // Add token info for debugging
                tokenInfo: {
                    iss: decodedToken.iss,
                    aud: decodedToken.aud,
                    exp: decodedToken.exp,
                    auth_time: decodedToken.auth_time
                }
            };

            console.log(`✅ Authenticated user in attemptAuth: ${req.user.id} with role ${req.user.role}`);
        } catch (verifyError) {
            console.log('Token verification failed in attemptAuth middleware:', verifyError.message);

            // Use mock user if configured to do so
            if (useMockAuth || useDeployedMockAuth) {
                console.log('⚠️ Using mock user in attemptAuth after token verification failure');

                // Since we have proper Firebase credentials now, we don't need this complex extraction
                // Just use a simple mock user ID
                let userId = 'mock-user-id';

                // Extract role from request if available
                const role = req.query.role || req.body.role || 'student';

                req.user = {
                    id: userId,
                    uid: userId,
                    email: `${userId.replace(/[^a-zA-Z0-9]/g, '')}@example.com`,
                    role: role,
                    isMockUser: true
                };
            }
            // Continue without setting req.user if not using mock auth
        }

        // Always continue to the next middleware
        next();
    } catch (error) {
        console.error('Error in attemptAuth middleware:', error);
        // Don't let errors in this middleware block the request
        next();
    }
};