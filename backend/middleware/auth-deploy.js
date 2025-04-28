const admin = require('../config/firebase-admin');

// Enhanced authentication middleware with better error handling and logging
const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    // If no token is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided');
      
      // For development, use a mock user
      if (process.env.NODE_ENV !== 'production') {
        console.log('Development mode: Using mock user');
        req.user = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          role: 'teacher'
        };
        return next();
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
    }
    
    // Extract token from Authorization header
    const token = authHeader.split(' ')[1];
    console.log('Token received, verifying...');
    
    try {
      // Verify the token with Firebase
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      console.log('Token verified for user:', decodedToken.uid);
      
      // Set user information on the request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'student' // Default to student if role not specified
      };
      
      next();
    } catch (tokenError) {
      console.warn('Token verification failed:', tokenError.message);
      
      // For development, still allow the request with a mock user
      if (process.env.NODE_ENV !== 'production') {
        console.log('Development mode: Using mock user despite token verification failure');
        req.user = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          role: 'teacher'
        };
        return next();
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid authentication token',
        error: tokenError.message
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    
    // For development, still allow the request
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode: Using mock user despite authentication error');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        role: 'teacher'
      };
      return next();
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Verify token without requiring authentication
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || 'student'
        };
      } catch (error) {
        console.warn('Token verification failed in verifyToken middleware:', error.message);
        // Continue without setting req.user
      }
    }
    
    // Always continue to the next middleware
    next();
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    next();
  }
};

module.exports = { auth, verifyToken };
