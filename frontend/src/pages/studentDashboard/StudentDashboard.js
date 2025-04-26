import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Network from "./components/Network";
import { getConnectionRequests } from "../../services/connectionService";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, subscribeToUserNotifications } from '../../services/notificationService';
import Profile from "./components/Profile";
import EnrolledEvents, { getUpcomingEventsCount } from "./EnrolledEvents";
import { fetchEnrolledEventsData } from "./services/eventService";
import Mentorship from "./components/Mentorship";
import Jobs from "./components/Jobs";
import Overview from "./components/Overview";
import Announcements from "./components/Announcements";
import Courses from "./components/Courses";
import axios from 'axios';
import { API_URLS, DEFAULT_TIMEOUT } from '../../config/apiConfig';
import { getUserEvents, getStudentCourses } from '../../services/firestoreFallbackService';

const StudentDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [jobApplicationsCount, setJobApplicationsCount] = useState(0);
  const [mentorshipsCount, setMentorshipsCount] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    enrollmentNumber: "",
    program: "",
    admissionYear: "",
    batch: "",
    currentSemester: "",
    cgpa: "",
    skills: [],
    achievements: [],
    projects: [],
    courses: [],
    bio: "",
    connections: [], // Add connections array to track connected profiles
    // Additional fields from main Profile.js
    institution: "",
    currentYear: "",
    graduationYear: "",
    location: "",
    linkedIn: "",
    github: "",
    interests: [],
    education: [],
    studentId: ""
  });
  const [connections, setConnections] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

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
    const fetchStudentProfile = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Fetch academic records if they exist in a separate collection
          let academicData = {};
          if (userData.academicRecordId) {
            const academicRef = doc(db, "academicRecords", userData.academicRecordId);
            const academicDoc = await getDoc(academicRef);
            if (academicDoc.exists()) {
              academicData = academicDoc.data();
            }
          }

          // Process skills data to handle both string and array formats
          const skillsData = userData.skills ?
            (typeof userData.skills === 'string' ?
              userData.skills.split(',').map(skill => skill.trim()) :
              userData.skills) :
            [];

          // Process interests data similarly
          const interestsData = userData.interests ?
            (typeof userData.interests === 'string' ?
              userData.interests.split(',').map(interest => interest.trim()) :
              userData.interests) :
            [];

          setProfileData({
            name: userData.name || currentUser.displayName || "",
            email: userData.email || currentUser.email || "",
            phone: userData.phone || "",
            dateOfBirth: userData.dateOfBirth || "",
            address: userData.address || "",
            enrollmentNumber: userData.enrollmentNumber || academicData.enrollmentNumber || "",
            program: userData.program || academicData.program || "",
            admissionYear: userData.admissionYear || academicData.admissionYear || "",
            batch: userData.batch || academicData.batch || "",
            currentSemester: userData.currentSemester || academicData.currentSemester || "",
            cgpa: userData.cgpa || academicData.cgpa || "",
            skills: skillsData,
            achievements: userData.achievements || [],
            projects: userData.projects || [],
            courses: userData.courses || academicData.courses || [],
            bio: userData.bio || "",
            connections: userData.connections || [],
            // Additional fields from main Profile.js
            institution: userData.institution || userData.college || "",
            currentYear: userData.currentYear || "",
            graduationYear: userData.graduationYear || "",
            location: userData.location || userData.address || "",
            linkedIn: userData.linkedIn || "",
            github: userData.github || "",
            interests: interestsData,
            education: userData.education || [],
            studentId: userData.studentId || userData.enrollmentNumber || ""
          });

          // After setting profile data, fetch connected profiles
          if (userData.connections && userData.connections.length > 0) {
            fetchConnections(userData.connections);
          } else {
            setConnectionLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [currentUser]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (currentUser) {
        try {
          const requests = await getConnectionRequests(currentUser.uid);
          setPendingRequests(requests);
        } catch (error) {
          console.error('Error fetching pending requests:', error);
        }
      }
    };

    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
    if (!currentUser) return;

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
  const alumniConnections = connections.filter(conn => conn.role === "alumni");
  const teacherConnections = connections.filter(conn => conn.role === "teacher");

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'events', label: 'Enrolled Events', icon: '📅' },
    { id: 'courses', label: 'Course Materials', icon: '📚' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { id: 'jobs', label: 'Jobs & Internships', icon: '💼' },
    { id: 'network', label: 'Network', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
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
      if (!currentUser) return;

      try {
        // Initial fetch of notifications
        const notificationsData = await getUserNotifications(currentUser.uid);
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);

        // Set up subscription for real-time updates
        const unsubscribe = subscribeToUserNotifications(currentUser.uid, (updatedNotifications) => {
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        });

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    const unsubscribe = fetchNotifications();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Mark a notification as read - update to use the service
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

  // Mark all notifications as read - update to use the service
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

  // Fetch enrolled events data for the overview counter
  useEffect(() => {
    const fetchEnrolledEvents = async () => {
      if (!currentUser) return;

      try {
        const eventsData = await fetchEnrolledEventsData(currentUser.uid);
        setUpcomingEventsCount(getUpcomingEventsCount(eventsData));
      } catch (err) {
        console.error('Error fetching enrolled events for counter:', err);
      }
    };

    fetchEnrolledEvents();
  }, [currentUser]);

  // Function to fetch job applications, mentorships, and courses counts
  useEffect(() => {
    const fetchCounts = async () => {
      if (!currentUser) return;

      try {
        // Fetch job applications count
        try {
          const token = await currentUser.getIdToken();
          const jobAppResponse = await axios.get(
            `${API_URLS.main}/job-applications`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: DEFAULT_TIMEOUT
            }
          );

          let applicationData = [];
          if (jobAppResponse.data && jobAppResponse.data.success) {
            if (Array.isArray(jobAppResponse.data.data)) {
              applicationData = jobAppResponse.data.data;
            } else if (Array.isArray(jobAppResponse.data.applications)) {
              applicationData = jobAppResponse.data.applications;
            }
          } else if (Array.isArray(jobAppResponse.data)) {
            applicationData = jobAppResponse.data;
          }

          // Filter for current user's applications
          const userApplications = applicationData.filter(app => app.userId === currentUser.uid);
          setJobApplicationsCount(userApplications.length);
        } catch (jobError) {
          console.error("Error fetching job applications:", jobError);
          // Set default value if API fails
          setJobApplicationsCount(0);
        }

        // Fetch mentorships count
        try {
          const mentorshipResponse = await axios.get(
            `${API_URLS.main}/mentorships/user/${currentUser.uid}`,
            { timeout: DEFAULT_TIMEOUT }
          );

          const userMentorships = mentorshipResponse.data.success ?
            (mentorshipResponse.data.mentorships ||
            mentorshipResponse.data.enrolledMentorships ||
            []) : [];

          setMentorshipsCount(Array.isArray(userMentorships) ? userMentorships.length : 0);
        } catch (mentorshipError) {
          console.error("Error fetching mentorships:", mentorshipError);
          // Set default value if API fails
          setMentorshipsCount(0);
        }

        // Fetch enrolled courses count
        try {
          console.log(`Trying to fetch enrolled courses from API...`);
          const token = await currentUser.getIdToken();
          const response = await axios.get(
            `${API_URLS.courses}/student/${currentUser.uid}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: DEFAULT_TIMEOUT
            }
          );

          if (response.data && response.data.success) {
            const enrolledCourses = response.data.courses || [];
            setEnrolledCoursesCount(enrolledCourses.length);
            console.log(`Found ${enrolledCourses.length} enrolled courses from API`);
          }
        } catch (coursesError) {
          console.error("Error fetching courses from API:", coursesError);

          // Try Firestore fallback
          try {
            console.log('Using Firestore fallback for courses...');
            const courses = await getStudentCourses(currentUser.uid);
            console.log('Courses from Firestore:', courses);
            setEnrolledCoursesCount(courses.length);
          } catch (firestoreError) {
            console.error("Error fetching courses from Firestore:", firestoreError);
            // Set default value if both API and Firestore fail
            setEnrolledCoursesCount(0);
          }
        }
      } catch (error) {
        console.error("Error fetching application, mentorship, and course counts:", error);
      }
    };

    fetchCounts();
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

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'connection': return '🤝';
      case 'connection_request': return '🤝';
      case 'connection_accepted': return '🤝';
      case 'message': return '✉️';
      case 'event': return '📅';
      case 'job': return '💼';
      case 'course': return '📚';
      case 'mentorship': return '🧠';
      case 'assignment': return '📝';
      case 'deadline': return '⏰';
      case 'grade': return '🎓';
      case 'system': return '🔔';
      default: return '🔔';
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than an hour
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    }

    // Less than a day
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    }

    // Less than a week
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}d ago`;
    }
    // Otherwise, return the date
    return timestamp.toLocaleDateString();
  };

  // Render active section
  // This function is used to render the active section
  const renderActiveSection = () => {
    // We're now using conditional rendering directly in the JSX
    // This function is kept for compatibility but returns null
    return null;
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
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Student Dashboard</h3>
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
                {profileData.name ? (
                  profileData.name.charAt(0).toUpperCase()
                ) : (
                  '👤'
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderActiveSection()}
          {activeSection === 'profile' && (
            <Profile isDarkMode={isDarkMode} />
          )}

          {activeSection === 'overview' && (
            <Overview
              connections={connections}
              courseCount={enrolledCoursesCount}
              isDarkMode={isDarkMode}
              navigate={navigate}
              jobApplicationsCount={jobApplicationsCount}
              mentorshipsCount={mentorshipsCount}
              upcomingEventsCount={upcomingEventsCount}
            />
          )}

          {activeSection === 'events' &&
            <EnrolledEvents
              onEventsLoaded={(events) => {
                setUpcomingEventsCount(getUpcomingEventsCount(events));
              }}
            />}

          {activeSection === 'courses' && (
            <Courses isDarkMode={isDarkMode} />
          )}

          {activeSection === 'mentorship' && (
            <Mentorship isDarkMode={isDarkMode} />
          )}

          {activeSection === 'jobs' && (
            <Jobs isDarkMode={isDarkMode} />
          )}

          {activeSection === 'settings' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your account preferences and dashboard appearance.</p>
                </div>
                <button className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Setting Categories Sidebar */}
                <div className="md:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-4">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-800 dark:text-white">Settings Categories</h3>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 py-3 flex items-center text-left bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-700 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                      </button>
                      <button className="w-full px-4 py-3 flex items-center text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Privacy & Security
                      </button>
                      <button className="w-full px-4 py-3 flex items-center text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Appearance
                      </button>
                      <button className="w-full px-4 py-3 flex items-center text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                        Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="md:col-span-3">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Social Profiles</h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-12 text-center text-xl mr-3 text-blue-500">
                          <i className="fab fa-linkedin"></i>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            placeholder="LinkedIn URL"
                            defaultValue="https://linkedin.com/in/johndoe"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 text-center text-xl mr-3 text-gray-700 dark:text-gray-300">
                          <i className="fab fa-github"></i>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            placeholder="GitHub URL"
                            defaultValue="https://github.com/johndoe"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 text-center text-xl mr-3 text-purple-500">
                          <i className="fas fa-globe"></i>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            placeholder="Portfolio Website"
                            defaultValue="https://johndoe.dev"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Display Preferences</h3>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">Dark Mode</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark themes</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">Email Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">Push Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on this device</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="relative inline-block w-12 align-middle select-none">
                            <input type="checkbox" id="push-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" />
                            <label htmlFor="push-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                          </div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">Layout Density</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Adjust the layout density to your preference</p>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex-1 relative border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex flex-col items-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500">
                            <input type="radio" name="density" className="sr-only" defaultChecked />
                            <span className="h-10 w-10 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">Compact</span>
                            <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500"></span>
                          </label>
                          <label className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex flex-col items-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500">
                            <input type="radio" name="density" className="sr-only" />
                            <span className="h-10 w-10 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zM4 13h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1z" />
                              </svg>
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">Comfortable</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">My Notifications</h2>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        // Here we would filter notifications by type
                        console.log("Filter by type:", e.target.value);
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="assignment">Assignments</option>
                      <option value="deadline">Deadlines</option>
                      <option value="grade">Grades</option>
                      <option value="connection">Connections</option>
                      <option value="connection_request">Connection Requests</option>
                      <option value="connection_accepted">Connection Accepted</option>
                      <option value="message">Messages</option>
                      <option value="event">Events</option>
                      <option value="job">Jobs</option>
                      <option value="course">Courses</option>
                      <option value="mentorship">Mentorships</option>
                      <option value="system">System</option>
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
                              notification.type === 'assignment' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                              notification.type === 'deadline' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500' :
                              notification.type === 'grade' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                              notification.type === 'connection' || notification.type === 'connection_request' || notification.type === 'connection_accepted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                              notification.type === 'message' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                              notification.type === 'event' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
                              notification.type === 'job' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' :
                              notification.type === 'course' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-500' :
                              notification.type === 'mentorship' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' :
                              notification.type === 'system' ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-500' :
                              'bg-red-100 dark:bg-red-900/30 text-red-500'
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
                                {notification.type === 'assignment' ? 'Course Assignment' :
                                 notification.type === 'deadline' ? 'Assignment Deadline' :
                                 notification.type === 'grade' ? 'Grade Update' :
                                 notification.type === 'connection' ? 'Connection' :
                                 notification.type === 'connection_request' ? 'Connection Request' :
                                 notification.type === 'connection_accepted' ? 'Connection Accepted' :
                                 notification.type === 'message' ? 'New Message' :
                                 notification.type === 'event' ? 'Event Update' :
                                 notification.type === 'job' ? 'Job Opportunity' :
                                 notification.type === 'course' ? 'Course Update' :
                                 notification.type === 'mentorship' ? 'Mentorship Update' :
                                 notification.type === 'system' ? 'System Notification' : 'Notification'}
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
                              notification.type === 'assignment' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                              notification.type === 'deadline' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500' :
                              notification.type === 'grade' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                              notification.type === 'connection' || notification.type === 'connection_request' || notification.type === 'connection_accepted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                              notification.type === 'message' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                              notification.type === 'event' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
                              notification.type === 'job' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' :
                              notification.type === 'course' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-500' :
                              notification.type === 'mentorship' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' :
                              notification.type === 'system' ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-500' :
                              'bg-red-100 dark:bg-red-900/30 text-red-500'
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
                                {notification.type === 'assignment' ? 'Course Assignment' :
                                 notification.type === 'deadline' ? 'Assignment Deadline' :
                                 notification.type === 'grade' ? 'Grade Update' :
                                 notification.type === 'connection' ? 'Connection' :
                                 notification.type === 'connection_request' ? 'Connection Request' :
                                 notification.type === 'connection_accepted' ? 'Connection Accepted' :
                                 notification.type === 'message' ? 'New Message' :
                                 notification.type === 'event' ? 'Event Update' :
                                 notification.type === 'job' ? 'Job Opportunity' :
                                 notification.type === 'course' ? 'Course Update' :
                                 notification.type === 'mentorship' ? 'Mentorship Update' :
                                 notification.type === 'system' ? 'System Notification' : 'Notification'}
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
                      You don't have any notifications yet. Check back later for updates on assignments, events, and messages.
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
                      <p className="text-gray-800 dark:text-white font-medium">Assignment Updates</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new assignments are posted</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="assignment-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="assignment-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Deadline Reminders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about upcoming assignment deadlines</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="deadline-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="deadline-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Grade Updates</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your grades are updated</p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input type="checkbox" id="grade-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
                      <label htmlFor="grade-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
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

          {/* Other dashboard sections remain here */}

          {activeSection === 'network' && (
            <div className="network-section">
              <Network currentUser={currentUser} isDarkMode={isDarkMode} />
            </div>
          )}

          {activeSection === 'announcements' && (
            <Announcements isDarkMode={isDarkMode} />
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
