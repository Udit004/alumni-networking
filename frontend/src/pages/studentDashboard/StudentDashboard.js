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
import EnrolledEvents from "./EnrolledEvents";
import Mentorship from "./components/Mentorship";
import Jobs from "./components/Jobs";
import Overview from "./components/Overview";
import StudentChat from "./StudentChat";
import axios from 'axios';

const StudentDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
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
    connections: [] // Add connections array to track connected profiles
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
            skills: userData.skills || [],
            achievements: userData.achievements || [],
            projects: userData.projects || [],
            courses: userData.courses || academicData.courses || [],
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
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { id: 'jobs', label: 'Jobs & Internships', icon: '💼' },
    { id: 'chat', label: 'Chat', icon: '💬' },
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

  // Function to fetch job applications and mentorships counts
  useEffect(() => {
    const fetchCounts = async () => {
      if (!currentUser) return;
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      try {
        // Fetch job applications count
        const token = await currentUser.getIdToken();
        const jobAppResponse = await axios.get(
          `${API_URL}/api/job-applications`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
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
        
        // Fetch mentorships count
        const mentorshipResponse = await axios.get(`${API_URL}/api/mentorships/user/${currentUser.uid}`);
        
        const userMentorships = mentorshipResponse.data.success ?
          (mentorshipResponse.data.mentorships ||
          mentorshipResponse.data.enrolledMentorships ||
          []) : [];
          
        setMentorshipsCount(Array.isArray(userMentorships) ? userMentorships.length : 0);
      } catch (error) {
        console.error("Error fetching application and mentorship counts:", error);
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
      case 'message': return '✉️';
      case 'event': return '📅';
      case 'assignment': return '📝';
      case 'deadline': return '⏰';
      case 'grade': return '🎓';
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
    
    // Otherwise return the date
    return timestamp.toLocaleDateString();
  };

  // Render active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview 
          connections={connections}
          jobApplicationsCount={jobApplicationsCount} 
          mentorshipsCount={mentorshipsCount}
          isDarkMode={isDarkMode}
          navigate={navigate}
        />;
      case 'profile':
        return <Profile userData={profileData} />;
      case 'notifications':
        return <div className="notifications-section">Notifications content here</div>;
      case 'events':
        return <EnrolledEvents />;
      case 'courses':
        return <div className="courses-section">Courses content here</div>;
      case 'mentorship':
        return <Mentorship />;
      case 'jobs':
        return <Jobs />;
      case 'chat':
        return <StudentChat />;
      case 'network':
        return (
          <Network
            connections={connections}
            connectionLoading={connectionLoading}
            alumniConnections={alumniConnections}
            teacherConnections={teacherConnections}
            pendingRequests={pendingRequests}
          />
        );
      case 'settings':
        return <div className="settings-section">Settings content here</div>;
      default:
        return <Overview 
          connections={connections}
          jobApplicationsCount={jobApplicationsCount} 
          mentorshipsCount={mentorshipsCount}
          isDarkMode={isDarkMode}
          navigate={navigate}
        />;
    }
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
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
