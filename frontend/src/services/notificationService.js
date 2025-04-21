import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  setDoc
} from 'firebase/firestore';

// Ensure collections exist
const ensureCollections = async () => {
  try {
    // We'll use a dummy document to make sure collections exist
    // The document will be immediately deleted
    const dummyData = {
      _dummy: true,
      timestamp: serverTimestamp()
    };

    // Create a unique ID for our dummy document
    const dummyId = `dummy_${Date.now()}`;

    // Log what we're about to do
    console.log('Ensuring notifications collection exists...');

    try {
      // Ensure notifications collection exists by directly setting a document
      const notificationDoc = doc(db, 'notifications', dummyId);
      await setDoc(notificationDoc, dummyData);
      await deleteDoc(notificationDoc);
      console.log('Notifications collection verified');
    } catch (err) {
      console.error('Error with notifications collection:', err);
    }

    console.log('Collections verification completed');
  } catch (error) {
    console.error('Error ensuring collections exist:', error);
  }
};

// Run this when the service is first imported
ensureCollections();

// Create a new notification
export const createNotification = async (notification) => {
  try {
    console.log('Creating notification:', notification);

    if (!notification || !notification.userId) {
      console.error('Invalid notification object:', notification);
      throw new Error('Invalid notification: missing required fields');
    }

    // Make sure timestamp is not undefined
    const timestamp = serverTimestamp();

    const notificationData = {
      ...notification,
      timestamp: timestamp,
      read: false,
      createdAt: new Date().toISOString() // Backup readable timestamp
    };

    console.log('Saving notification to Firestore:', notificationData);

    // Use try/catch specifically for the Firestore operation
    try {
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification created with ID:', docRef.id);

      // Return a representation that can be used immediately (serverTimestamp is null until committed)
      return {
        id: docRef.id,
        ...notificationData,
        timestamp: new Date() // Use a JavaScript Date for immediate use
      };
    } catch (firestoreError) {
      console.error('Firestore error while saving notification:', firestoreError);
      console.error('Notification that failed:', notificationData);
      throw new Error(`Firestore error: ${firestoreError.message}`);
    }
  } catch (error) {
    console.error('Error in createNotification:', error);
    console.error('Original notification data:', notification);
    throw error;
  }
};

