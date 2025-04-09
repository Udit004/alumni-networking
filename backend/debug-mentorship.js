// Debug script for testing mentorship application
const mongoose = require('mongoose');
require('dotenv').config();

// Import the models 
const MentorshipApplication = require('./models/MentorshipApplication');
const Mentorship = require('./models/Mentorship');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testMentorshipApplication() {
  try {
    console.log('Starting test...');
    
    const mentorshipId = '67efde289c841fd73ed31e9c'; // The ID we're testing
    
    // Try to find this mentorship
    const mentorship = await Mentorship.findById(mentorshipId);
    console.log('Found mentorship:', mentorship ? 'Yes' : 'No');
    if (mentorship) {
      console.log('Mentorship details:', {
        id: mentorship._id,
        title: mentorship.title,
        type: typeof mentorship._id,
        stringified: mentorship._id.toString()
      });
    }
    
    // Try creating a test application
    const testApplication = {
      mentorshipId: mentorshipId,
      userId: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      currentYear: '3rd Year',
      program: 'Computer Science',
      skills: ['JavaScript', 'React'],
      experience: 'I have 2 years of experience',
      whyInterested: 'I want to learn more',
      additionalInfo: 'Some additional info'
    };
    
    console.log('Creating test application with data:', testApplication);
    
    // Create application object but don't save yet
    const newApplication = new MentorshipApplication(testApplication);
    
    // Check validation
    try {
      await newApplication.validate();
      console.log('Validation passed!');
    } catch (validationError) {
      console.error('Validation error:', validationError.message);
      console.error('Validation details:', validationError.errors);
    }
    
    // Try to save (this will actually create it in the database)
    try {
      const savedApplication = await newApplication.save();
      console.log('Application saved successfully!');
      console.log('Saved application ID:', savedApplication._id);
    } catch (saveError) {
      console.error('Save error:', saveError.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testMentorshipApplication(); 