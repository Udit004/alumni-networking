import { db } from '../firebaseConfig';
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

// Get notifications for a user
export const getUserNotifications = async (userId, limitCount = 20) => {
  if (!userId) {
    console.error('Cannot get notifications: missing userId');
    return [];
  }

  try {
    // Try with ordering first
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
      
      console.log(`Initial notifications loaded: ${notifications.length}`);
      return notifications;
    } catch (indexError) {
      // Check if this is a missing index error
      if (indexError.message && indexError.message.includes('index')) {
        console.warn('Missing Firestore index for notifications query. Please follow the link in the error to create the index.');
        console.warn('Using fallback query without ordering until index is created.');
        
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
        
        // If it's not an index error, log it and return empty array
        console.error('Error in notifications subscription:', error);
        callback([]);
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