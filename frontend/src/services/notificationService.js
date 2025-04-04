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
    const notificationData = {
      ...notification,
      timestamp: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log('Notification created with ID:', docRef.id);
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
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

// Set up a real-time listener for new notifications
export const subscribeToUserNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    callback(notifications);
  });
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

// Helper function to create a connection request notification
export const createConnectionRequestNotification = async (fromUser, toUserId) => {
  try {
    return await createNotification({
      userId: toUserId,
      type: 'connection',
      message: `${fromUser.name || 'Someone'} sent you a connection request`,
      linkTo: `/directory/user/${fromUser.id}`,
      sourceId: fromUser.id,
      sourceType: 'user'
    });
  } catch (error) {
    console.error('Error creating connection request notification:', error);
    throw error;
  }
};

// Helper function to create a connection acceptance notification
export const createConnectionAcceptanceNotification = async (fromUser, toUserId) => {
  try {
    return await createNotification({
      userId: toUserId,
      type: 'connection',
      message: `${fromUser.name || 'Someone'} accepted your connection request`,
      linkTo: `/directory/user/${fromUser.id}`,
      sourceId: fromUser.id,
      sourceType: 'user'
    });
  } catch (error) {
    console.error('Error creating connection acceptance notification:', error);
    throw error;
  }
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