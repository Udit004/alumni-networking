/**
 * Create a mock user for development mode
 * @param {Object} req - Express request object
 * @returns {Object} - Mock user object
 */
const createMockUser = (req) => {
    // Get user ID from query params, URL params, or use a default
    const userId = req.query.userId || req.params.userId || req.body?.userId || 
                  req.params.teacherId || // For teacher routes
                  req.params.studentId || // For student routes
                  '4EOWySj0hHfLOCWFxi3JeJYsqTj2';

    // Get role from query params or use a default
    // If the URL contains 'teacher', default to teacher role
    let defaultRole = 'student';
    if (req.path.includes('teacher') || req.originalUrl.includes('teacher')) {
        defaultRole = 'teacher';
    }
    
    const role = req.query.role || req.body?.role || defaultRole;

    console.log(`Creating mock user with ID: ${userId}, role: ${role}`);
    
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
        console.log(`Auth middleware called for ${req.method} ${req.path}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        
        // Check if we're in development mode with auth skipping enabled
        if (process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true') {
            console.log('Development mode or SKIP_AUTH enabled: Using mock user authentication');
            req.user = createMockUser(req);
            return next();
        }

        // Get token from Authorization header
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        // Log if token is present
        console.log(`Token present: ${!!token}`);

        // If no token is provided
        if (!token) {
            // In development or if SKIP_AUTH is enabled, use mock user
            if (process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true') {
                console.log('No token provided, using mock user');
                req.user = createMockUser(req);
                return next();
            }
            
            // For deployed environment but not in production mode, be more permissive
            if (process.env.NODE_ENV !== 'production') {
                console.log('Non-production environment: No token provided, using mock user');
                req.user = createMockUser(req);
                return next();
            }

            // In strict production mode, return error
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
            console.log('Verifying Firebase token...');
            const decodedToken = await admin.auth().verifyIdToken(token);
            console.log(`Token verified for user: ${decodedToken.uid}`);

            // Add user info to request
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                role: decodedToken.role || 'student' // Default to student if role not set
            };

            next();
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError.message);

            // For development or non-production - bypass auth if token verification fails
            if (process.env.NODE_ENV !== 'production') {
                console.log('Non-production mode: Bypassing auth after token verification failure');
                req.user = createMockUser(req);
                return next();
            }

            throw verifyError; // Re-throw for the outer catch block
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);

        // In development or non-production, use mock user even on error
        if (process.env.NODE_ENV !== 'production') {
            console.log('Non-production mode: Using mock user after auth error');
            req.user = createMockUser(req);
            return next();
        }

        // In strict production mode, return error
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Verify token middleware for optional authentication
 * Similar to auth middleware but doesn't require authentication
 */
const verifyToken = async (req, res, next) => {
    try {
        console.log(`VerifyToken middleware called for ${req.method} ${req.path}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');

        // Skip auth for development or if SKIP_AUTH is enabled
        if (process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true') {
            console.log('Development mode or SKIP_AUTH enabled: Using mock user');
            req.user = createMockUser(req);
            return next();
        }

        const token = authHeader?.split('Bearer ')[1];

        if (!token) {
            console.log('No token provided in request');

            // In development or non-production, use mock user
            if (process.env.NODE_ENV !== 'production') {
                console.log('Non-production mode: No token provided, using mock user');
                req.user = createMockUser(req);
                return next();
            }
            
            // In production, continue without user info
            console.log('Production mode: No token provided, continuing without user info');
            return next();
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
            console.error('Token verification failed:', verifyError.message);

            // For development or non-production - bypass auth if token verification fails
            if (process.env.NODE_ENV !== 'production') {
                console.log('Non-production mode: Bypassing auth after token verification failure');
                req.user = createMockUser(req);
                return next();
            }
            
            // In production, continue without user info
            console.log('Production mode: Token verification failed, continuing without user info');
            next();
        }
    } catch (error) {
        console.error('Token Verification Error:', error.message);

        // In development or non-production, use mock user even on error
        if (process.env.NODE_ENV !== 'production') {
            console.log('Non-production mode: Using mock user after token verification error');
            req.user = createMockUser(req);
            return next();
        }
        
        // In production, continue without user info
        console.log('Production mode: Error in token verification, continuing without user info');
        next();
    }
};

module.exports = { auth, verifyToken };