// Create a test notification for the current user
export const createTestNotification = async (type = 'system') => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error('No authenticated user found');
      return null;
    }

    const userId = currentUser.uid;

    // Create notification data based on type
    let notificationData = {
      userId,
      read: false
    };

    switch (type) {
      case 'event':
        notificationData = {
          ...notificationData,
          type: 'event',
          title: 'New Event Available',
          message: 'A new event "Career Fair 2023" has been added. Check it out!',
          itemId: 'test-event-' + Date.now(),
          createdBy: 'system'
        };
        break;
      case 'job':
        notificationData = {
          ...notificationData,
          type: 'job',
          title: 'New Job Opportunity',
          message: 'A new job "Software Engineer" at Google has been posted. Apply now!',
          itemId: 'test-job-' + Date.now(),
          createdBy: 'system'
        };
        break;
      case 'course':
        notificationData = {
          ...notificationData,
          type: 'course',
          title: 'New Course Available',
          message: 'A new course "Advanced Web Development" is now available for enrollment.',
          itemId: 'test-course-' + Date.now(),
          createdBy: 'system'
        };
        break;
      case 'mentorship':
        notificationData = {
          ...notificationData,
          type: 'mentorship',
          title: 'New Mentorship Opportunity',
          message: 'A new mentorship program "Career Guidance" is now available.',
          itemId: 'test-mentorship-' + Date.now(),
          createdBy: 'system'
        };
        break;
      default:
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification for the current user.',
          itemId: 'test-' + Date.now(),
          createdBy: 'system'
        };
    }

    // Create the notification
    const notification = await createNotification(notificationData);
    console.log('Test notification created:', notification);
    return notification;
  } catch (error) {
    console.error('Error creating test notification:', error);
    return null;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, limitCount = 20) => {
  if (!userId) {
    console.error('Cannot get notifications: missing userId');
    return [];
  }

  try {
    // First try to get notifications from the backend API
    try {
      const baseUrls = [
        process.env.REACT_APP_API_URL || 'http://localhost:5001',
        'http://localhost:5002',
        'http://localhost:5003',
        'http://localhost:5004',
        'http://localhost:5000'
      ];

      // Get the auth token first to avoid multiple attempts if not authenticated
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No authenticated user found, skipping backend API call');
        throw new Error('No authenticated user');
      }

      const token = await currentUser.getIdToken();

      // Store the working server URL in localStorage if we find one
      const storedWorkingUrl = localStorage.getItem('workingNotificationServerUrl');
      const baseUrlsToTry = storedWorkingUrl
        ? [storedWorkingUrl, ...baseUrls.filter(url => url !== storedWorkingUrl)]
        : baseUrls;

      // Try each base URL until we get a successful response
      for (const baseUrl of baseUrlsToTry) {
        try {
          console.log(`Trying to fetch notifications from ${baseUrl}...`);

          // Add timeout to fetch to prevent long waits
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch(`${baseUrl}/api/notifications`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId); // Clear the timeout if fetch completes

          if (response.ok) {
            const data = await response.json();
            if (data && data.success) {
              console.log(`Found ${data.notifications.length} notifications from ${baseUrl}`);

              // Store the working URL for future use
              localStorage.setItem('workingNotificationServerUrl', baseUrl);

              // Transform the data to match the expected format
              const notifications = data.notifications.map(notification => ({
                id: notification._id || notification.id,
                ...notification,
                timestamp: new Date(notification.createdAt || notification.timestamp)
              }));

              return notifications;
            }
          }
        } catch (err) {
          // Check if it's an abort error (timeout)
          if (err.name === 'AbortError') {
            console.log(`Timeout connecting to ${baseUrl}`);
          } else {
            console.log(`Failed to connect to ${baseUrl}:`, err.message);
          }
        }
      }

      // If backend API fails, fall back to Firebase
      console.log('Falling back to Firebase for notifications...');
    } catch (backendError) {
      console.error('Error fetching notifications from backend:', backendError);
      console.log('Falling back to Firebase for notifications...');
    }

    // Try with Firebase ordering
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      console.log(`Initial notifications loaded from Firebase: ${notifications.length}`);
      return notifications;
    } catch (indexError) {
      // Check if this is a missing index error
      if (indexError.message && indexError.message.includes('index')) {
        console.warn('Missing Firestore index for notifications query. Using fallback query.');

        // Fallback: Get notifications without ordering
        const fallbackQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', userId)
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);
        // Sort in memory instead of using Firestore ordering
        const notifications = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() ||
                    (doc.data().createdAt ? new Date(doc.data().createdAt) : new Date())
        }));

        // Sort manually by timestamp descending
        const sortedNotifications = notifications.sort((a, b) => {
          // Handle potential missing timestamps
          const timeA = b.timestamp instanceof Date ? b.timestamp : new Date();
          const timeB = a.timestamp instanceof Date ? a.timestamp : new Date();
          return timeA - timeB;
        }).slice(0, limitCount);

        console.log(`Initial notifications loaded (fallback): ${sortedNotifications.length}`);
        return sortedNotifications;
      }

      // If it's not an index error, rethrow
      throw indexError;
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    // First try to mark notification as read in the backend API
    try {
      const baseUrls = [
        process.env.REACT_APP_API_URL || 'http://localhost:5001',
        'http://localhost:5002',
        'http://localhost:5003',
        'http://localhost:5004',
        'http://localhost:5000'
      ];

      // Get the auth token
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No authenticated user found, skipping backend API call');
        throw new Error('No authenticated user');
      }

      const token = await currentUser.getIdToken();

      // Use the stored working URL first if available
      const storedWorkingUrl = localStorage.getItem('workingNotificationServerUrl');
      const baseUrlsToTry = storedWorkingUrl
        ? [storedWorkingUrl, ...baseUrls.filter(url => url !== storedWorkingUrl)]
        : baseUrls;

      // Try each base URL until we get a successful response
      for (const baseUrl of baseUrlsToTry) {
        try {
          console.log(`Trying to mark notification as read at ${baseUrl}...`);

          // Add timeout to fetch to prevent long waits
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch(`${baseUrl}/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId); // Clear the timeout if fetch completes

          if (response.ok) {
            const data = await response.json();
            if (data && data.success) {
              console.log(`Successfully marked notification ${notificationId} as read at ${baseUrl}`);

              // Store the working URL for future use
              localStorage.setItem('workingNotificationServerUrl', baseUrl);

              return true;
            }
          }
        } catch (err) {
          // Check if it's an abort error (timeout)
          if (err.name === 'AbortError') {
            console.log(`Timeout connecting to ${baseUrl}`);
          } else {
            console.log(`Failed to connect to ${baseUrl}:`, err.message);
          }
        }
      }

      // If backend API fails, fall back to Firebase
      console.log('Falling back to Firebase for marking notification as read...');
    } catch (backendError) {
      console.error('Error marking notification as read in backend:', backendError);
      console.log('Falling back to Firebase for marking notification as read...');
    }

    // Fall back to Firebase
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    // First try to mark all notifications as read in the backend API
    try {
      const baseUrls = [
        process.env.REACT_APP_API_URL || 'http://localhost:5001',
        'http://localhost:5002',
        'http://localhost:5003',
        'http://localhost:5004',
        'http://localhost:5000'
      ];

      // Get the auth token
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No authenticated user found, skipping backend API call');
        throw new Error('No authenticated user');
      }

      const token = await currentUser.getIdToken();

      // Use the stored working URL first if available
      const storedWorkingUrl = localStorage.getItem('workingNotificationServerUrl');
      const baseUrlsToTry = storedWorkingUrl
        ? [storedWorkingUrl, ...baseUrls.filter(url => url !== storedWorkingUrl)]
        : baseUrls;

      // Try each base URL until we get a successful response
      for (const baseUrl of baseUrlsToTry) {
        try {
          console.log(`Trying to mark all notifications as read at ${baseUrl}...`);

          // Add timeout to fetch to prevent long waits
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch(`${baseUrl}/api/notifications/mark-all-read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId); // Clear the timeout if fetch completes

          if (response.ok) {
            const data = await response.json();
            if (data && data.success) {
              console.log(`Successfully marked all notifications as read at ${baseUrl}`);

              // Store the working URL for future use
              localStorage.setItem('workingNotificationServerUrl', baseUrl);

              return true;
            }
          }
        } catch (err) {
          // Check if it's an abort error (timeout)
          if (err.name === 'AbortError') {
            console.log(`Timeout connecting to ${baseUrl}`);
          } else {
            console.log(`Failed to connect to ${baseUrl}:`, err.message);
          }
        }
      }

      // If backend API fails, fall back to Firebase
      console.log('Falling back to Firebase for marking all notifications as read...');
    } catch (backendError) {
      console.error('Error marking all notifications as read in backend:', backendError);
      console.log('Falling back to Firebase for marking all notifications as read...');
    }

    // Fall back to Firebase
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);

    // Use Promise.all to update all notifications in parallel
    const updatePromises = querySnapshot.docs.map(document =>
      updateDoc(doc(db, 'notifications', document.id), { read: true })
    );

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Function to create connection request notification
export const createConnectionRequestNotification = async (fromUser, toUserId) => {
  try {
    if (!fromUser || !fromUser.id || !toUserId) {
      console.error('Invalid parameters for connection request notification:', { fromUser, toUserId });
      throw new Error('Missing required parameters for connection request notification');
    }

    console.log(`Creating connection request notification from ${fromUser.name} (${fromUser.id}) to ${toUserId}`);

    const notification = {
      userId: toUserId,
      type: 'connection_request',
      fromUserId: fromUser.id,
      fromUserName: fromUser.name || 'A user',
      message: `${fromUser.name || 'A user'} sent you a connection request`,
      actionLink: `/profile/${fromUser.id}`,
      actionLabel: 'View Profile'
    };

    return await createNotification(notification);
  } catch (error) {
    console.error('Failed to create connection request notification:', error);
    // Don't throw, just return false to avoid breaking the connection request flow
    return false;
  }
};

