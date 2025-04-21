import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import './ChatComponent.css';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, or, and, getDocs, limit, serverTimestamp, addDoc } from 'firebase/firestore';

// Use hardcoded fallback in case env variable isn't loading
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
// MongoDB API endpoint
const mongoApiBaseUrl = process.env.REACT_APP_MONGO_API_BASE_URL || 'http://localhost:5000/api/messages-db';
console.log("Chat Component - API Base URL:", apiBaseUrl);
console.log("Chat Component - MongoDB API Base URL:", mongoApiBaseUrl);

// Use MongoDB through REST API by default since we're having Firestore permission issues
const DEFAULT_USE_FIRESTORE = false;

function formatTime(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ChatComponent = ({ selectedUser, fetchConversations }) => {
  const { currentUser, role, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [useFirestore, setUseFirestore] = useState(DEFAULT_USE_FIRESTORE); // Toggle between Firestore and REST API
  const messagesEndRef = useRef(null);
  const messagesListener = useRef(null);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when the component mounts or when the selected user changes
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      console.log('Marking messages as read due to user selection or new messages');
      markAsRead();
    }
  }, [selectedUser, messages.length]);

  // Check if backend server is running when component mounts
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        console.log('Checking backend server status...');
        const response = await axios.get(`${apiBaseUrl.replace('/api', '')}/healthcheck`, { timeout: 3000 });
        console.log('Backend server status:', response.status, response.data);
      } catch (error) {
        console.error('Backend server check failed:', error);
        setError('Cannot connect to the backend server. Please make sure the server is running.');
      }
    };

    checkBackendStatus();
  }, []);

  // Set up real-time listener for messages when selected user changes
  useEffect(() => {
    if (selectedUser && currentUser) {
      setLoading(true);
      setError(null);

      // Clean up previous listener if it exists
      if (messagesListener.current) {
        messagesListener.current();
      }

      if (useFirestore) {
        // Try Firestore real-time listener first
        setupFirestoreListener();
      } else {
        // Use REST API fallback
        fetchMessages();
      }
    }

    // Clean up listener on unmount
    return () => {
      if (messagesListener.current) {
        messagesListener.current();
        messagesListener.current = null;
      }
    };
  }, [selectedUser?.uid, currentUser?.uid, useFirestore]);

  const setupFirestoreListener = async () => {
    try {
      console.log('Setting up Firestore messages listener...');
      console.log('Current user:', currentUser.uid, 'Selected user:', selectedUser.uid);

      // First, try a simpler query to check if the messages collection exists and is accessible
      try {
        console.log('Checking if messages collection exists...');
        const testQuery = query(collection(db, 'messages'), limit(5));
        const testSnapshot = await getDocs(testQuery);
        console.log(`Messages collection exists with ${testSnapshot.docs.length} documents`);
      } catch (collectionError) {
        console.error('Error accessing messages collection:', collectionError);
        throw new Error('Cannot access messages collection');
      }

      // Now set up the actual query for the conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        or(
          and(
            where('senderId', '==', currentUser.uid),
            where('receiverId', '==', selectedUser.uid)
          ),
          and(
            where('senderId', '==', selectedUser.uid),
            where('receiverId', '==', currentUser.uid)
          )
        ),
        orderBy('createdAt', 'asc')
      );

      // Test retrieving messages once via getDocs before setting up listener
      try {
        console.log('Testing Firestore query with getDocs...');
        const querySnapshot = await getDocs(messagesQuery);
        console.log(`Test query returned ${querySnapshot.docs.length} messages`);

        // Log the first message if available for debugging
        if (querySnapshot.docs.length > 0) {
          const firstMessage = querySnapshot.docs[0].data();
          console.log('Sample message:', {
            id: querySnapshot.docs[0].id,
            senderId: firstMessage.senderId,
            receiverId: firstMessage.receiverId,
            content: firstMessage.content?.substring(0, 20) + '...',
            timestamp: firstMessage.createdAt
          });
        }
      } catch (testError) {
        console.error('Error testing messages query:', testError);
        throw new Error('Firestore test query failed');
      }

      console.log('Setting up onSnapshot listener...');
      messagesListener.current = onSnapshot(messagesQuery, (snapshot) => {
        console.log(`Firestore snapshot received with ${snapshot.docs.length} messages`);
        const messageList = snapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        setMessages(messageList);
        setLoading(false);

        // Mark messages as read
        markAsRead();
      }, (err) => {
        console.error('Error in Firestore messages listener:', err);
        setError('Failed to load messages from Firestore. Falling back to REST API.');
        setLoading(false);

        // Switch to REST API fallback
        setUseFirestore(false);
      });
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      setError('Failed to connect to Firestore. Trying REST API instead.');
      setLoading(false);

      // Switch to REST API fallback
      setUseFirestore(false);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log(`Fetching messages via REST API between ${currentUser.uid} and ${selectedUser.uid}...`);
      setLoading(true);
      setError(null);

      // Try MongoDB API first
      try {
        console.log('Trying MongoDB API...');
        const response = await axios.get(
          `${mongoApiBaseUrl}/${currentUser.uid}/${selectedUser.uid}`,
          {
            timeout: 5000 // 5 second timeout
          }
        );

        console.log(`MongoDB API response received:`, response.status);

        if (response.data.success) {
          setMessages(response.data.data);
          console.log(`Loaded ${response.data.data.length} messages from MongoDB API`);
          setLoading(false);
          return; // Exit early if MongoDB API succeeds
        }
      } catch (mongoError) {
        console.error('Error fetching messages from MongoDB API:', mongoError);
        console.log('Falling back to Firebase API...');
        // Continue to Firebase API fallback
      }

      // Firebase API fallback
      const token = await currentUser.getIdToken();
      console.log('Auth token obtained for Firebase API request');

      const response = await axios.get(
        `${apiBaseUrl}/messages/${currentUser.uid}/${selectedUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000 // 5 second timeout
        }
      );

      console.log(`Firebase API response received:`, response.status);

      if (response.data.success) {
        setMessages(response.data.data);
        console.log(`Loaded ${response.data.data.length} messages from Firebase API`);
      } else {
        console.error('API returned unsuccessful response:', response.data);
        setError('Failed to load messages. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching messages from API:', error);

      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        setError('Connection timeout. The server is not responding. Please check if the backend server is running.');
      } else if (error.message.includes('Network Error')) {
        setError('Network error. Cannot connect to the server. Please check if the backend server is running at ' + apiBaseUrl);
      } else {
        setError(`Failed to load messages: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      console.log(`Marking messages from ${selectedUser.uid} as read...`);

      // Try MongoDB API first
      try {
        console.log('Trying to mark messages as read via MongoDB API...');
        await axios.put(
          `${mongoApiBaseUrl}/mark-read/${selectedUser.uid}/${currentUser.uid}`,
          {}
        );

        console.log('Messages marked as read successfully via MongoDB API');

        // If we're updating conversations list in parent component
        if (fetchConversations) {
          console.log('Refreshing conversations list after marking messages as read');
          fetchConversations();
        }

        return; // Exit early if MongoDB API succeeds
      } catch (mongoError) {
        console.error('Error marking messages as read via MongoDB API:', mongoError);
        console.log('Falling back to Firebase API...');
        // Continue to Firebase API fallback
      }

      // Firebase API fallback
      const token = await currentUser.getIdToken();

      await axios.put(
        `${apiBaseUrl}/messages/mark-read/${selectedUser.uid}/${currentUser.uid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Messages marked as read successfully via Firebase API');

      // If we're updating conversations list in parent component
      if (fetchConversations) {
        fetchConversations();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Don't show error to user for this non-critical operation
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    try {
      setSending(true);
      console.log(`Sending message to ${selectedUser.uid}...`);

      const messageData = {
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        senderRole: role,
        receiverRole: selectedUser.role,
        content: newMessage.trim(),
        read: false,
        createdAt: serverTimestamp()
      };

      // Try MongoDB API first
      try {
        console.log('Trying to send message via MongoDB API...');
        const mongoResponse = await axios.post(
          `${mongoApiBaseUrl}/send`,
          messageData,
          {
            timeout: 5000 // 5 second timeout
          }
        );

        if (mongoResponse.data.success) {
          console.log('Message sent successfully via MongoDB API');
          // Clear input field
          setNewMessage('');

          // Manually fetch messages
          fetchMessages();

          // Refresh the conversations list if provided
          if (fetchConversations) {
            console.log('Refreshing conversations list after sending message');
            fetchConversations();
          }

          // Update the UI to show this conversation at the top of the list
          updateRecentConversation(messageData);

          return; // Exit early if MongoDB API succeeds
        }
      } catch (mongoError) {
        console.error('Error sending message via MongoDB API:', mongoError);
        console.log('Falling back to Firebase...');
        // Continue to Firestore/Firebase API fallback
      }

      // If using Firestore, try to send directly to Firestore
      if (useFirestore) {
        try {
          console.log('Sending message directly to Firestore...');
          const docRef = await addDoc(collection(db, 'messages'), messageData);
          console.log('Message added to Firestore with ID:', docRef.id);

          // Clear input field
          setNewMessage('');

          // Refresh the conversations list if provided
          if (fetchConversations) {
            console.log('Refreshing conversations list after sending message to Firestore');
            fetchConversations();
          }

          // Update the UI to show this conversation at the top of the list
          updateRecentConversation(messageData);

          return; // Exit early if Firestore succeeds
        } catch (firestoreError) {
          console.error('Error sending message to Firestore:', firestoreError);
          console.log('Falling back to Firebase REST API for sending message...');
          // Continue to Firebase REST API fallback
        }
      }

      // Firebase REST API fallback
      const token = await currentUser.getIdToken();
      console.log('Auth token obtained for sending message');

      const response = await axios.post(
        `${apiBaseUrl}/messages/send`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000 // 5 second timeout
        }
      );

      if (response.data.success) {
        console.log('Message sent successfully via Firebase REST API');
        // Clear input field
        setNewMessage('');

        // If we're not using Firestore real-time updates, manually fetch messages
        if (!useFirestore) {
          fetchMessages();
        }

        // Refresh the conversations list if provided
        if (fetchConversations) {
          console.log('Refreshing conversations list after sending message via Firebase REST API');
          fetchConversations();
        }

        // Update the UI to show this conversation at the top of the list
        updateRecentConversation(messageData);
      } else {
        console.error('Failed to send message:', response.data);
        setError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        setError('Connection timeout. The server is not responding. Please check if the backend server is running.');
      } else if (error.message.includes('Network Error')) {
        setError('Network error. Cannot connect to the server. Please check if the backend server is running at ' + apiBaseUrl);
      } else {
        setError(`Failed to send message: ${error.message}`);
      }
    } finally {
      setSending(false);
    }
  };

  const toggleConnectionMode = () => {
    setUseFirestore(!useFirestore);
    setError(null);
  };

  // Function to update the recent conversation in the UI
  const updateRecentConversation = (messageData) => {
    try {
      console.log('Updating recent conversation with message:', messageData);

      // This function is meant to be used in conjunction with fetchConversations
      // It ensures that the conversation appears at the top of the list for both users
      // The actual implementation is handled by the fetchConversations function
      // This function is mainly for logging and future enhancements

      // You could implement local state updates here if needed for immediate UI feedback
      // before the fetchConversations completes
    } catch (error) {
      console.error('Error updating recent conversation:', error);
    }
  };

  if (!selectedUser) {
    return (
      <div className="chat-container empty-chat">
        <div className="select-user-prompt">
          <FaUserCircle size={64} className="text-gray-400" />
          <h3>Select a user to start chatting</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            {selectedUser.photoURL ? (
              <img src={selectedUser.photoURL} alt={selectedUser.name} />
            ) : (
              <FaUserCircle size={32} />
            )}
          </div>
          <div>
            <h3>{selectedUser.name}</h3>
            <span className="user-role">{selectedUser.role}</span>
          </div>
        </div>
        <div className="connection-toggle">
          <button
            onClick={toggleConnectionMode}
            className={`connection-mode-button ${useFirestore ? 'firestore' : 'rest'}`}
            title={useFirestore ? 'Using Firestore (click to switch to REST API)' : 'Using REST API (click to switch to Firestore)'}
          >
            {useFirestore ? 'Firestore' : 'REST API'}
          </button>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              onClick={fetchMessages}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${
                message.senderId === currentUser.uid ? 'sent' : 'received'
              }`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-container">
        {error && (
          <div className="send-error">{error}</div>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          disabled={sending}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <div className="send-spinner"></div>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;