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
                        notifications.map(notification => (
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
                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatNotificationTime(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
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
                      <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl mb-4">
                        {user?.displayName ? user.displayName[0].toUpperCase() : '👤'}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.displayName || 'Teacher Name'}</h2>
                      <p className="text-gray-600 dark:text-gray-400">Professor, Computer Science</p>
                      <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</h3>
                        <p className="text-gray-900 dark:text-white">{user?.email || 'teacher@example.com'}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Phone</h3>
                        <p className="text-gray-900 dark:text-white">+1 (555) 123-4567</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Department</h3>
                        <p className="text-gray-900 dark:text-white">Computer Science</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Office</h3>
                        <p className="text-gray-900 dark:text-white">Room 301, Building B</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Office Hours</h3>
                        <p className="text-gray-900 dark:text-white">Mon, Wed: 10AM - 12PM</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Expertise</h3>
                        <p className="text-gray-900 dark:text-white">Algorithms, Machine Learning, Data Structures</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              {/* Courses content */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 