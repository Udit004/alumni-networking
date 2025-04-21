const mongoose = require('mongoose');
const notificationService = require('./services/notificationService');

// Load environment variables
require('dotenv').config();

// Use the MongoDB Atlas URI from the environment variables
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    const notifications = await notificationService.notifyAllStudents(
      'Test Notification',
      'This is a test notification for all students',
      'system',
      'test123',
      'system'
    );

    console.log(`Sent ${notifications.length} notifications`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
})
.catch(err => console.error('MongoDB connection error:', err));
