import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';

/**
 * Initializes the Firestore collections needed for the application
 * This ensures all required collections exist even if they're empty
 */
export const initializeFirestoreCollections = async () => {
  try {
    console.log("Checking if messages collection exists...");
    
    // Check if messages collection exists and has documents
    const messagesQuery = query(collection(db, 'messages'), limit(1));
    const messagesSnapshot = await getDocs(messagesQuery);
    
    // If collection is empty, create a test document
    if (messagesSnapshot.empty) {
      console.log("Messages collection is empty. Creating test message...");
      await createTestMessage();
    } else {
      console.log("Messages collection already exists with documents.");
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing Firestore collections:", error);
    return false;
  }
};

/**
 * Creates a test message to initialize the messages collection
 */
const createTestMessage = async () => {
  try {
    const messageData = {
      senderId: "system",
      receiverId: "system",
      senderRole: "system",
      receiverRole: "system",
      content: "This is a system message to initialize the messages collection",
      read: true,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    console.log("Test message created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating test message:", error);
    throw error;
  }
};
