/**
 * Script to generate test activities for users
 * 
 * Run with: node scripts/generateTestActivities.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Activity = require('../models/Activity');
const Job = require('../models/Job');
const Mentorship = require('../models/Mentorship');
const Course = require('../models/Course');
const Event = require('../models/Event');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Activity types
const activityTypes = [
  'course_enrollment',
  'course_completion',
  'assignment_submission',
  'assignment_graded',
  'event_registration',
  'event_attendance',
  'job_application',
  'job_status_change',
  'mentorship_application',
  'mentorship_status_change',
  'connection_request',
  'connection_accepted',
  'announcement_created',
  'announcement_read',
  'profile_update',
  'course_created',
  'job_posted',
  'mentorship_posted'
];

// Generate random activities for a user
const generateActivitiesForUser = async (user) => {
  console.log(`Generating activities for user: ${user.name} (${user.role})`);
  
  // Get some real data from the database
  const jobs = await Job.find().limit(5);
  const mentorships = await Mentorship.find().limit(5);
  const courses = await Course.find().limit(5);
  const events = await Event.find().limit(5);
  const users = await User.find({ _id: { $ne: user._id } }).limit(5);
  
  // Generate 5-10 random activities
  const numActivities = Math.floor(Math.random() * 6) + 5;
  const activities = [];
  
  for (let i = 0; i < numActivities; i++) {
    // Determine activity type based on user role
    let type;
    if (user.role === 'student') {
      // Students can have any activity except posting jobs/mentorships/courses
      type = activityTypes.filter(t => 
        !['job_posted', 'mentorship_posted', 'course_created'].includes(t)
      )[Math.floor(Math.random() * (activityTypes.length - 3))];
    } else if (user.role === 'alumni') {
      // Alumni can have job/mentorship posting activities and connections
      type = ['job_posted', 'mentorship_posted', 'connection_request', 'connection_accepted', 'profile_update'][Math.floor(Math.random() * 5)];
    } else if (user.role === 'teacher') {
      // Teachers can have course creation activities and connections
      type = ['course_created', 'announcement_created', 'connection_request', 'connection_accepted', 'profile_update'][Math.floor(Math.random() * 5)];
    }
    
    // Create activity data
    const activityData = {
      userId: user._id.toString(),
      type,
      isRead: Math.random() > 0.7, // 30% chance of being unread
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random time in the last week
    };
    
    // Add type-specific data
    switch (type) {
      case 'job_application':
      case 'job_status_change':
        if (jobs.length > 0) {
          const job = jobs[Math.floor(Math.random() * jobs.length)];
          activityData.title = type === 'job_application' ? 'Applied for a job' : 'Job application status updated';
          activityData.description = type === 'job_application' 
            ? `You applied for ${job.title} at ${job.company}`
            : `Your application for ${job.title} at ${job.company} has been ${['accepted', 'rejected'][Math.floor(Math.random() * 2)]}`;
          activityData.relatedItemId = job._id.toString();
          activityData.relatedItemType = 'job';
          activityData.relatedItemName = job.title;
          activityData.status = type === 'job_application' ? 'pending' : ['accepted', 'rejected'][Math.floor(Math.random() * 2)];
        } else {
          activityData.title = type === 'job_application' ? 'Applied for a job' : 'Job application status updated';
          activityData.description = type === 'job_application' 
            ? 'You applied for Software Developer at Tech Company'
            : 'Your job application has been updated';
          activityData.relatedItemId = mongoose.Types.ObjectId().toString();
          activityData.relatedItemType = 'job';
          activityData.relatedItemName = 'Software Developer';
          activityData.status = type === 'job_application' ? 'pending' : ['accepted', 'rejected'][Math.floor(Math.random() * 2)];
        }
        break;
        
      case 'mentorship_application':
      case 'mentorship_status_change':
        if (mentorships.length > 0) {
          const mentorship = mentorships[Math.floor(Math.random() * mentorships.length)];
          activityData.title = type === 'mentorship_application' ? 'Applied for mentorship' : 'Mentorship application status updated';
          activityData.description = type === 'mentorship_application' 
            ? `You applied for ${mentorship.title} mentorship`
            : `Your application for ${mentorship.title} mentorship has been ${['accepted', 'rejected'][Math.floor(Math.random() * 2)]}`;
          activityData.relatedItemId = mentorship._id.toString();
          activityData.relatedItemType = 'mentorship';
          activityData.relatedItemName = mentorship.title;
          activityData.relatedUserId = mentorship.mentorId;
          activityData.relatedUserName = mentorship.mentorName || 'Mentor';
          activityData.status = type === 'mentorship_application' ? 'pending' : ['accepted', 'rejected'][Math.floor(Math.random() * 2)];
        } else {
          activityData.title = type === 'mentorship_application' ? 'Applied for mentorship' : 'Mentorship application status updated';
          activityData.description = type === 'mentorship_application' 
            ? 'You applied for Career Development mentorship'
            : 'Your mentorship application has been updated';
          activityData.relatedItemId = mongoose.Types.ObjectId().toString();
          activityData.relatedItemType = 'mentorship';
          activityData.relatedItemName = 'Career Development';
          activityData.relatedUserId = mongoose.Types.ObjectId().toString();
          activityData.relatedUserName = 'John Mentor';
          activityData.status = type === 'mentorship_application' ? 'pending' : ['accepted', 'rejected'][Math.floor(Math.random() * 2)];
        }
        break;
        
      case 'course_enrollment':
      case 'course_completion':
        if (courses.length > 0) {
          const course = courses[Math.floor(Math.random() * courses.length)];
          activityData.title = type === 'course_enrollment' ? 'Enrolled in a course' : 'Completed a course';
          activityData.description = type === 'course_enrollment' 
            ? `You enrolled in ${course.title}`
            : `You completed ${course.title}`;
          activityData.relatedItemId = course._id.toString();
          activityData.relatedItemType = 'course';
          activityData.relatedItemName = course.title;
          activityData.relatedUserId = course.createdBy;
          activityData.relatedUserName = course.createdByName || 'Teacher';
        } else {
          activityData.title = type === 'course_enrollment' ? 'Enrolled in a course' : 'Completed a course';
          activityData.description = type === 'course_enrollment' 
            ? 'You enrolled in Web Development'
            : 'You completed Web Development';
          activityData.relatedItemId = mongoose.Types.ObjectId().toString();
          activityData.relatedItemType = 'course';
          activityData.relatedItemName = 'Web Development';
          activityData.relatedUserId = mongoose.Types.ObjectId().toString();
          activityData.relatedUserName = 'Professor Smith';
        }
        break;
        
      case 'event_registration':
      case 'event_attendance':
        if (events.length > 0) {
          const event = events[Math.floor(Math.random() * events.length)];
          activityData.title = type === 'event_registration' ? 'Registered for an event' : 'Attended an event';
          activityData.description = type === 'event_registration' 
            ? `You registered for ${event.title}`
            : `You attended ${event.title}`;
          activityData.relatedItemId = event._id.toString();
          activityData.relatedItemType = 'event';
          activityData.relatedItemName = event.title;
        } else {
          activityData.title = type === 'event_registration' ? 'Registered for an event' : 'Attended an event';
          activityData.description = type === 'event_registration' 
            ? 'You registered for Tech Conference'
            : 'You attended Tech Conference';
          activityData.relatedItemId = mongoose.Types.ObjectId().toString();
          activityData.relatedItemType = 'event';
          activityData.relatedItemName = 'Tech Conference';
        }
        break;
        
      case 'connection_request':
      case 'connection_accepted':
        if (users.length > 0) {
          const otherUser = users[Math.floor(Math.random() * users.length)];
          activityData.title = type === 'connection_request' ? 'Sent a connection request' : 'Connection request accepted';
          activityData.description = type === 'connection_request' 
            ? `You sent a connection request to ${otherUser.name}`
            : `${otherUser.name} accepted your connection request`;
          activityData.relatedUserId = otherUser._id.toString();
          activityData.relatedUserName = otherUser.name;
          activityData.relatedItemType = 'connection';
          activityData.status = type === 'connection_request' ? 'pending' : 'accepted';
        } else {
          activityData.title = type === 'connection_request' ? 'Sent a connection request' : 'Connection request accepted';
          activityData.description = type === 'connection_request' 
            ? 'You sent a connection request to Jane Doe'
            : 'Jane Doe accepted your connection request';
          activityData.relatedUserId = mongoose.Types.ObjectId().toString();
          activityData.relatedUserName = 'Jane Doe';
          activityData.relatedItemType = 'connection';
          activityData.status = type === 'connection_request' ? 'pending' : 'accepted';
        }
        break;
        
      case 'job_posted':
        activityData.title = 'Posted a job';
        activityData.description = 'You posted a new job: Software Developer';
        activityData.relatedItemId = jobs.length > 0 ? jobs[0]._id.toString() : mongoose.Types.ObjectId().toString();
        activityData.relatedItemType = 'job';
        activityData.relatedItemName = 'Software Developer';
        break;
        
      case 'mentorship_posted':
        activityData.title = 'Posted a mentorship opportunity';
        activityData.description = 'You posted a new mentorship opportunity: Career Development';
        activityData.relatedItemId = mentorships.length > 0 ? mentorships[0]._id.toString() : mongoose.Types.ObjectId().toString();
        activityData.relatedItemType = 'mentorship';
        activityData.relatedItemName = 'Career Development';
        break;
        
      case 'course_created':
        activityData.title = 'Created a course';
        activityData.description = 'You created a new course: Web Development';
        activityData.relatedItemId = courses.length > 0 ? courses[0]._id.toString() : mongoose.Types.ObjectId().toString();
        activityData.relatedItemType = 'course';
        activityData.relatedItemName = 'Web Development';
        break;
        
      case 'profile_update':
        activityData.title = 'Updated your profile';
        activityData.description = 'You updated your profile information';
        activityData.relatedItemType = 'profile';
        break;
        
      case 'announcement_created':
      case 'announcement_read':
        activityData.title = type === 'announcement_created' ? 'Created an announcement' : 'Read an announcement';
        activityData.description = type === 'announcement_created' 
          ? 'You created a new announcement: Course Update'
          : 'You read the announcement: Course Update';
        activityData.relatedItemId = mongoose.Types.ObjectId().toString();
        activityData.relatedItemType = 'announcement';
        activityData.relatedItemName = 'Course Update';
        break;
        
      default:
        activityData.title = 'New activity';
        activityData.description = 'You have a new activity';
        break;
    }
    
    activities.push(activityData);
  }
  
  return activities;
};

// Main function
const generateTestActivities = async () => {
  try {
    // Get all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('No users found in the database');
      process.exit(0);
    }
    
    console.log(`Found ${users.length} users`);
    
    // Generate activities for each user
    let totalActivities = 0;
    
    for (const user of users) {
      const activities = await generateActivitiesForUser(user);
      
      if (activities.length > 0) {
        // Insert activities into the database
        await Activity.insertMany(activities);
        totalActivities += activities.length;
        console.log(`Created ${activities.length} activities for user ${user.name}`);
      }
    }
    
    console.log(`Successfully created ${totalActivities} test activities`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating test activities:', error);
    process.exit(1);
  }
};

// Run the script
generateTestActivities();
