import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
  Events
} from './components';
import AlumniNetwork from './components/Network';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, subscribeToUserNotifications } from '../../services/notificationService';
import { getUserConnections } from '../../services/connectionService';
import axios from 'axios';

const AlumniDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();

  // Job and mentorship stats
  const [mentoringCount, setMentoringCount] = useState(0);
  const [jobPostingsCount, setJobPostingsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [filledJobsCount, setFilledJobsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  // Get API_URL from environment with fallback
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Debug output to check API_URL
  console.log('**** ALUMNI DASHBOARD DEBUG ****');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Alumni Dashboard - API_URL from env:', process.env.REACT_APP_API_URL);
  console.log('Alumni Dashboard - Final API_URL:', API_URL);
  console.log('Alumni Dashboard - User state:', currentUser ? { uid: currentUser.uid, authenticated: true } : 'Not authenticated');
  console.log('Alumni Dashboard - Role:', role);

  const [connections, setConnections] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(true);
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
    connections: [],
    // Additional fields from main Profile.js
    college: "",
    jobTitle: "",
    location: "",
    linkedIn: "",
    github: "",
    workExperience: [],
    education: [],
    institution: ""
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { id: 'jobs', label: 'Job Opportunities', icon: '💼' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'network', label: 'Network', icon: '🔗' }
  ];

  // Fetch mentoring, job posting, and events data for the alumni
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!currentUser) return;

      try {
        console.log('Fetching real mentorship, job, and event data for user:', currentUser.uid);
        const token = await currentUser.getIdToken();

        // Fetch mentoring relationships where alumni is the mentor - using the endpoint that works in Mentorship.js
        const mentorshipEndpoint = `${API_URL}/api/mentorships/user/${currentUser.uid}?firebaseUID=${currentUser.uid}&role=${role}`;
        console.log('Fetching mentorships from:', mentorshipEndpoint);

        const mentorshipResponse = await axios.get(
          mentorshipEndpoint,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Mentorship API response:', mentorshipResponse);

        // Process mentorship data using the same approach as in Mentorship.js
        let mentorships = [];
        if (mentorshipResponse.data && mentorshipResponse.data.success) {
          mentorships = mentorshipResponse.data.mentorships || [];
        } else if (Array.isArray(mentorshipResponse.data)) {
          mentorships = mentorshipResponse.data;
        } else if (mentorshipResponse.data && Array.isArray(mentorshipResponse.data.data)) {
          // Some APIs might wrap the data in a data property
          mentorships = mentorshipResponse.data.data;
        }

        console.log('Processed mentorships:', mentorships);
        setMentoringCount(mentorships.length);

        // Fetch job postings created by the alumni - using the endpoint that works in Jobs.js
        const jobsEndpoint = `${API_URL}/api/jobs/user/${currentUser.uid}?firebaseUID=${currentUser.uid}&role=${role}`;
        console.log('Fetching jobs from:', jobsEndpoint);

        const jobsResponse = await axios.get(
          jobsEndpoint,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Jobs API response:', jobsResponse);

        // Process job data using the same approach as in Jobs.js
        let jobPostings = [];
        if (jobsResponse.data && jobsResponse.data.success) {
          jobPostings = jobsResponse.data.jobs || [];
        } else if (Array.isArray(jobsResponse.data)) {
          jobPostings = jobsResponse.data;
        } else if (jobsResponse.data && Array.isArray(jobsResponse.data.data)) {
          // Some APIs might wrap the data in a data property
          jobPostings = jobsResponse.data.data;
        }

        console.log('Processed job postings:', jobPostings);
        setJobPostingsCount(jobPostings.length);

        // Count active and filled jobs based on status
        const activeJobs = jobPostings.filter(job =>
          job.status === 'open' || job.status === 'active' || !job.status
        );
        const filledJobs = jobPostings.filter(job =>
          job.status === 'filled' || job.status === 'closed'
        );

        console.log('Active jobs:', activeJobs.length, 'Filled jobs:', filledJobs.length);
        setActiveJobsCount(activeJobs.length);
        setFilledJobsCount(filledJobs.length);

        // Fetch events created by the alumni - using the endpoint from Events.js
        const eventsEndpoint = `${API_URL}/api/events/user/${currentUser.uid}?firebaseUID=${currentUser.uid}&role=${role}`;
        console.log('Fetching events from:', eventsEndpoint);

        const eventsResponse = await axios.get(
          eventsEndpoint,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Events API response:', eventsResponse);

        // Process events data similar to how we process jobs and mentorships
        let createdEvents = [];
        if (eventsResponse.data && eventsResponse.data.createdEvents) {
          createdEvents = eventsResponse.data.createdEvents || [];
        } else if (eventsResponse.data && eventsResponse.data.events) {
          createdEvents = eventsResponse.data.events || [];
        } else if (Array.isArray(eventsResponse.data)) {
          createdEvents = eventsResponse.data;
        } else if (eventsResponse.data && Array.isArray(eventsResponse.data.data)) {
          createdEvents = eventsResponse.data.data;
        }

        console.log('Processed events:', createdEvents);
        setEventsCount(createdEvents.length);

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        console.error("Error details:", error.response || error.message);
      }
    };

    if (activeSection === 'overview') {
      fetchDashboardStats();
    }
  }, [currentUser, activeSection, API_URL, role]);

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

      // Check if user is authenticated before making API calls
      if (!currentUser || !currentUser.uid) {
        console.log('User not authenticated, using mock data');
        const mockEvents = generateMockEvents();
        setEvents(mockEvents);
        setLoading(false);
        return;
      }

      // Log API info for debugging
      console.log('Fetching events for alumni:', {
        userUid: currentUser.uid,
        role: role,
        apiUrl: API_URL,
        endpoint: `${API_URL}/api/events/user/${currentUser.uid}?firebaseUID=${currentUser.uid}&role=${role}`
      });

      // Use the user-specific endpoint to get events created by this user
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/events/user/${currentUser.uid}?firebaseUID=${currentUser.uid}&role=${role}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Events API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Use the actual API data
      console.log('Alumni events received from API:', {
        response: 'success',
        responseStatus: response.status,
        createdEvents: data.createdEvents?.length || 0,
        registeredEvents: data.registeredEvents?.length || 0,
        data: data
      });

      // Check if createdEvents exists in the response
      if (!data.createdEvents) {
        console.warn('No createdEvents found in API response:', data);
        // Fallback to data.events if createdEvents doesn't exist
        // If data is an array, use it directly (API might return array instead of object)
        const eventsToUse = Array.isArray(data) ? data : (data.events || []);
        console.log('Using fallback events array:', eventsToUse);

        // Sort events by date
        const sortedEvents = eventsToUse.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log('Setting sorted events:', sortedEvents);
        setEvents(sortedEvents);
      } else {
        // Sort events by date
        const sortedEvents = data.createdEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log('Setting sorted events:', sortedEvents);
        setEvents(sortedEvents);
      }
    } catch (err) {
      setError(`Failed to load events: ${err.message}`);
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
    // Close sidebar on mobile when a section is selected
    if (isMobile) {
      setIsNavExpanded(false);
    }
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
          // Process skills data to handle both string and array formats
          const skillsData = userData.skills ?
            (typeof userData.skills === 'string' ?
              userData.skills.split(',').map(skill => skill.trim()) :
              userData.skills) :
            [];

          setProfileData({
            name: userData.name || currentUser.displayName || "",
            email: userData.email || currentUser.email || "",
            phone: userData.phone || "",
            dateOfBirth: userData.dateOfBirth || "",
            address: userData.address || "",
            graduationYear: userData.graduationYear || "",
            program: userData.program || "",
            currentPosition: userData.jobTitle || userData.currentPosition || "", // Map jobTitle to currentPosition
            company: userData.company || "",
            skills: skillsData,
            achievements: userData.achievements || [],
            projects: userData.projects || [],
            bio: userData.bio || "",
            connections: userData.connections || [],
            // Additional fields from main Profile.js
            college: userData.college || "",
            jobTitle: userData.jobTitle || "",
            location: userData.location || userData.address || "", // Map location to address if needed
            linkedIn: userData.linkedIn || "",
            github: userData.github || "",
            workExperience: userData.workExperience || [],
            education: userData.education || [],
            institution: userData.institution || userData.college || "" // Map institution to college if needed
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
      console.log('Fetching connections using optimized service');

      // Use the optimized getUserConnections function from connectionService
      // instead of fetching each connection individually
      if (currentUser && currentUser.uid) {
        const connectionProfiles = await getUserConnections(currentUser.uid);
        console.log('Connections loaded:', connectionProfiles.length);
        setConnections(connectionProfiles);
      } else {
        console.log('No current user, cannot fetch connections');
        setConnections([]);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      setConnections([]);
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
    // Generate some mock events for testing purposes
    return [
      {
        _id: '1',
        title: 'Alumni Networking Mixer',
        description: 'Connect with fellow alumni and expand your professional network.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        startTime: '18:00',
        endTime: '20:00',
        location: 'Virtual Meeting',
        category: 'Networking',
        registeredUsers: new Array(Math.floor(Math.random() * 15) + 5)
      },
      {
        _id: '2',
        title: 'Career Development Workshop',
        description: 'Learn strategies for advancing your career in today\'s competitive job market.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        startTime: '10:00',
        endTime: '12:00',
        location: 'Campus Center, Room 200',
        category: 'Workshop',
        registeredUsers: new Array(Math.floor(Math.random() * 10) + 3)
      },
      {
        _id: '3',
        title: 'Annual Alumni Gala',
        description: 'Join us for an evening of celebration and recognition of our accomplished alumni.',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 month ago
        startTime: '19:00',
        endTime: '23:00',
        location: 'Grand Hotel Ballroom',
        category: 'Social',
        registeredUsers: new Array(Math.floor(Math.random() * 30) + 20)
      }
    ];
  };

  // Add resize listener to handle mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !isNavExpanded) {
        setIsNavExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavExpanded]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <div
        className={`h-full transition-all duration-300 shadow-lg
                   ${isNavExpanded ? 'w-64' : 'w-20'}
                   ${isMobile ? 'fixed z-50' : 'relative'}`}
        style={{
          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          top: '0',
          left: isMobile && !isNavExpanded ? '-100%' : '0',
          height: '100%',
          overflow: 'auto',
          width: isMobile && isNavExpanded ? '100%' : ''
        }}
      >
        {/* Sidebar content */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            {isNavExpanded && (
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Alumni Dashboard</h3>
            )}
            <button
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              onClick={() => setIsNavExpanded(!isNavExpanded)}
            >
              {isNavExpanded ? '◀' : '▶'}
            </button>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-block relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-light flex items-center justify-center text-white text-3xl">
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'A'}
              </div>
              {isNavExpanded && (
                <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
                  <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
            {isNavExpanded && (
              <>
                <h2 className="mt-4 font-semibold text-gray-800 dark:text-white">{currentUser?.displayName || 'Alumni'}</h2>
                <p className="text-gray-500 dark:text-gray-400">{currentUser?.company || currentUser?.college || 'Alumni Member'}</p>
              </>
            )}
          </div>

          <nav className="mt-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {isNavExpanded && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isNavExpanded && item.id === 'notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {isNavExpanded && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                <p>© 2024 Alumni Network</p>
                <p className="mt-1">Version 1.0.0</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'w-full' : ''}`}>
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-40"
                style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex justify-between items-center">
            {isMobile && (
              <button
                className="p-2 mr-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 z-50"
                onClick={() => setIsNavExpanded(!isNavExpanded)}
              >
                {isNavExpanded ? '✕' : '☰'}
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              {/* Dark mode toggle */}
              <button
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                onClick={() => {
                  document.documentElement.classList.toggle('dark');
                  setIsDarkMode(!isDarkMode);
                }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {/* Notification button */}
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
                        onClick={() => {
                          setActiveSection('notifications');
                          setShowNotifications(false);
                        }}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {isMobile && isNavExpanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsNavExpanded(false)}
          ></div>
        )}

        <main className="p-3 md:p-6">
          {/* Section Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {activeSection === 'overview' && (
              <Overview
                connections={connections || []}
                isDarkMode={isDarkMode}
                mentoringCount={mentoringCount}
                jobPostingsCount={jobPostingsCount}
                activeJobsCount={activeJobsCount}
                filledJobsCount={filledJobsCount}
                eventsCount={eventsCount}
                navigate={navigate}
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

            {/* Settings section removed */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumniDashboard;