import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AlumniDashboard.css';
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { 
  Overview, 
  Profile, 
  Connections, 
  Notifications, 
  Mentorship, 
  Jobs, 
  Events, 
  Settings,
  Resources
} from './components';
import AlumniNetwork from './components/Network';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, subscribeToUserNotifications } from '../../services/notificationService';

const AlumniDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState(() => {
    // Check localStorage for saved section
    const savedSection = window.localStorage.getItem('alumniActiveSection');
    if (savedSection) {
      // Clear it after reading
      window.localStorage.removeItem('alumniActiveSection');
      return savedSection;
    }
    return 'overview';
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  // Get API_URL from environment with fallback
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Debug output to check API_URL
  console.log('**** ALUMNI DASHBOARD DEBUG ****');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Alumni Dashboard - API_URL from env:', process.env.REACT_APP_API_URL);
  console.log('Alumni Dashboard - Final API_URL:', API_URL);
  console.log('Alumni Dashboard - User state:', user ? { uid: user.uid, authenticated: true } : 'Not authenticated');
  console.log('Alumni Dashboard - Role:', role);
  
  const [connections, setConnections] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    graduationYear: "",
    program: "",
    currentPosition: "",
    company: "",
    skills: [],
    achievements: [],
    projects: [],
    bio: "",
    connections: []
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { id: 'jobs', label: 'Job Opportunities', icon: '💼' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'network', label: 'Network', icon: '🔗' },
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Log API info for debugging
      console.log('Fetching events with URL:', `${API_URL}/api/events/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`);
      console.log('User UID:', user?.uid);
      console.log('User role:', role);
      
      // Use the user-specific endpoint to get events created by this user
      const response = await fetch(`${API_URL}/api/events/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Events API Response status:', response.status);

      if (!response.ok) {
        console.log('Events API call failed, using mock data');
        // Generate mock events data if API call fails
        const mockEvents = generateMockEvents();
        setEvents(mockEvents);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Use the actual API data
      console.log('Alumni events received from API:', {
        createdEvents: data.createdEvents?.length || 0,
        registeredEvents: data.registeredEvents?.length || 0
      });
      
      // Sort events by date
      const sortedEvents = data.createdEvents?.sort((a, b) => new Date(a.date) - new Date(b.date)) || [];
      setEvents(sortedEvents);
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error('Error fetching events:', err);
      
      // Provide mock data even when errors occur
      console.log('Using mock events data due to API error');
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
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

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  // Existing effect for fetching alumni profile
  useEffect(() => {
    const fetchAlumniProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Alumni profile data loaded:', userData);
          setProfileData({
            name: userData.name || currentUser.displayName || "",
            email: userData.email || currentUser.email || "",
            phone: userData.phone || "",
            dateOfBirth: userData.dateOfBirth || "",
            address: userData.address || "",
            graduationYear: userData.graduationYear || "",
            program: userData.program || "",
            currentPosition: userData.currentPosition || "",
            company: userData.company || "",
            skills: userData.skills || [],
            achievements: userData.achievements || [],
            projects: userData.projects || [],
            bio: userData.bio || "",
            connections: userData.connections || []
          });
          
          // After setting profile data, fetch connected profiles
          if (userData.connections && userData.connections.length > 0) {
            console.log('Found connections in user data, fetching details...');
            fetchConnections(userData.connections);
          } else {
            console.log('No connections found in user data');
            setConnectionLoading(false);
          }
        } else {
          console.log('User document does not exist for current user');
          setConnectionLoading(false);
        }
      } catch (error) {
        console.error("Error fetching alumni profile:", error);
        setConnectionLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlumniProfile();
  }, [currentUser]);
  
  // Function to fetch connection profile details
  const fetchConnections = async (connectionIds) => {
    try {
      setConnectionLoading(true);
      console.log('Fetching connections for IDs:', connectionIds);
      const connectionProfiles = [];
      
      // Process each connection in batches
      for (const connectionId of connectionIds) {
        const userDocRef = doc(db, "users", connectionId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Found connection:', userData);
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
        } else {
          console.log('Connection not found for ID:', connectionId);
        }
      }
      
      console.log('Final connection profiles:', connectionProfiles);
      setConnections(connectionProfiles);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setConnectionLoading(false);
    }
  };
  
  // Handle click outside notifications panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // Replace the notifications mock data loading with actual data fetching
  useEffect(() => {
    // Set up real-time listener for notifications
    const fetchNotifications = async () => {
      if (!currentUser) return;
      
      try {
        console.log('Fetching notifications for user:', currentUser.uid);
        
        // Initial fetch of notifications
        const notificationsData = await getUserNotifications(currentUser.uid);
        console.log('Initial notifications loaded:', notificationsData.length);
        
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
        
        console.log('Setting up real-time notifications subscription');
        // Set up subscription for real-time updates
        const unsubscribe = subscribeToUserNotifications(currentUser.uid, (updatedNotifications) => {
          console.log('Received notification update, count:', updatedNotifications.length);
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter(n => !n.read).length);
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
  }, [currentUser]);
  
  // Handle notification click - update to use the service
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

  // Mark a notification as read
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
      if (!currentUser) return;
      
      await markAllNotificationsAsRead(currentUser.uid);
      
      // Update local state
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format notification timestamp
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return 'Just now';
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

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection': return '🤝';
      case 'event': return '📅';
      case 'job': return '💼';
      case 'message': return '✉️';
      case 'system': return '🔔';
      default: return '��';
    }
  };

  // Generate mock events data for testing
  const generateMockEvents = () => {
    const mockEventTitles = [
      'Annual Alumni Meetup', 
      'Career Development Workshop', 
      'Industry Networking Night', 
      'Graduate Research Symposium', 
      'Job Fair'
    ];
    
    const mockLocations = [
      'Main Campus Auditorium', 
      'Virtual (Zoom)', 
      'Downtown Conference Center', 
      'University Library', 
      'Tech Innovation Hub'
    ];
    
    const mockCategories = ['Networking', 'Workshop', 'Social', 'Career', 'Academic'];
    
    return Array.from({ length: 5 }, (_, i) => ({
      _id: `mock-event-${i+1}`,
      title: mockEventTitles[i % mockEventTitles.length],
      description: 'This is a mock event description for testing purposes. The real description would contain details about the event agenda, speakers, and goals.',
      date: new Date(Date.now() + ((i+1) * 7 * 24 * 60 * 60 * 1000)).toISOString(), // i+1 weeks in future
      time: '18:00 - 20:00',
      location: mockLocations[i % mockLocations.length],
      category: mockCategories[i % mockCategories.length],
      capacity: 50 + (i * 10),
      registrations: Math.floor(Math.random() * 40),
      organizer: user?.uid,
      createdAt: new Date().toISOString(),
      imageUrl: '',
      status: 'upcoming'
    }));
  };

  return (
    <div className="alumni-dashboard min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar - hidden on mobile, shown as a drawer or on larger screens */}
        <div className={`fixed inset-0 z-20 transform transition-transform duration-300 ease-in-out md:relative md:flex md:flex-col md:transform-none ${
          isNavExpanded ? 'translate-x-0' : '-translate-x-full'
        } md:w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}>
          
          {/* Mobile sidebar header - only visible on mobile */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img src="/assets/alumniLogo.png" alt="Logo" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Alumni Dashboard</h1>
            </div>
            <button 
              onClick={() => setIsNavExpanded(false)} 
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="p-4">
            <div className="mb-8 text-center">
              <div className="inline-block relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-light flex items-center justify-center text-white text-3xl">
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'A'}
                </div>
                <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
                  <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Link>
                </div>
              </div>
              <h2 className="mt-4 font-semibold text-gray-800 dark:text-white">{user?.displayName || 'Alumni'}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.company || user?.college || 'Alumni Member'}</p>
            </div>

            <nav className="mt-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  // Implement logout functionality
                }}
                className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsNavExpanded(true)} 
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <img src="/assets/alumniLogo.png" alt="Logo" className="w-8 h-8" />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Alumni Dashboard</h1>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setActiveSection('notifications')}
                  className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {/* Section Header */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center space-x-4">
                {/* Notification bell on desktop */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveSection('notifications')}
                    className={`p-2 rounded-full ${
                      activeSection === 'notifications' 
                        ? 'bg-primary-light text-primary' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Section Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {activeSection === 'overview' && (
                <Overview 
                  connections={connections || []}
                  isDarkMode={isDarkMode}
                />
              )}

              {activeSection === 'profile' && (
                <Profile 
                  profileData={profileData || {}}
                  currentUser={currentUser}
                  isDarkMode={isDarkMode}
                />
              )}

              {activeSection === 'notifications' && (
                <Notifications 
                  notifications={notifications}
                  getNotificationIcon={getNotificationIcon}
                  formatNotificationTime={formatNotificationTime}
                  markAsRead={markAsRead}
                  markAllAsRead={markAllAsRead}
                  isDarkMode={isDarkMode}
                />
              )}

              {activeSection === 'mentorship' && (
                <Mentorship 
                  isDarkMode={isDarkMode}
                  API_URL={API_URL}
                  user={currentUser}
                  role={role}
                />
              )}

              {activeSection === 'jobs' && (
                <Jobs 
                  isDarkMode={isDarkMode}
                  API_URL={API_URL}
                  user={currentUser}
                  role={role}
                />
              )}

              {activeSection === 'events' && (
                <Events 
                  events={events}
                  loading={loading}
                  error={error}
                  isDarkMode={isDarkMode}
                  API_URL={API_URL}
                  user={currentUser}
                  role={role}
                />
              )}

              {activeSection === 'network' && (
                <div className="network-section">
                  <AlumniNetwork currentUser={currentUser} isDarkMode={isDarkMode} />
                </div>
              )}

              {activeSection === 'settings' && (
                <Settings 
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isNavExpanded && (
        <div 
          className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-50"
          onClick={() => setIsNavExpanded(false)}
        ></div>
      )}
    </div>
  );
};

export default AlumniDashboard;