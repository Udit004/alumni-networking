import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

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
      // In a real app, this would send a connection request to the backend
      // For now, we'll just show an alert
      alert(`Connection request sent to ${userId}`);
      
      // Here we would typically update a "connectionRequests" collection in Firestore
      // And add a notification for the other user
    } catch (error) {
      console.error("Error sending connection request:", error);
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

  // Fetch notifications (mock data for now)
  useEffect(() => {
    // Simulate fetching notifications from a server
    const mockNotifications = [
      {
        id: 1,
        type: 'student',
        message: 'Sarah Johnson submitted an assignment for Data Science 101',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        linkTo: '/courses/ds101/assignments/sarah-johnson'
      },
      {
        id: 2, 
        type: 'message',
        message: 'You received a new message from Michael Chen',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        linkTo: '/messages/michael-chen-id'
      },
      {
        id: 3,
        type: 'connection',
        message: 'Dr. James Wilson (Faculty) accepted your connection request',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        read: true,
        linkTo: '/directory/faculty/james-wilson-id'
      },
      {
        id: 4,
        type: 'course',
        message: 'Your course "Introduction to Machine Learning" has 15 new enrollment requests',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        linkTo: '/courses/ml101/enrollments'
      },
      {
        id: 5,
        type: 'event',
        message: 'Reminder: Faculty meeting tomorrow at 10 AM',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
        read: true,
        linkTo: '/events/faculty-meeting'
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(notification => !notification.read).length);
  }, []);

  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    setUnreadCount(prevUnreadCount => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? prevUnreadCount - 1 : prevUnreadCount;
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate(notification.linkTo);
    setShowNotifications(false);
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
                              className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats cards */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">🔗</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Connections</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{connections.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">👥</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Students</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{studentConnections.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">📚</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Courses</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">4</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">📅</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Events</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connections Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">My Connections</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate('/directory')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span>Find Connections</span> 🔍
                    </button>
                  </div>
                </div>
                
                {connectionLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with any students or alumni yet.</p>
                    <button 
                      onClick={() => navigate('/directory')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Browse Directory
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Student Connections */}
                    {studentConnections.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                          Student Connections
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {studentConnections.map((student) => (
                            <div 
                              key={student.id}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => navigate(`/directory/student/${student.id}`)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white overflow-hidden">
                                  {student.photoURL ? (
                                    <img src={student.photoURL} alt={student.name} className="h-full w-full object-cover" />
                                  ) : (
                                    student.name?.charAt(0).toUpperCase() || "S"
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 dark:text-white">{student.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {student.program} {student.batch && `Batch ${student.batch}`}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.isArray(student.skills) && student.skills.slice(0, 2).map((skill, index) => (
                                      <span 
                                        key={index}
                                        className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {Array.isArray(student.skills) && student.skills.length > 2 && (
                                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                        +{student.skills.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Alumni Connections */}
                    {alumniConnections.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                          Alumni Connections
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {alumniConnections.map((alumni) => (
                            <div 
                              key={alumni.id}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => navigate(`/directory/alumni/${alumni.id}`)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                                  {alumni.photoURL ? (
                                    <img src={alumni.photoURL} alt={alumni.name} className="h-full w-full object-cover" />
                                  ) : (
                                    alumni.name?.charAt(0).toUpperCase() || "A"
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 dark:text-white">{alumni.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {alumni.jobTitle} {alumni.company && `at ${alumni.company}`}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.isArray(alumni.skills) && alumni.skills.slice(0, 2).map((skill, index) => (
                                      <span 
                                        key={index}
                                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {Array.isArray(alumni.skills) && alumni.skills.length > 2 && (
                                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                        +{alumni.skills.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Teacher Connections */}
                    {teacherConnections.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                          Teacher Connections
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {teacherConnections.map((teacher) => (
                            <div 
                              key={teacher.id}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => navigate(`/directory/teacher/${teacher.id}`)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center text-white overflow-hidden">
                                  {teacher.photoURL ? (
                                    <img src={teacher.photoURL} alt={teacher.name} className="h-full w-full object-cover" />
                                  ) : (
                                    teacher.name?.charAt(0).toUpperCase() || "T"
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 dark:text-white">{teacher.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {teacher.department} {teacher.institution && `at ${teacher.institution}`}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.isArray(teacher.skills) && teacher.skills.slice(0, 2).map((skill, index) => (
                                      <span 
                                        key={index}
                                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {Array.isArray(teacher.skills) && teacher.skills.length > 2 && (
                                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                        +{teacher.skills.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Suggested Connections */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Suggested Connections</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Student Suggestion */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl overflow-hidden mb-3">
                        <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Suggested Student" className="h-full w-full object-cover" />
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Michael Chen</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Computer Science, Batch 2024</p>
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                          Python
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                          Machine Learning
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRequestConnection('michael-chen-id')}
                        className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                  
                  {/* Alumni Suggestion */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl overflow-hidden mb-3">
                        <img src="https://randomuser.me/api/portraits/men/78.jpg" alt="Suggested Alumni" className="h-full w-full object-cover" />
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">David Kim</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Senior Data Scientist at Microsoft</p>
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          Data Science
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          AI
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRequestConnection('david-kim-id')}
                        className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                  
                  {/* Teacher Suggestion */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl overflow-hidden mb-3">
                        <img src="https://randomuser.me/api/portraits/women/55.jpg" alt="Suggested Teacher" className="h-full w-full object-cover" />
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Dr. Sarah Wilson</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Data Science Department</p>
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                          Data Science
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                          Big Data
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRequestConnection('sarah-wilson-id')}
                        className="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-section space-y-8">
              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl mb-4 overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          user?.displayName ? user.displayName[0].toUpperCase() : '👤'
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{profileData.name || user?.displayName || 'Teacher Name'}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{profileData.designation || 'Professor'}, {profileData.department || 'Department'}</p>
                      <button 
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        onClick={() => navigate('/profile')}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</h3>
                        <p className="text-gray-900 dark:text-white">{profileData.email || user?.email || 'teacher@example.com'}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Phone</h3>
                        <p className="text-gray-900 dark:text-white">{profileData.phone || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Department</h3>
                        <p className="text-gray-900 dark:text-white">{profileData.department || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Institution</h3>
                        <p className="text-gray-900 dark:text-white">{profileData.institution || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Address</h3>
                        <p className="text-gray-900 dark:text-white">{profileData.address || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Expertise</h3>
                        <div className="flex flex-wrap gap-1">
                          {profileData.expertise && profileData.expertise.length > 0 ? (
                            profileData.expertise.map((skill, index) => (
                              <span 
                                key={index}
                                className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-900 dark:text-white">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {profileData.bio && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">About Me</h3>
                  <p className="text-gray-700 dark:text-gray-300">{profileData.bio}</p>
                </div>
              )}

              {/* Publications Section */}
              {profileData.publications && profileData.publications.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Publications</h3>
                  <ul className="space-y-3">
                    {profileData.publications.map((publication, index) => (
                      <li key={index} className="pl-4 border-l-2 border-blue-500">
                        <p className="text-gray-800 dark:text-white font-medium">{publication.title || publication}</p>
                        {publication.journal && <p className="text-gray-600 dark:text-gray-400 text-sm">{publication.journal}</p>}
                        {publication.year && <p className="text-gray-500 dark:text-gray-500 text-xs">{publication.year}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Achievements Section */}
              {profileData.achievements && profileData.achievements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Achievements</h3>
                  <ul className="space-y-3">
                    {profileData.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-yellow-500">🏆</span>
                        <p className="text-gray-800 dark:text-white">{achievement.title || achievement}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="notifications-section">
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Faculty Notifications</h2>
                  <div className="flex gap-2">
                    <select 
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        // Here we would filter notifications by type
                        console.log("Filter by type:", e.target.value);
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="student">Student Updates</option>
                      <option value="course">Course Updates</option>
                      <option value="event">Events</option>
                      <option value="connection">Connections</option>
                      <option value="message">Messages</option>
                    </select>
                    <select 
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        // Here we would filter notifications by time
                        console.log("Filter by time:", e.target.value);
                      }}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <button 
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      onClick={markAllAsRead}
                    >
                      Mark All as Read
                    </button>
                  </div>
                </div>

                {/* Notification grouping by day */}
                <div className="space-y-6">
                  {/* Today's notifications */}
                  <div>
                    <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-2 text-sm">Today</h3>
                    <div className="space-y-1">
                      {notifications
                        .filter(notification => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return notification.timestamp >= today;
                        })
                        .map(notification => (
                          <div 
                            key={notification.id}
                            className={`p-4 rounded-lg flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className={`mr-4 p-3 rounded-full ${
                              notification.type === 'student' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                              notification.type === 'course' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                              notification.type === 'connection' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                              notification.type === 'message' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
                            }`}>
                              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
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
                        ))}
                    </div>
                  </div>

                  {/* Earlier notifications */}
                  <div>
                    <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-2 text-sm">Earlier</h3>
                    <div className="space-y-1">
                      {notifications
                        .filter(notification => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return notification.timestamp < today;
                        })
                        .map(notification => (
                          <div 
                            key={notification.id}
                            className={`p-4 rounded-lg flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className={`mr-4 p-3 rounded-full ${
                              notification.type === 'student' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                              notification.type === 'course' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                              notification.type === 'connection' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                              notification.type === 'message' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
                            }`}>
                              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
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
                        ))}
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {notifications.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">🔔</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Notifications</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      You don't have any notifications yet. Check back later for updates on student activities, events, and more.
                    </p>
                  </div>
                )}
              </div>

              {/* Notification Settings */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Student Submission Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when students submit assignments</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="submission-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="submission-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Course Enrollment Updates</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new course enrollments</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="enrollment-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="enrollment-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Department Announcements</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about announcements from your department</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="department-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="department-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Connection Requests</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone sends you a connection request</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="connection-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="connection-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Message Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive new messages</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="message-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="message-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications in addition to in-app notifications</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="email-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="email-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'courses' && (
            <div className="courses-section">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Courses</h2>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Add New Course
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Course Cards */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-3">📚</div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Data Structures & Algorithms</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">CS101 • Fall 2023</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">45 Students</span>
                      <a href="#" className="text-blue-500 hover:underline">View Course</a>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-3">🖥️</div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Web Development</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">CS301 • Fall 2023</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">32 Students</span>
                      <a href="#" className="text-blue-500 hover:underline">View Course</a>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-3">🤖</div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Artificial Intelligence</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">CS401 • Fall 2023</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">28 Students</span>
                      <a href="#" className="text-blue-500 hover:underline">View Course</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'events' && (
            <div className="events-section">
              <div className="section-header mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Events</h2>
                <button 
                  className="create-event-btn px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
                  onClick={() => navigate('/create-event')}
                >
                  <span className="mr-2">+</span> Create Event
                </button>
              </div>

              <div className="events-filters mb-6">
                <div className="search-box mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full py-2 px-10 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: isDarkMode ? '#374151' : 'white' }}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300">
                      🔍
                    </span>
                  </div>
                </div>
                
                <div className="filter-buttons flex flex-wrap gap-2">
                  <button 
                    className={`filter-btn px-4 py-2 rounded-md transition-colors ${
                      filter === "all" 
                        ? "bg-blue-500 text-white dark:text-white font-medium active" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setFilter("all")}
                    style={{ 
                      color: filter === "all" ? "white" : (isDarkMode ? "white" : "#374151") 
                    }}
                  >
                    All Events
                  </button>
                  <button 
                    className={`filter-btn px-4 py-2 rounded-md transition-colors ${
                      filter === "upcoming" 
                        ? "bg-blue-500 text-white dark:text-white font-medium active" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setFilter("upcoming")}
                    style={{ 
                      color: filter === "upcoming" ? "white" : (isDarkMode ? "white" : "#374151") 
                    }}
                  >
                    Upcoming
                  </button>
                  <button 
                    className={`filter-btn px-4 py-2 rounded-md transition-colors ${
                      filter === "past" 
                        ? "bg-blue-500 text-white dark:text-white font-medium active" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setFilter("past")}
                    style={{ 
                      color: filter === "past" ? "white" : (isDarkMode ? "white" : "#374151") 
                    }}
                  >
                    Past
                  </button>
                </div>
              </div>

              {error && <div className="error-message bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6">{error}</div>}

              {loading ? (
                <div className="loading-state flex justify-center items-center p-12">
                  <div className="loading-spinner w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="ml-4 text-gray-600 dark:text-gray-300">Loading events...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => {
                    const status = getEventStatus(event.date);
                    const attendees = event.registeredUsers?.length || 0;
                    
                    return (
                      <div key={event._id} 
                           className="event-card bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700 relative"
                           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
                      >
                        <div className={`event-status text-xs font-semibold px-3 py-2.5 inline-block absolute left-0 top-0 rounded-br-lg w-auto whitespace-nowrap ${
                          status === "upcoming" 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-500 text-white"
                        }`}>
                          {status === 'upcoming' ? 'Upcoming' : 'Past'}
                        </div>
                        
                        <button 
                          className="absolute top-0 right-0 mt-1 mr-1 p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/edit-event/${event._id}`);
                          }}
                          style={{ fontSize: '8px' }}
                        >
                          ✏️
                        </button>
                        
                        <div className="event-content p-5">
                          <h3 className="event-title text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                          <p className="event-description text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
                          
                          <div className="event-details space-y-2">
                            <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                              <span className="detail-icon mr-2">📅</span>
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                              <span className="detail-icon mr-2">⏰</span>
                              <span>{event.time}</span>
                            </div>
                            <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                              <span className="detail-icon mr-2">📍</span>
                              <span>{event.location}</span>
                            </div>
                            <div className="detail-item flex items-center text-gray-700 dark:text-gray-300">
                              <span className="detail-icon mr-2">👥</span>
                              <span>{attendees} {attendees === 1 ? 'Student' : 'Students'} Registered</span>
                            </div>
                          </div>
                          
                          <div className="event-actions mt-4 flex gap-2">
                            <button
                              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                              onClick={() => navigate(`/events/${event._id}`)}
                            >
                              View Details
                            </button>
                            <button
                              className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              onClick={() => {
                                if(window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                                  // Call API to delete event
                                  fetch(`${API_URL}/api/events/${event._id}?firebaseUID=${user?.uid}&role=${role}`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' }
                                  })
                                  .then(response => {
                                    if(!response.ok) throw new Error('Failed to delete event');
                                    return response.json();
                                  })
                                  .then(() => {
                                    // Remove event from the list
                                    setEvents(events.filter(e => e._id !== event._id));
                                    alert('Event deleted successfully');
                                  })
                                  .catch(err => {
                                    console.error('Error deleting event:', err);
                                    alert('Failed to delete event');
                                  });
                                }
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-events flex flex-col items-center justify-center py-12">
                  <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No events found</p>
                  <button 
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    onClick={() => navigate('/create-event')}
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'resources' && (
            <div className="resources-section">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Teaching Resources</h2>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Add Resource
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Resource Cards */}
                  {materials.map((material) => (
                    <div key={material.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className={`p-3 rounded-full bg-${material.color}-100 dark:bg-${material.color}-900 text-${material.color}-500 dark:text-${material.color}-300 text-xl mr-3`}>
                          {material.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{material.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{material.course}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{material.description}</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400">{material.students} Students</span>
                            <span className="text-gray-500 dark:text-gray-400">{material.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="students-section">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Students</h2>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Courses</option>
                      <option value="cs101">CS101</option>
                      <option value="cs301">CS301</option>
                      <option value="cs401">CS401</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Student Rows */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                              <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Student" className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Michael Johnson
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: ST10034
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">CS101</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Data Structures
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">85%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          Yesterday, 3:24 PM
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-500 hover:text-blue-600 mr-3">View</a>
                          <a href="#" className="text-blue-500 hover:text-blue-600">Message</a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                              <img src="https://randomuser.me/api/portraits/women/2.jpg" alt="Student" className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Emma Wilson
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: ST10045
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">CS301</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Web Development
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: '92%' }}></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">92%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          Today, 10:15 AM
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-500 hover:text-blue-600 mr-3">View</a>
                          <a href="#" className="text-blue-500 hover:text-blue-600">Message</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="settings-section">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>
                
                <div className="space-y-6">
                  {/* Account Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
                          value={user?.email || "teacher@example.com"}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-800 dark:text-white font-medium">Dark Mode</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                        </div>
                        <div className="relative inline-block w-12 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="theme-toggle" 
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" 
                            checked={isDarkMode}
                            onChange={() => document.documentElement.classList.toggle('dark')}
                          />
                          <label htmlFor="theme-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-800 dark:text-white font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications</p>
                        </div>
                        <div className="relative inline-block w-12 align-middle select-none">
                          <input type="checkbox" id="email-notif-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" defaultChecked />
                          <label htmlFor="email-notif-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Privacy */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Privacy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-800 dark:text-white font-medium">Profile Visibility</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile</p>
                        </div>
                        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                          <option value="public">Public</option>
                          <option value="connections">Connections Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Save Button */}
                  <div className="mt-6">
                    <button className="w-full sm:w-auto px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 