// Function to create connection acceptance notification
export const createConnectionAcceptanceNotification = async (fromUser, toUserId) => {
  try {
    if (!fromUser || !fromUser.id || !toUserId) {
      console.error('Invalid parameters for connection acceptance notification:', { fromUser, toUserId });
      throw new Error('Missing required parameters for connection acceptance notification');
    }

    console.log(`Creating connection acceptance notification from ${fromUser.name} (${fromUser.id}) to ${toUserId}`);

    const notification = {
      userId: toUserId,
      type: 'connection_accepted',
      fromUserId: fromUser.id,
      fromUserName: fromUser.name || 'A user',
      message: `${fromUser.name || 'A user'} accepted your connection request`,
      actionLink: `/profile/${fromUser.id}`,
      actionLabel: 'View Profile'
    };

    return await createNotification(notification);
  } catch (error) {
    console.error('Failed to create connection acceptance notification:', error);
    // Don't throw, just return false to avoid breaking the connection acceptance flow
    return false;
  }
};

// Helper function to create a fallback query when index is missing
const createFallbackQuery = (userId) => {
  console.log(`Creating fallback query for user ${userId} due to missing index`);
  return query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );
};

// Set up a real-time listener for new notifications
export const subscribeToUserNotifications = (userId, callback) => {
  if (!userId) {
    console.error('Cannot subscribe to notifications: missing userId');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  console.log(`Setting up notifications subscription for user ${userId}`);

  // First try the optimal query with ordering
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    return onSnapshot(q,
      // Success handler
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        console.log(`Received notification update, count: ${notifications.length}`);
        callback(notifications);
      },
      // Error handler
      (error) => {
        // Check if this is a missing index error
        if (error.message && error.message.includes('index')) {
          console.warn('Missing Firestore index for notifications subscription. Please follow the link in the error to create the index.');
          console.warn('Using fallback query without ordering until index is created.');

          // Fallback: Use a simpler query without ordering
          const fallbackQuery = createFallbackQuery(userId);

          // Set up a new listener with the fallback query
          return onSnapshot(fallbackQuery, (fallbackSnapshot) => {
            const notifications = fallbackSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || doc.data().createdAt ? new Date(doc.data().createdAt) : new Date()
            }));

            // Sort manually by timestamp descending
            const sortedNotifications = notifications.sort((a, b) => {
              // Handle potential missing timestamps
              const timeA = b.timestamp instanceof Date ? b.timestamp : new Date();
              const timeB = a.timestamp instanceof Date ? a.timestamp : new Date();
              return timeA - timeB;
            }).slice(0, 20);

            console.log(`Received notification update (fallback), count: ${sortedNotifications.length}`);
            callback(sortedNotifications);
          },
          // Error handler for fallback
          (fallbackError) => {
            console.error('Error in fallback notifications subscription:', fallbackError);
            callback([]);
          });
        }

        // If it's not an index error, check for permission errors
        if (error.message && error.message.includes('permission')) {
          console.warn('Firebase permission error in notifications subscription. This is normal if the user is not authenticated yet.');
          console.warn('Using local notifications until authentication is complete.');
          // Return empty array but don't show error to user
          callback([]);
        } else {
          // For other errors, log them
          console.error('Error in notifications subscription:', error);
          callback([]);
        }
      }
    );
  } catch (setupError) {
    console.error('Error setting up notification subscription:', setupError);
    // Try with fallback query from the beginning
    try {
      const fallbackQuery = createFallbackQuery(userId);
      return onSnapshot(fallbackQuery, (fallbackSnapshot) => {
        const notifications = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt || Date.now())
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);

        console.log(`Received notification update (direct fallback), count: ${notifications.length}`);
        callback(notifications);
      }, (error) => {
        console.error('Error in direct fallback notification subscription:', error);
        callback([]);
      });
    } catch (finalError) {
      console.error('Final error setting up notifications, giving up:', finalError);
      callback([]);
      return () => {}; // Empty unsubscribe function
    }
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.length);
  });
};

