const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Mock data
const mockData = {
  teachers: {
    'iwChlYIfp6NdayA05UPg9sZSZsE2': {
      _id: 'iwChlYIfp6NdayA05UPg9sZSZsE2',
      name: 'Demo Teacher',
      email: 'teacher@example.com',
      role: 'teacher',
      department: 'Computer Science',
      institution: 'Demo University',
      designation: 'Professor',
      expertise: ['Web Development', 'Machine Learning', 'Data Science'],
      bio: 'Experienced educator with a passion for teaching technology.',
      officeHours: ['Monday 10-12', 'Wednesday 2-4'],
      officeLocation: 'Building A, Room 101',
      researchInterests: 'AI, Web Technologies, Education',
      coursesTaught: 'Web Development, Data Structures, Algorithms',
      certifications: ['Certified Educator', 'Web Development Expert']
    }
  },
  courses: [
    {
      _id: '1',
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of web development',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      capacity: 30,
      enrolledStudents: 15,
      teacherId: 'iwChlYIfp6NdayA05UPg9sZSZsE2'
    },
    {
      _id: '2',
      title: 'Advanced JavaScript',
      description: 'Master JavaScript programming',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      capacity: 25,
      enrolledStudents: 20,
      teacherId: 'iwChlYIfp6NdayA05UPg9sZSZsE2'
    }
  ],
  notifications: [
    {
      id: '1',
      userId: 'iwChlYIfp6NdayA05UPg9sZSZsE2',
      message: 'New course enrollment request',
      type: 'course',
      read: false,
      timestamp: new Date()
    },
    {
      id: '2',
      userId: 'iwChlYIfp6NdayA05UPg9sZSZsE2',
      message: 'New connection request',
      type: 'connection',
      read: false,
      timestamp: new Date()
    },
    {
      id: '3',
      userId: 'iwChlYIfp6NdayA05UPg9sZSZsE2',
      message: 'Your course has been approved',
      type: 'course',
      read: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      userId: 'iwChlYIfp6NdayA05UPg9sZSZsE2',
      message: 'New announcement in your course',
      type: 'announcement',
      read: true,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ],
  materials: [
    {
      _id: '1',
      title: 'Introduction to HTML',
      description: 'Learn the basics of HTML',
      fileUrl: 'https://example.com/intro-html.pdf',
      teacherId: 'iwChlYIfp6NdayA05UPg9sZSZsE2'
    },
    {
      _id: '2',
      title: 'CSS Fundamentals',
      description: 'Master CSS styling',
      fileUrl: 'https://example.com/css-fundamentals.pdf',
      teacherId: 'iwChlYIfp6NdayA05UPg9sZSZsE2'
    }
  ]
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Mock server is running' });
});

// Teacher profile
app.get('/api/teachers/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const teacher = mockData.teachers[teacherId];
  
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher not found'
    });
  }
  
  res.json({
    success: true,
    teacher
  });
});

// Teacher courses
app.get('/api/courses/teacher/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const courses = mockData.courses.filter(course => course.teacherId === teacherId);
  
  res.json({
    success: true,
    courses
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }
  
  const notifications = mockData.notifications.filter(notification => notification.userId === userId);
  
  res.json({
    success: true,
    notifications
  });
});

// Materials
app.get('/api/materials', (req, res) => {
  res.json({
    success: true,
    materials: mockData.materials
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/health');
  console.log('- GET /api/teachers/:teacherId');
  console.log('- GET /api/courses/teacher/:teacherId');
  console.log('- GET /api/notifications?userId=:userId');
  console.log('- GET /api/materials');
});
