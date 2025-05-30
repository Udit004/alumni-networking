import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc,
  limit,
  writeBatch
} from 'firebase/firestore';
import { createConnectionRequestNotification, createConnectionAcceptanceNotification } from './notificationService';

// Simple in-memory cache for connection data
const connectionsCache = {
  data: {},
  timestamp: {},
  // Cache expiration time in milliseconds (5 minutes)
  expirationTime: 5 * 60 * 1000,

  // Get cached connections for a user
  get: function(userId) {
    const cachedData = this.data[userId];
    const cachedTime = this.timestamp[userId];

    if (cachedData && cachedTime) {
      // Check if cache is still valid
      const now = Date.now();
      if (now - cachedTime < this.expirationTime) {
        console.log(`Using cached connections for user ${userId}`);
        return cachedData;
      } else {
        console.log(`Cache expired for user ${userId}`);
        // Clean up expired cache
        delete this.data[userId];
        delete this.timestamp[userId];
      }
    }
    return null;
  },

  // Store connections in cache
  set: function(userId, connections) {
    this.data[userId] = connections;
    this.timestamp[userId] = Date.now();
    console.log(`Cached ${connections.length} connections for user ${userId}`);
  },

  // Invalidate cache for a user
  invalidate: function(userId) {
    if (this.data[userId]) {
      delete this.data[userId];
      delete this.timestamp[userId];
      console.log(`Invalidated connections cache for user ${userId}`);
    }
  }
};

// Ensure collections exist - this is a one-time setup function
export const setupFirestoreCollections = async () => {
  try {
    console.log('Setting up Firestore collections...');

    // Create connectionRequests collection if it doesn't exist
    const dummyRequestData = {
      from: 'system',
      to: 'system',
      status: 'setup',
      createdAt: serverTimestamp(),
      _setup: true
    };

    // Create notifications collection if it doesn't exist
    const dummyNotificationData = {
      userId: 'system',
      type: 'system',
      message: 'System initialization',
      read: true,
      timestamp: serverTimestamp(),
      _setup: true
    };

    // Use unique IDs based on timestamp to avoid conflicts
    const timestamp = Date.now();

    try {
      // Create a document in connectionRequests collection
      const requestRef = doc(db, 'connectionRequests', `setup_${timestamp}`);
      await setDoc(requestRef, dummyRequestData);
      console.log('Connection requests collection created successfully');
    } catch (err) {
      console.error('Error creating connectionRequests collection:', err);
    }

    try {
      // Create a document in notifications collection
      const notificationRef = doc(db, 'notifications', `setup_${timestamp}`);
      await setDoc(notificationRef, dummyNotificationData);
      console.log('Notifications collection created successfully');
    } catch (err) {
      console.error('Error creating notifications collection:', err);
    }

    return true;
  } catch (error) {
    console.error('Error setting up Firestore collections:', error);
    return false;
  }
};

// Call this setup function at import time
setupFirestoreCollections().then(() => {
  console.log('Firestore collection setup completed');
}).catch(err => {
  console.error('Failed to set up Firestore collections:', err);
});