// Helper function to create a message notification
export const createMessageNotification = async (fromUser, toUserId, messageId) => {
  try {
    return await createNotification({
      userId: toUserId,
      type: 'message',
      message: `You received a new message from ${fromUser.name || 'Someone'}`,
      linkTo: `/messages/${messageId}`,
      sourceId: messageId,
      sourceType: 'message'
    });
  } catch (error) {
    console.error('Error creating message notification:', error);
    throw error;
  }
};

// Helper function to create an event notification
export const createEventNotification = async (toUserId, event) => {
  try {
    return await createNotification({
      userId: toUserId,
      type: 'event',
      message: `Reminder: ${event.title} is coming up soon`,
      linkTo: `/events/${event.id}`,
      sourceId: event.id,
      sourceType: 'event'
    });
  } catch (error) {
    console.error('Error creating event notification:', error);
    throw error;
  }
};

// Helper function for student-specific notifications
export const createAssignmentNotification = async (toUserId, assignment) => {
  try {
    return await createNotification({
      userId: toUserId,
      type: 'assignment',
      message: `New assignment posted: ${assignment.title}`,
      linkTo: `/courses/${assignment.courseId}/assignments/${assignment.id}`,
      sourceId: assignment.id,
      sourceType: 'assignment'
    });
  } catch (error) {
    console.error('Error creating assignment notification:', error);
    throw error;
  }
};

// Helper function for teacher-specific notifications
export const createSubmissionNotification = async (toUserId, submission, studentName, assignmentTitle) => {
  try {
    return await createNotification({
      userId: toUserId,
      type: 'student',
      message: `${studentName} submitted an assignment for ${assignmentTitle}`,
      linkTo: `/courses/assignments/submissions/${submission.id}`,
      sourceId: submission.id,
      sourceType: 'submission'
    });
  } catch (error) {
    console.error('Error creating submission notification:', error);
    throw error;
  }
};