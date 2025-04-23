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

/**
 * Get conversations for a user
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} - List of conversations
 */
export const getUserConversations = async (userId) => {
  try {
    console.log('Using Firestore fallback for user conversations');

    // Get all messages where the user is in participants
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);

    // Process messages into conversations
    const conversationsMap = new Map();

    querySnapshot.forEach((doc) => {
      const message = { id: doc.id, ...doc.data() };
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: message.content,
          timestamp: message.createdAt,
          unreadCount: message.read ? 0 : (message.receiverId === userId ? 1 : 0)
        });
      }
    });

    return Array.from(conversationsMap.values());
  } catch (error) {
    console.error('Error fetching user conversations from Firestore:', error);
    return [];
  }
};

/**
 * Get messages between two users
 * @param {string} userId1 - First user's ID
 * @param {string} userId2 - Second user's ID
 * @returns {Promise<Array>} - List of messages
 */
export const getMessagesBetweenUsers = async (userId1, userId2) => {
  try {
    console.log('Using Firestore fallback for messages between users');

    // Get all messages where userId1 is in participants
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', userId1)
    );

    const querySnapshot = await getDocs(q);

    // Filter for messages between these two specific users
    const messages = querySnapshot.docs
      .map(doc => ({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }))
      .filter(msg =>
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt - b.createdAt);

    return messages;
  } catch (error) {
    console.error('Error fetching messages between users from Firestore:', error);
    return [];
  }
};

/**
 * Send a message between two users
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} - Sent message
 */
export const sendMessage = async (messageData) => {
  try {
    console.log('Using Firestore fallback for sending message');

    const { senderId, receiverId, content, senderRole, receiverRole } = messageData;

    // Create the message document
    const newMessage = {
      senderId,
      receiverId,
      content,
      senderRole: senderRole || 'unknown',
      receiverRole: receiverRole || 'unknown',
      createdAt: serverTimestamp(),
      read: false,
      participants: [senderId, receiverId]
    };

    const messageRef = await addDoc(collection(db, 'messages'), newMessage);

    return {
      _id: messageRef.id,
      ...newMessage,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error sending message via Firestore:', error);
    throw error;
  }
};

/**
 * Set up a real-time listener for messages between two users
 * @param {string} userId1 - First user's ID
 * @param {string} userId2 - Second user's ID
 * @param {Function} callback - Callback function to handle messages
 * @returns {Function} - Unsubscribe function
 */
export const setupMessagesListener = (userId1, userId2, callback) => {
  try {
    console.log('Using Firestore fallback for messages listener');

    // Get all messages where userId1 is in participants
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', userId1)
    );

    // Set up the listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Filter for messages between these two specific users
      const messages = snapshot.docs
        .map(doc => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }))
        .filter(msg =>
          (msg.senderId === userId1 && msg.receiverId === userId2) ||
          (msg.senderId === userId2 && msg.receiverId === userId1)
        )
        .sort((a, b) => a.createdAt - b.createdAt);

      callback(messages);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up messages listener via Firestore:', error);
    return () => {}; // Return empty function as fallback
  }
};

/**
 * Mark messages as read
 * @param {string} senderId - Sender's ID
 * @param {string} receiverId - Receiver's ID
 * @returns {Promise<number>} - Number of messages marked as read
 */
export const markMessagesAsRead = async (senderId, receiverId) => {
  try {
    console.log('Using Firestore fallback for marking messages as read');

    // Get all messages where receiverId is in participants
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', receiverId)
    );

    const querySnapshot = await getDocs(q);

    // Filter for unread messages from the specific sender
    const unreadMessages = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.senderId === senderId &&
             data.receiverId === receiverId &&
             data.read === false;
    });

    // Update each message to mark as read
    const updatePromises = unreadMessages.map(document => {
      const messageRef = doc(db, 'messages', document.id);
      return updateDoc(messageRef, { read: true });
    });

    await Promise.all(updatePromises);

    return updatePromises.length;
  } catch (error) {
    console.error('Error marking messages as read via Firestore:', error);
    return 0;
  }
};
