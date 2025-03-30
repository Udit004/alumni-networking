# Deployment Guide for Alumni Networking Application

This guide provides instructions for deploying both the backend and frontend components of the Alumni Networking application to production environments.

## Backend Deployment

### Prerequisites
- MongoDB Atlas account or other MongoDB hosting
- Node.js hosting platform (Heroku, Render, Digital Ocean, AWS, etc.)
- Environment variables configured in your hosting platform

### Environment Variables
The backend requires the following environment variables:

```
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### Deployment Steps

1. **Prepare for deployment**:
   ```bash
   cd backend
   npm run build # If you have a build script
   ```

2. **Deploy to hosting platform**:
   - **Heroku**:
     ```bash
     heroku create
     git push heroku main
     ```
   
   - **Render**:
     - Create a new Web Service
     - Connect your GitHub repository
     - Set build command: `npm install`
     - Set start command: `npm start`
     - Add environment variables in the dashboard

3. **Configure CORS**:
   - Make sure to add your frontend domain to the `allowedOrigins` array in `server.js`

4. **Verify deployment**:
   - Test the health endpoint: `https://your-backend-url.com/api/health`
   - It should return: `{"status":"ok","message":"Backend is running"}`

## Frontend Deployment

### Prerequisites
- Firebase account (for authentication)
- Web hosting platform (Vercel, Netlify, Firebase Hosting, etc.)
- Environment variables configured in your hosting platform

### Environment Variables
Create these environment variables in your hosting platform:

```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Deployment Steps

1. **Prepare for deployment**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to hosting platform**:
   - **Vercel**:
     - Connect your GitHub repository
     - Set the framework preset to React
     - Configure environment variables in the Vercel dashboard
     - Deploy

   - **Netlify**:
     - Connect your GitHub repository
     - Set build command: `npm run build`
     - Set publish directory: `build`
     - Configure environment variables in the Netlify dashboard
     - Deploy

   - **Firebase Hosting**:
     ```bash
     firebase init
     firebase deploy
     ```

3. **Verify deployment**:
   - Test the application by navigating to your deployed URL
   - Verify authentication works
   - Test creating events and other features

## Troubleshooting

### Backend Issues
- **MongoDB Connection Errors**: Verify your MongoDB connection string and network access settings
- **CORS Errors**: Make sure your frontend domain is added to the `allowedOrigins` array
- **Port Already in Use**: Set a different PORT in environment variables

### Frontend Issues
- **API Connection Errors**: Check if REACT_APP_API_URL is correctly set
- **Firebase Authentication Issues**: Verify Firebase configuration and enable Email/Password authentication in Firebase Console
- **Blank Pages**: Check browser console for JavaScript errors

## Post-Deployment

1. **Monitor the application**:
   - Set up logging (e.g., Papertrail, LogRocket)
   - Monitor server health and performance

2. **Security checks**:
   - Ensure all API endpoints are properly secured
   - Verify proper authentication is required for sensitive operations
   - Check Firebase Rules are configured properly

3. **Backup strategy**:
   - Configure regular database backups
   - Document restore procedures

## Production Considerations

- Consider setting up a Content Delivery Network (CDN) for static assets
- Implement rate limiting for API endpoints
- Set up monitoring and alerting for system health
- Configure automatic database backups
- Set up a staging environment for testing future updates 