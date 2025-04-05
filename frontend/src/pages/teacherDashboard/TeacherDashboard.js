import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Overview, Profile, Notifications, Courses, Events, Resources, Students, Settings } from './components';
import TeacherNetwork from './components/Network';
import { getConnectionRequests, sendConnectionRequest } from '../../services/connectionService';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, subscribeToUserNotifications } from '../../services/notificationService';

const TeacherDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [events, setEvents] = useState([]);
  const [materials, setMaterials] = useState([
    {
      id: 1,
      title: 'Data Structures Notes',
      course: 'CS101 - Week 1',
      description: 'Comprehensive notes covering arrays, linked lists, and trees with examples.',
      students: 120,
      lastUpdated: '2 days ago',
      type: 'notes',
      icon: '📝',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Algorithm Analysis',
      course: 'CS201 - Assignment 2',
      description: 'Practice problems on time complexity and space complexity analysis.',
      students: 85,
      lastUpdated: 'Due: 1 week',
      type: 'assignment',
      icon: '📋',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Web Dev Template',
      course: 'CS301 - Project 1',
      description: 'Starter template for React.js project with authentication setup.',
      students: 45,
      lastUpdated: '1 week ago',
      type: 'template',
      icon: '🎯',
      color: 'yellow'
    },
    {
      id: 4,
      title: 'Database Design Quiz',
      course: 'CS401 - Quiz 3',
      description: 'Multiple choice questions on ER diagrams and normalization.',
      students: 65,
      lastUpdated: 'Due: 3 days',
      type: 'quiz',
      icon: '✍️',
      color: 'red'
    },
    {
      id: 5,
      title: 'ML Lab Manual',
      course: 'CS501 - Lab 2',
      description: 'Step-by-step guide for implementing machine learning algorithms.',
      students: 40,
      lastUpdated: '5 days ago',
      type: 'lab',
      icon: '🔬',
      color: 'indigo'
    },
    {
      id: 6,
      title: 'OS Study Guide',
      course: 'CS601 - Final Review',
      description: 'Comprehensive review materials for operating systems final exam.',
      students: 95,
      lastUpdated: '1 day ago',
      type: 'guide',
      icon: '📖',
      color: 'teal'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const { currentUser: user, role } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [connections, setConnections] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    department: "",
    institution: "",
    designation: "",
    expertise: [],
    achievements: [],
    publications: [],
    bio: "",
    connections: []
  });
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { 
      id: 'network', 
      label: 'Network', 
      icon: '🔗',
      badge: pendingRequests.incoming.length || null
    },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'resources', label: 'Teaching Resources', icon: '📋' },
    { id: 'students', label: 'My Students', icon: '👨‍🎓' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  useEffect(() => {
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Monitor for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeSection === 'events') {
      fetchEvents();
    }
  }, [activeSection]);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            name: userData.name || user.displayName || "",
            email: userData.email || user.email || "",
            phone: userData.phone || "",
            dateOfBirth: userData.dateOfBirth || "",
            address: userData.address || "",
            department: userData.department || "",
            institution: userData.institution || "",
            designation: userData.designation || "",
            expertise: userData.expertise || [],
            achievements: userData.achievements || [],
            publications: userData.publications || [],
            bio: userData.bio || "",
            connections: userData.connections || []
          });
          
          // After setting profile data, fetch connected profiles
          if (userData.connections && userData.connections.length > 0) {
            fetchConnections(userData.connections);
          } else {
            setConnectionLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherProfile();
  }, [user]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (user) {
        try {
          const requests = await getConnectionRequests(user.uid);
          setPendingRequests(requests);
        } catch (error) {
          console.error('Error fetching pending requests:', error);
        }
      }
    };

    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Function to fetch connection profile details
  const fetchConnections = async (connectionIds) => {
    try {
      setConnectionLoading(true);
      const connectionProfiles = [];
      
      // Process each connection in batches
      for (const connectionId of connectionIds) {
        const userDocRef = doc(db, "users", connectionId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          connectionProfiles.push({
            id: userDoc.id,
            name: userData.name || "",
            role: userData.role || "",
            jobTitle: userData.jobTitle || "",
            company: userData.company || "",
            institution: userData.institution || "",
            department: userData.department || "",
            photoURL: userData.photoURL || "",
            skills: userData.skills || []
          });
        }
      }
      
      setConnections(connectionProfiles);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setConnectionLoading(false);
    }
  };
  
  // Function to handle requesting a connection
  const handleRequestConnection = async (userId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await sendConnectionRequest(user.uid, userId);
      if (result.success) {
        alert('Connection request sent successfully');
      } else {
        alert(result.message || 'Failed to send connection request');
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert('An error occurred while sending the connection request');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter connections by role
  const studentConnections = connections.filter(conn => conn.role === "student");
  const alumniConnections = connections.filter(conn => conn.role === "alumni");
  const teacherConnections = connections.filter(conn => conn.role === "teacher");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching events for teacher:', {
        userUid: user?.uid,
        role: role,
        endpoint: `${API_URL}/api/events/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`
      });
      
      // Use the user-specific endpoint to get events created by this user, including role
      const response = await fetch(`${API_URL}/api/events/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      
      // Use the createdEvents array directly from the API response
      console.log('Teacher events received from API:', {
        createdEvents: data.createdEvents?.length || 0,
        createdEventsData: data.createdEvents,
        registeredEvents: data.registeredEvents?.length || 0
      });
      
      // Sort events by date
      const sortedEvents = data.createdEvents?.sort((a, b) => new Date(a.date) - new Date(b.date)) || [];
      setEvents(sortedEvents);
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);

    if (event < today) return 'past';
    if (event.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(search.toLowerCase());
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchesDateFilter = true;
    if (filter === 'upcoming') {
      matchesDateFilter = eventDate >= today;
    } else if (filter === 'past') {
      matchesDateFilter = eventDate < today;
    }

    return matchesSearch && matchesDateFilter;
  });

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      setLoading(true);
      // Call API to delete material
      const response = await fetch(`${API_URL}/api/materials/${materialId}?firebaseUID=${user.uid}&role=teacher`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete material');
      }

      // Remove material from local state
      setMaterials(prevMaterials => prevMaterials.filter(material => material.id !== materialId));
      
      // Show success message
      alert('Material deleted successfully');
    } catch (err) {
      console.error('Error deleting material:', err);
      alert(`Failed to delete material: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // Replace mock notification data loading with actual data fetching
  useEffect(() => {
    // Set up real-time listener for notifications
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        console.log('Fetching notifications for user:', user.uid);
        
        // Initial fetch of notifications
        const notificationsData = await getUserNotifications(user.uid);
        
        // Check if notificationsData is valid
        if (Array.isArray(notificationsData)) {
          console.log('Initial notifications loaded:', notificationsData.length);
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter(n => !n.read).length);
        } else {
          console.warn('No notifications data returned or invalid format, using empty array');
          setNotifications([]);
          setUnreadCount(0);
        }
        
        console.log('Setting up real-time notifications subscription');
        // Set up subscription for real-time updates
        const unsubscribe = subscribeToUserNotifications(user.uid, (updatedNotifications) => {
          if (Array.isArray(updatedNotifications)) {
            console.log('Received notification update, count:', updatedNotifications.length);
            setNotifications(updatedNotifications);
            setUnreadCount(updatedNotifications.filter(n => !n.read).length);
          } else {
            console.warn('Received invalid notifications update, using empty array');
            setNotifications([]);
            setUnreadCount(0);
          }
        });
        
        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up notifications:', error);
        // Provide empty notifications to prevent UI crashes
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    
    const unsubscribe = fetchNotifications();
    return () => {
      if (typeof unsubscribe === 'function') {
        console.log('Cleaning up notifications subscription');
        unsubscribe();
      }
    };
  }, [user]);

  // Update notification handling functions
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!user) return;
      
      await markAllNotificationsAsRead(user.uid);
      
      // Update local state
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updatedNotifications);
    setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read when clicked
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
        
        // Update local state to reflect the change
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      }
      
      // Navigate to the link if available
      if (notification.linkTo) {
    navigate(notification.linkTo);
      }
      
    setShowNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'student': return '👨‍🎓';
      case 'connection': return '🤝';
      case 'message': return '✉️';
      case 'event': return '📅';
      case 'course': return '📚';
      default: return '🔔';
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return 'just now';
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Otherwise, return the date
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <div 
        className={`h-full transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg
                   ${isNavExpanded ? 'w-64' : 'w-20'}`}
        style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          {isNavExpanded && (
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Teacher Dashboard</h3>
          )}
          <button 
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
            {isNavExpanded ? '◀' : '▶'}
          </button>
        </div>

        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center p-3 my-1 text-left rounded-lg transition-colors ${
                activeSection === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleSectionClick(item.id)}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {isNavExpanded && (
                <span className="font-medium">{item.label}</span>
              )}
              {item.badge && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-10"
                style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                  )}
                </button>

                {/* Notification Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => markAllAsRead()}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No notifications yet
                        </div>
                      ) : (
                        <div>
                          {notifications.map(notification => (
                            <div 
                              key={notification.id}
                              className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start">
                                <div className="mr-3 mt-1">
                                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <p className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                      {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                                      {formatNotificationTime(notification.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.type === 'student' ? 'Student Activity' :
                                     notification.type === 'course' ? 'Course Update' :
                                     notification.type === 'connection' ? 'Connection Request' :
                                     notification.type === 'message' ? 'New Message' : 'Event Update'}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="ml-2 h-3 w-3 bg-blue-500 rounded-full self-center"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button 
                        className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => setActiveSection('notifications')}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.displayName ? user.displayName[0].toUpperCase() : '👤'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeSection === 'overview' && (
            <Overview 
              connections={connections}
              studentConnections={studentConnections}
              alumniConnections={alumniConnections}
              teacherConnections={teacherConnections}
              isDarkMode={isDarkMode}
              handleRequestConnection={handleRequestConnection}
            />
          )}

          {activeSection === 'profile' && (
            <Profile 
              profileData={profileData}
              isDarkMode={isDarkMode}
              navigate={navigate}
            />
          )}

          {activeSection === 'notifications' && (
            <Notifications />
          )}

          {activeSection === 'courses' && (
            <Courses />
          )}

          {activeSection === 'events' && (
            <Events />
          )}

          {activeSection === 'resources' && (
            <Resources />
          )}

          {activeSection === 'students' && (
            <Students />
          )}

          {activeSection === 'settings' && (
            <Settings />
          )}

          {activeSection === 'network' && (
            <div className="network-section">
              <TeacherNetwork currentUser={user} isDarkMode={isDarkMode} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 