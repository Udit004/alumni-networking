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
          return course.students.includes(studentId);
        }
        // Check if the student is in the registeredStudents array
        if (Array.isArray(course.registeredStudents)) {
          return course.registeredStudents.includes(studentId);
        }
        return false;
      });

    return enrolledCourses;
  } catch (error) {
    console.error('Error fetching student courses from Firestore:', error);
    return [];
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