// Send a connection request
export const sendConnectionRequest = async (fromUserId, toUserId) => {
  try {
    // Check if user is trying to connect with themselves
    if (fromUserId === toUserId) {
      return { success: false, message: 'You cannot connect with yourself' };
    }

    // Check if a request already exists
    const existingRequest = await checkExistingRequest(fromUserId, toUserId);
    if (existingRequest) {
      return { success: false, message: 'A connection request already exists' };
    }

    // Get user details for notification
    const userDocRef = doc(db, 'users', fromUserId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : {};

    // Create the connection request
    const connectionRequest = {
      from: fromUserId,
      to: toUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    console.log('Creating connection request:', connectionRequest);
    const docRef = await addDoc(collection(db, 'connectionRequests'), connectionRequest);
    console.log('Connection request created with ID:', docRef.id);

    // Send notification to the recipient with improved error handling
    try {
      console.log('Sending connection request notification', {
        fromUserId,
        fromUserName: userData.name || userData.displayName || 'A user',
        toUserId
      });

      const notificationResult = await createConnectionRequestNotification(
        {
          id: fromUserId,
          name: userData.name || userData.displayName || 'A user'
        },
        toUserId
      );

      console.log('Connection request notification sent successfully:', notificationResult);
    } catch (notificationError) {
      console.error('Failed to create notification for connection request, but request was created:', notificationError);
      // Don't fail the whole operation if just the notification fails
    }

    return {
      success: true,
      requestId: docRef.id,
      message: 'Connection request sent successfully'
    };
  } catch (error) {
    console.error('Error sending connection request:', error);
    return { success: false, message: error.message };
  }
};

// Verify and update user profile structure if needed
export const ensureUserConnectionsField = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // If connections field doesn't exist, add it
      if (!userData.hasOwnProperty('connections')) {
        console.log(`Adding connections field to user ${userId}`);
        await updateDoc(userRef, {
          connections: []
        });
        return true;
      }
    } else {
      console.error(`User document not found for ID: ${userId}`);
    }
    return false;
  } catch (error) {
    console.error('Error ensuring user connections field:', error);
    return false;
  }
};

// Accept a connection request
export const acceptConnectionRequest = async (requestId) => {
  try {
    console.log(`Accepting connection request: ${requestId}`);

    // Get the request document
    const requestRef = doc(db, 'connectionRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      console.error('Connection request not found');
      throw new Error('Connection request not found');
    }

    const requestData = requestSnap.data();

    // Create a batch for atomic operations
    const batch = writeBatch(db);

    // Create timestamp
    const now = serverTimestamp();

    // Get user document references
    const fromUserRef = doc(db, 'users', requestData.from);
    const toUserRef = doc(db, 'users', requestData.to);

    // Update both users' connections arrays
    batch.update(fromUserRef, {
      connections: arrayUnion(requestData.to)
    });

    batch.update(toUserRef, {
      connections: arrayUnion(requestData.from)
    });

    // Update the request status to accepted
    batch.update(requestRef, {
      status: 'accepted',
      updatedAt: now
    });

    // Get user details for notification
    const fromUserDoc = await getDoc(fromUserRef);
    const fromUserData = fromUserDoc.data();

    // Create acceptance notification
    await createConnectionAcceptanceNotification(
      {
        id: requestData.to,
        name: fromUserData.name || fromUserData.displayName || 'A user'
      },
      requestData.from
    );

    // Commit all changes
    await batch.commit();
    console.log('Connection request accepted successfully');

    // Invalidate cache for both users since their connections have changed
    connectionsCache.invalidate(requestData.from);
    connectionsCache.invalidate(requestData.to);

    return true;
  } catch (error) {
    console.error('Error accepting connection request:', error);
    throw error;
  }
};

// Reject a connection request
export const rejectConnectionRequest = async (requestId) => {
  try {
    console.log(`Rejecting connection request: ${requestId}`);

    // Get the request document reference
    const requestRef = doc(db, 'connectionRequests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      console.error('Connection request not found');
      throw new Error('Connection request not found');
    }

    // Update the request status to rejected
    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });

    console.log('Connection request rejected successfully');
    return true;
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    throw error;
  }
};

// Remove a connection
export const removeConnection = async (userId, connectionId) => {
  try {
    // Remove from both users' connections arrays
    const userRef = doc(db, 'users', userId);
    const connectionRef = doc(db, 'users', connectionId);

    await updateDoc(userRef, {
      connections: arrayRemove(connectionId)
    });

    await updateDoc(connectionRef, {
      connections: arrayRemove(userId)
    });

    // Invalidate cache for both users since their connections have changed
    connectionsCache.invalidate(userId);
    connectionsCache.invalidate(connectionId);

    return {
      success: true,
      message: 'Connection removed successfully'
    };
  } catch (error) {
    console.error('Error removing connection:', error);
    return { success: false, message: error.message };
  }
};

