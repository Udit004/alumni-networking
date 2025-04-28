/**
 * Create a mock user for development mode
 * @param {Object} req - Express request object
 * @returns {Object} - Mock user object
 */
const createMockUser = (req) => {
    // Get user ID from query params, URL params, or use a default
    const userId = req.query.firebaseUID || req.query.userId || req.params.userId || req.body?.userId ||
                  req.params.teacherId || // For teacher routes
                  req.params.studentId || // For student routes
                  '4EOWySj0hHfLOCWFxi3JeJYsqTj2';

    // Get role from query params or use a default
    // If the URL contains 'teacher', default to teacher role
    let defaultRole = 'student';
    if (req.path.includes('teacher') || req.originalUrl.includes('teacher')) {
        defaultRole = 'teacher';
    } else if (req.path.includes('alumni') || req.originalUrl.includes('alumni')) {
        defaultRole = 'alumni';
    }

    const role = req.query.role || req.body?.role || defaultRole;

    console.log(`Creating mock user with ID: ${userId}, role: ${role}`);

    return {
        uid: userId,
        id: userId,
        email: 'dev@example.com',
        role: role,
        mock: true
    };
};

/**
 * Main authentication middleware
 * Always uses mock user in development mode
 */
const auth = async (req, res, next) => {
    try {
        // Always use mock user in development mode
        console.log('Development mode: Using mock user authentication');
        req.user = createMockUser(req);
        return next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Verify token middleware for optional authentication
 * Always uses mock user in development mode
 */
const verifyToken = async (req, res, next) => {
    try {
        // Always use mock user in development mode
        console.log('Development mode: Using mock user');
        req.user = createMockUser(req);
        return next();
    } catch (error) {
        console.error('Token Verification Error:', error.message);
        next();
    }
};

module.exports = { auth, verifyToken };
