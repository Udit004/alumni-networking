import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import UserDirectory from '../../components/UserDirectory';
import ChatComponent from '../../components/ChatComponent';
import './TeacherChat.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const mongoApiBaseUrl = process.env.REACT_APP_MONGO_API_BASE_URL || 'http://localhost:5000/api/messages-db';

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

      // Try MongoDB API first
      try {
        console.log('Trying to fetch conversations via MongoDB API...');
        const mongoResponse = await axios.get(
          `${mongoApiBaseUrl}/conversations/${currentUser.uid}`,
          {
            timeout: 5000 // 5 second timeout
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

      // Firebase API fallback
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
    } catch (error) {
      console.error('Error fetching conversations:', error);

      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        setError('Connection timeout. The server is not responding. Please check if the backend server is running.');
      } else if (error.message.includes('Network Error')) {
        setError('Network error. Cannot connect to the server. Please check if the backend server is running.');
      } else {
        setError('Failed to load conversations. Please try refreshing the page.');
      }

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