import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import UserDirectory from '../../components/UserDirectory';
import ChatComponent from '../../components/ChatComponent';
import './TeacherChat.css';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
const mongoApiBaseUrl = process.env.REACT_APP_MONGO_API_BASE_URL || 'http://localhost:5001/api/messages-db';

const TeacherChat = () => {
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try MongoDB API first with a shorter timeout
      try {
        console.log('Trying to fetch conversations via MongoDB API...');
        const mongoResponse = await axios.get(
          `${mongoApiBaseUrl}/conversations/${currentUser.uid}`,
          {
            timeout: 2000 // 2 second timeout - fail faster
          }
        );

        if (mongoResponse.data && mongoResponse.data.success && mongoResponse.data.data) {
          console.log('Conversations fetched successfully via MongoDB API');
          setConversations(mongoResponse.data.data);
          setLoading(false);
          return; // Exit early if MongoDB API succeeds
        }
      } catch (mongoError) {
        console.error('Error fetching conversations via MongoDB API:', mongoError);
        console.log('Falling back to Firebase API...');
        // Continue to Firebase API fallback
      }

      // Try to fetch conversations directly from Firestore
      try {
        console.log('Trying to fetch conversations directly from Firestore...');

        // Get all messages where current user is sender or receiver
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('participants', 'array-contains', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(100)
        );

        const querySnapshot = await getDocs(q);

        // Process messages into conversations
        const conversationsMap = new Map();

        querySnapshot.forEach((doc) => {
          const message = { id: doc.id, ...doc.data() };
          const otherUserId = message.senderId === currentUser.uid ? message.receiverId : message.senderId;

          if (!conversationsMap.has(otherUserId)) {
            conversationsMap.set(otherUserId, {
              userId: otherUserId,
              lastMessage: message.content,
              timestamp: message.createdAt,
              unreadCount: message.read ? 0 : (message.receiverId === currentUser.uid ? 1 : 0)
            });
          }
        });

        const firestoreConversations = Array.from(conversationsMap.values());
        console.log('Conversations fetched from Firestore:', firestoreConversations.length);

        if (firestoreConversations.length > 0) {
          setConversations(firestoreConversations);
          setLoading(false);
          return; // Exit if we got conversations from Firestore
        }
      } catch (firestoreError) {
        console.error('Error fetching conversations from Firestore:', firestoreError);
        // Continue to Firebase REST API fallback
      }

      // Firebase REST API fallback as last resort
      try {
        // Get the auth token
        const token = await currentUser.getIdToken();
        console.log('Auth token obtained for Firebase API request');

        const response = await axios.get(
          `${apiBaseUrl}/messages/conversations/${currentUser.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            timeout: 5000 // 5 second timeout
          }
        );

        if (response.data && response.data.success && response.data.data) {
          console.log('Conversations fetched successfully via Firebase API');
          setConversations(response.data.data);
        } else {
          console.warn('Unexpected API response format:', response.data);
          setConversations([]);
        }
      } catch (restError) {
        console.error('Error fetching conversations via REST API:', restError);
        // If we get here, all methods have failed
        throw restError; // Re-throw to be caught by the outer catch block
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);

      // Provide more specific error messages but don't block the UI
      if (error.code === 'ECONNABORTED') {
        console.warn('Connection timeout. The server is not responding.');
      } else if (error.message.includes('Network Error')) {
        console.warn('Network error. Cannot connect to the server.');
      } else {
        console.warn(`Failed to load conversations: ${error.message}`);
      }

      // Set empty conversations but don't show error to user
      // This allows the chat to still function with new conversations
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="teacher-chat-container">
      <div className="chat-page-header">
        <h2>Chat with Students</h2>
        <p>Communicate with your students to provide academic support and mentorship</p>
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={fetchConversations}>Retry</button>
          </div>
        )}
      </div>

      <div className="chat-interface">
        <UserDirectory
          onSelectUser={handleSelectUser}
          fetchConversations={fetchConversations}
          conversations={conversations}
        />
        <ChatComponent
          selectedUser={selectedUser}
          fetchConversations={fetchConversations}
        />
      </div>
    </div>
  );
};

export default TeacherChat;