// Get all connection requests for a user
export const getConnectionRequests = async (userId) => {
  try {
    // Get incoming requests
    const incomingQuery = query(
      collection(db, 'connectionRequests'),
      where('to', '==', userId),
      where('status', '==', 'pending')
    );

    // Get outgoing requests
    const outgoingQuery = query(
      collection(db, 'connectionRequests'),
      where('from', '==', userId),
      where('status', '==', 'pending')
    );

    try {
      const [incomingSnapshot, outgoingSnapshot] = await Promise.all([
        getDocs(incomingQuery),
        getDocs(outgoingQuery)
      ]);

      // Process incoming requests with full user details
      const incomingRequests = await Promise.all(incomingSnapshot.docs.map(async request => {
        const requestData = request.data();
        const senderRef = doc(db, 'users', requestData.from);
        const senderDoc = await getDoc(senderRef);
        const senderData = senderDoc.exists() ? senderDoc.data() : {};

        return {
          id: request.id,
          ...requestData,
          sender: {
            id: requestData.from,
            name: senderData.name || senderData.displayName || 'Unknown User',
            role: senderData.role || 'user',
            photoURL: senderData.photoURL || '/default-avatar.png',
            program: senderData.program || '',
            skills: senderData.skills || []
          },
          createdAt: requestData.createdAt?.toDate() || new Date()
        };
      }));

      // Process outgoing requests with full user details
      const outgoingRequests = await Promise.all(outgoingSnapshot.docs.map(async request => {
        const requestData = request.data();
        const recipientRef = doc(db, 'users', requestData.to);
        const recipientDoc = await getDoc(recipientRef);
        const recipientData = recipientDoc.exists() ? recipientDoc.data() : {};

        return {
          id: request.id,
          ...requestData,
          recipient: {
            id: requestData.to,
            name: recipientData.name || recipientData.displayName || 'Unknown User',
            role: recipientData.role || 'user',
            photoURL: recipientData.photoURL || '/default-avatar.png',
            program: recipientData.program || '',
            skills: recipientData.skills || []
          },
          createdAt: requestData.createdAt?.toDate() || new Date()
        };
      }));

      return {
        incoming: incomingRequests,
        outgoing: outgoingRequests
      };
    } catch (err) {
      console.error('Error processing connection requests:', err);
      return { incoming: [], outgoing: [] };
    }
  } catch (error) {
    console.error('Error getting connection requests:', error);
    return { incoming: [], outgoing: [] };
  }
};

// Get all connections for a user
export const getUserConnections = async (userId) => {
  try {
    // Check cache first
    const cachedConnections = connectionsCache.get(userId);
    if (cachedConnections) {
      return cachedConnections;
    }

    console.log('Fetching connections for user:', userId);
    // Get the user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('User not found:', userId);
      return [];
    }

    const userData = userDoc.data();
    const connectionIds = userData.connections || [];

    if (connectionIds.length === 0) {
      console.log('User has no connections');
      // Cache empty result to avoid repeated lookups
      connectionsCache.set(userId, []);
      return [];
    }

    // Filter out any self-connections
    const filteredConnectionIds = connectionIds.filter(id => id !== userId);

    if (filteredConnectionIds.length === 0) {
      console.log('No valid connections after filtering');
      // Cache empty result to avoid repeated lookups
      connectionsCache.set(userId, []);
      return [];
    }

    console.log(`Fetching ${filteredConnectionIds.length} connection profiles in batch`);

    // Batch fetch all connections at once
    const connections = [];

    // Process connections in batches of 10 to avoid potential Firestore limitations
    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < filteredConnectionIds.length; i += batchSize) {
      batches.push(filteredConnectionIds.slice(i, i + batchSize));
    }

    // Process each batch concurrently
    const batchResults = await Promise.all(
      batches.map(async (batchIds) => {
        // Create an array of promises for each connection in the batch
        const batchPromises = batchIds.map(connectionId => getDoc(doc(db, 'users', connectionId)));

        // Wait for all promises in this batch to resolve
        return await Promise.all(batchPromises);
      })
    );

    // Flatten the batch results and process them
    const connectionDocs = batchResults.flat();

    // Process the connection documents
    connectionDocs.forEach(connectionDoc => {
      if (connectionDoc.exists()) {
        const connectionData = connectionDoc.data();
        connections.push({
          id: connectionDoc.id,
          name: connectionData.name || connectionData.displayName || 'Unknown User',
          role: connectionData.role || 'user',
          photoURL: connectionData.photoURL || '',
          jobTitle: connectionData.jobTitle || '',
          company: connectionData.company || '',
          institution: connectionData.institution || '',
          department: connectionData.department || '',
          expertise: connectionData.expertise || [],
          skills: connectionData.skills || []
        });
      }
    });

    console.log(`Successfully fetched ${connections.length} connections`);

    // Store in cache for future use
    connectionsCache.set(userId, connections);

    return connections;
  } catch (error) {
    console.error('Error getting user connections:', error);
    // Return empty array instead of throwing to match other service patterns
    return [];
  }
};

