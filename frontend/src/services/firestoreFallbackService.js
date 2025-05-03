/**
 * Firestore Fallback Service
 *
 * This service provides fallback functionality using Firestore when backend services are unavailable.
 * It implements simplified versions of the backend APIs using direct Firestore access.
 */

import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

/**
 * Get courses for a teacher
 * @param {string} teacherId - Teacher's ID
 * @returns {Promise<Array>} - List of courses
 */
export const getTeacherCourses = async (teacherId) => {
  try {
    console.log('Using Firestore fallback for teacher courses');
    const coursesRef = collection(db, 'courses');
    const q = query(
      coursesRef,
      where('teacherId', '==', teacherId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching teacher courses from Firestore:', error);
    return [];
  }
};

/**
 * Mock courses data for fallback
 */
const mockCourses = [
  {
    id: 'mock-course-1',
    courseId: 'CS101',
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of computer science and programming',
    teacherId: 'teacher-123',
    teacherName: 'Dr. Smith',
    schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
    room: 'Room 101',
    thumbnail: 'https://source.unsplash.com/random/800x600/?computer',
    students: [],
    maxStudents: 50,
    progress: 0,
    status: 'active',
    term: 'Fall 2023',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    materials: []
  },
  {
    id: 'mock-course-2',
    courseId: 'MATH201',
    title: 'Advanced Mathematics',
    description: 'Explore advanced mathematical concepts and their applications',
    teacherId: 'teacher-456',
    teacherName: 'Prof. Johnson',
    schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
    room: 'Room 202',
    thumbnail: 'https://source.unsplash.com/random/800x600/?math',
    students: [],
    maxStudents: 40,
    progress: 0,
    status: 'active',
    term: 'Spring 2024',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
    materials: []
  }
];

/**
 * Get courses for a student
 * @param {string} studentId - Student's ID
 * @returns {Promise<Array>} - List of courses
 */
export const getStudentCourses = async (studentId) => {
  try {
    console.log('Using Firestore fallback for student courses');
    const coursesRef = collection(db, 'courses');
    const querySnapshot = await getDocs(coursesRef);

    // Filter courses where the student is enrolled
    const enrolledCourses = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(course => {
        // Check if the student is in the enrolledStudents array
        if (Array.isArray(course.enrolledStudents)) {
          return course.enrolledStudents.includes(studentId);
        }
        // Check if the student is in the students array
        if (Array.isArray(course.students)) {
          return course.students.includes(studentId) ||
                 course.students.some(student =>
                   typeof student === 'object' && student.studentId === studentId
                 );
        }
        // Check if the student is in the registeredStudents array
        if (Array.isArray(course.registeredStudents)) {
          return course.registeredStudents.includes(studentId);
        }
        return false;
      });

    // If no courses found, return mock data for development
    if (enrolledCourses.length === 0) {
      console.log('No courses found in Firestore, using mock data');

      // Create a copy of the mock courses with the student enrolled
      const mockCoursesWithStudent = mockCourses.map(course => ({
        ...course,
        students: [
          ...course.students,
          {
            studentId: studentId,
            studentName: 'Student User',
            enrolledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
          }
        ]
      }));

      return mockCoursesWithStudent;
    }

    return enrolledCourses;
  } catch (error) {
    console.error('Error fetching student courses from Firestore:', error);

    // Return mock data if there's an error
    console.log('Error in Firestore, using mock data');

    // Create a copy of the mock courses with the student enrolled
    const mockCoursesWithStudent = mockCourses.map(course => ({
      ...course,
      students: [
        ...course.students,
        {
          studentId: studentId,
          studentName: 'Student User',
          enrolledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        }
      ]
    }));

    return mockCoursesWithStudent;
  }
};

/**
 * Get events for a user
 * @param {string} userId - User's ID
 * @param {string} role - User's role
 * @returns {Promise<Array>} - List of events
 */
export const getUserEvents = async (userId, role) => {
  try {
    console.log('Using Firestore fallback for user events');
    const eventsRef = collection(db, 'events');
    let q;

    if (role === 'teacher') {
      // Teachers can see all events
      q = query(eventsRef, orderBy('date', 'desc'));
    } else {
      // Students and alumni see events relevant to them
      q = query(
        eventsRef,
        where('targetAudience', 'array-contains', role),
        orderBy('date', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user events from Firestore:', error);
    return [];
  }
};

/**
 * Get enrolled events for a student
 * @param {string} studentId - Student's ID
 * @returns {Promise<Array>} - List of enrolled events
 */
export const getStudentEnrolledEvents = async (studentId) => {
  try {
    console.log('Using Firestore fallback for student enrolled events');
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);

    // Process events data
    const allEvents = [];
    querySnapshot.forEach(doc => {
      const eventData = doc.data();
      // Convert Firestore timestamp to Date if it exists
      if (eventData.date && typeof eventData.date.toDate === 'function') {
        eventData.date = eventData.date.toDate();
      }

      allEvents.push({
        _id: doc.id,
        id: doc.id, // Add both _id and id for compatibility
        ...eventData
      });
    });

    // Filter events where student is registered
    const enrolledEvents = allEvents.filter(event => {
      // Check different possible structures for registered users
      if (Array.isArray(event.registeredUsers)) {
        // Check if registeredUsers contains the user ID directly
        if (event.registeredUsers.includes(studentId)) {
          return true;
        }

        // Check if registeredUsers contains objects with userId field
        return event.registeredUsers.some(ru => {
          if (typeof ru === 'string') {
            return ru === studentId;
          }
          return ru && (ru.userId === studentId || (ru.userId && ru.userId._id === studentId));
        });
      }

      // Check if the user is in the attendees array
      if (Array.isArray(event.attendees)) {
        return event.attendees.includes(studentId);
      }

      // Check if the user is in the participants array
      if (Array.isArray(event.participants)) {
        return event.participants.includes(studentId);
      }

      return false;
    });

    return enrolledEvents;
  } catch (error) {
    console.error('Error fetching student enrolled events from Firestore:', error);
    return [];
  }
};

// Chat-related functions removed
