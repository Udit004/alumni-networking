/**
 * CORS Middleware
 * 
 * This middleware provides additional CORS handling for preflight requests
 * and ensures proper headers are set for all responses.
 */

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'https://alumni-networking.vercel.app',
  'https://alumni-networking-89f98.web.app',
  'https://alumni-networking-89f98.firebaseapp.com',
  'https://alumni-networking.onrender.com',
  'https://alumni-networking-frontend.vercel.app'
];

/**
 * CORS preflight handler middleware
 * Handles OPTIONS requests and sets appropriate CORS headers
 */
const corsPreflightHandler = (req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Log the request for debugging
  console.log(`🔍 CORS Middleware - ${req.method} ${req.path} from origin: ${origin || 'No origin'}`);
  
  // Check if the origin is allowed
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
  
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', isAllowedOrigin ? origin : 'null');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Accept-Encoding, Accept-Language');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(204).end();
  }
  
  // Continue to the next middleware
  next();
};

module.exports = {
  corsPreflightHandler,
  allowedOrigins
};
