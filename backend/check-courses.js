const mongoose = require('mongoose');
const Course = require('./models/Course');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/alumni-network')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Count courses
      const count = await Course.countDocuments();
      console.log('Total courses:', count);
      
      // Get a sample course if any exist
      if (count > 0) {
        const course = await Course.findOne();
        console.log('Sample course:', {
          id: course._id,
          title: course.title,
          description: course.description?.substring(0, 50) + '...',
          materialsCount: course.materials?.length || 0
        });
        
        // Check if course has materials
        if (course.materials && course.materials.length > 0) {
          console.log('Sample material:', course.materials[0]);
        } else {
          console.log('No materials found in this course');
        }
      } else {
        console.log('No courses found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err)); 