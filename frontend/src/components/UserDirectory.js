import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './UserDirectory.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

function formatTime(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function truncateMessage(message, maxLength = 30) {
  if (!message) return '';
  return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
}

const UserDirectory = ({ onSelectUser, fetchConversations, conversations = [] }) => {
  const { currentUser, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');

  // Process conversations to build a map of user IDs to conversation data
  const conversationMap = conversations.reduce((map, conv) => {
    if (conv.user && conv.user.uid) {
      map[conv.user.uid] = {
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0
      };
    }
    return map;
  }, {});

  useEffect(() => {
    if (currentUser) {
      console.log('UserDirectory: Fetching users for', currentUser.uid, 'with role', role);
      fetchUsers();
    }
  }, [currentUser, conversations, role]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get users from Firestore
      let usersList = [];

      try {
        console.log('Fetching users from Firestore...');
        // Filter based on role
        let targetRoles = [];
        if (role === 'student') {
          targetRoles = ['teacher']; // Students can chat with teachers
        } else if (role === 'teacher') {
          targetRoles = ['student']; // Teachers can chat with students
        } else if (role === 'alumni') {
          targetRoles = ['student', 'teacher']; // Alumni can chat with students and teachers
        }

        // If no roles specified, show all users
        if (targetRoles.length === 0) {
          targetRoles = ['student', 'teacher', 'alumni'];
        }

        console.log('Target roles for chat:', targetRoles);

        const promises = targetRoles.map(targetRole => {
          const q = query(collection(db, 'users'), where('role', '==', targetRole));
          return getDocs(q);
        });

        const snapshots = await Promise.all(promises);
        let totalUsers = 0;

        snapshots.forEach(snapshot => {
          totalUsers += snapshot.docs.length;
          snapshot.forEach(doc => {
            const userData = doc.data();
            // Skip the current user
            if (doc.id !== currentUser.uid) {
              usersList.push({
                firebaseUID: doc.id,
                name: userData.name || 'User',
                email: userData.email || '',
                role: userData.role || 'unknown',
                photoURL: userData.photoURL || null
              });
            }
          });
        });

        console.log(`Found ${usersList.length} users out of ${totalUsers} total (excluding current user)`);

        // If no users found, try fetching all users regardless of role
        if (usersList.length === 0) {
          console.log('No users found with specified roles, fetching all users...');
          const allUsersQuery = query(collection(db, 'users'));
          const allUsersSnapshot = await getDocs(allUsersQuery);

          allUsersSnapshot.forEach(doc => {
            const userData = doc.data();
            // Skip the current user
            if (doc.id !== currentUser.uid) {
              usersList.push({
                firebaseUID: doc.id,
                name: userData.name || 'User',
                email: userData.email || '',
                role: userData.role || 'unknown',
                photoURL: userData.photoURL || null
              });
            }
          });

          console.log(`Found ${usersList.length} users after fetching all users`);
        }
      } catch (error) {
        console.error('Error fetching users from Firestore:', error);

        // Fall back to the API if Firestore fails
        const response = await axios.get(`${apiBaseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });

        // Filter users by role and exclude current user
        usersList = response.data.filter(user =>
          user.firebaseUID !== currentUser.uid
        );
      }

      // Add conversation data to users
      usersList = usersList.map(user => {
        const conversationData = conversationMap[user.firebaseUID] || {};
        return {
          ...user,
          lastMessage: conversationData.lastMessage,
          unreadCount: conversationData.unreadCount || 0
        };
      });

      // Sort users with conversations first
      usersList.sort((a, b) => {
        // Users with conversations go first
        const aHasConversation = !!a.lastMessage;
        const bHasConversation = !!b.lastMessage;

        if (aHasConversation && !bHasConversation) return -1;
        if (!aHasConversation && bHasConversation) return 1;

        // If both have conversations, sort by most recent message
        if (aHasConversation && bHasConversation) {
          return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        }

        // Otherwise sort alphabetically by name
        return a.name.localeCompare(b.name);
      });

      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    // Convert database user to format expected by chat component
    const chatUser = {
      uid: user.firebaseUID,
      name: user.name,
      email: user.email,
      role: user.role,
      photoURL: user.photoURL || null
    };
    onSelectUser(chatUser);
  };

  const getDisplayUsers = () => {
    if (activeTab === 'recent') {
      // For recent tab, show only users with conversations
      return filteredUsers.filter(user => user.lastMessage);
    }
    return filteredUsers;
  };

  const displayUsers = getDisplayUsers();

  return (
    <div className="user-directory-container">
      <div className="directory-tabs">
        <button
          className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent Chats
        </button>
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Users
        </button>
      </div>

      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="users-list">
        {loading ? (
          <div className="loading-users">
            <div className="user-loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="users-error">
            <FaExclamationTriangle className="error-icon" />
            <p>{error}</p>
            <button
              onClick={fetchUsers}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="no-users">
            {activeTab === 'recent' && searchQuery === '' ? (
              <p>No recent conversations yet.<br />Start chatting with someone from the 'All Users' tab.</p>
            ) : searchQuery ? (
              <p>No users matching '{searchQuery}'</p>
            ) : (
              <p>No available users to chat with.</p>
            )}
          </div>
        ) : (
          displayUsers.map((user) => (
            <div
              key={user.firebaseUID}
              className="user-item"
              onClick={() => handleUserClick(user)}
            >
              {user.unreadCount > 0 && <div className="notification-dot" title={`${user.unreadCount} unread message(s)`} />}
              <div className="user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              <div className="user-info">
                <div className="user-name-container">
                  <h4 className="user-name">{user.name || 'User'}</h4>
                  {user.lastMessage && (
                    <span className="last-message-time">
                      {formatTime(user.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="user-details">
                  <span className="user-role">{user.role}</span>
                  {user.lastMessage && (
                    <p className="last-message-preview">
                      {user.lastMessage.senderId === currentUser.uid ? 'You: ' : ''}
                      {truncateMessage(user.lastMessage.content)}
                    </p>
                  )}
                </div>
              </div>
              {user.unreadCount > 0 && (
                <div className="unread-badge">{user.unreadCount}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDirectory;