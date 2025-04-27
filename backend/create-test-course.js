const mongoose = require('mongoose');
const Course = require('./models/Course');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/alumni-network')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Create a test course
      const testCourse = new Course({
        courseId: 'TEST-101',
        title: 'Test Course for Materials',
        description: 'This is a test course created to test adding materials to courses',
        teacherId: 'test-teacher-id',
        teacherName: 'Test Teacher',
        schedule: 'Mon-Wed-Fri, 10:00-11:30 AM',
        room: 'Room 101',
        thumbnail: 'https://source.unsplash.com/random/800x600/?course',
        students: [],
        maxStudents: 30,
        status: 'active',
        term: 'Spring 2023',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-05-15'),
        nextClass: new Date('2023-04-05T10:00:00')
      });
      
      // Add a test material to the course
      testCourse.materials.push({
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Test Course Syllabus',
        description: 'Syllabus for the test course with schedule and requirements',
        type: 'notes',
        fileName: 'syllabus.pdf',
        fileUrl: 'https://example.com/syllabus.pdf',
        icon: '📝',
        color: 'blue',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Save the course
      await testCourse.save();
      console.log('Test course created with ID:', testCourse._id);
      console.log('Test course has materials:', testCourse.materials.length);
      
    } catch (error) {
      console.error('Error creating test course:', error);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err)); 