// Check if a connection request already exists
const checkExistingRequest = async (fromUserId, toUserId) => {
  // Check if there's an existing request from fromUser to toUser
  const fromToQuery = query(
    collection(db, 'connectionRequests'),
    where('from', '==', fromUserId),
    where('to', '==', toUserId),
    where('status', '==', 'pending')
  );

  // Check if there's an existing request from toUser to fromUser
  const toFromQuery = query(
    collection(db, 'connectionRequests'),
    where('from', '==', toUserId),
    where('to', '==', fromUserId),
    where('status', '==', 'pending')
  );

  const [fromToSnapshot, toFromSnapshot] = await Promise.all([
    getDocs(fromToQuery),
    getDocs(toFromQuery)
  ]);

  return !fromToSnapshot.empty || !toFromSnapshot.empty;
};

// Check if two users are connected
export const areUsersConnected = async (userId1, userId2) => {
  try {
    const userRef = doc(db, 'users', userId1);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const connections = userData.connections || [];

    return connections.includes(userId2);
  } catch (error) {
    console.error('Error checking user connection:', error);
    return false;
  }
};

// Add mock connection requests for testing - call this function to seed test data
export const createMockConnectionRequests = async (userId) => {
  try {
    // Check if there are already pending requests
    const currentRequests = await getConnectionRequests(userId);

    if (currentRequests.incoming.length > 0 || currentRequests.outgoing.length > 0) {
      console.log('User already has connection requests, no mock data needed');
      return;
    }

    // Create mock users to send connection requests
    const mockUsers = [
      {
        id: 'mock-user-1',
        name: 'John Smith',
        role: 'student',
        program: 'Computer Science'
      },
      {
        id: 'mock-user-2',
        name: 'Emma Johnson',
        role: 'alumni',
        company: 'Tech Innovations'
      },
      {
        id: 'mock-user-3',
        name: 'Dr. Michael Brown',
        role: 'teacher',
        department: 'Computer Science'
      }
    ];

    // Create connection requests
    for (const mockUser of mockUsers) {
      // Create the mock user if it doesn't exist
      const userRef = doc(db, 'users', mockUser.id);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          name: mockUser.name,
          role: mockUser.role,
          program: mockUser.program || '',
          company: mockUser.company || '',
          department: mockUser.department || '',
          photoURL: '',
          connections: []
        });
      }

      // Create a connection request from this mock user to the real user
      const connectionRequest = {
        from: mockUser.id,
        to: userId,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'connectionRequests'), connectionRequest);
      console.log(`Created mock connection request from ${mockUser.name} to user ${userId}`);
    }

    return true;
  } catch (error) {
    console.error('Error creating mock connection requests:', error);
    return false;
  }
};