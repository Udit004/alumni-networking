import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import './AlumniDashboard.css';
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const AlumniDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [connections, setConnections] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const { currentUser } = useAuth();
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
    { id: 'connections', label: 'Connections', icon: '🤝' },
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { id: 'jobs', label: 'Job Opportunities', icon: '💼' },
    { id: 'events', label: 'Events', icon: '📅' },
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
      
      // Use the user-specific endpoint to get events created by this user
      const response = await fetch(`${API_URL}/api/events/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      
      // Use the createdEvents array directly from the API response
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
  const studentConnections = connections.filter(conn => conn.role === "student");
  const teacherConnections = connections.filter(conn => conn.role === "teacher");
  const alumniConnections = connections.filter(conn => conn.role === "alumni");
  
  console.log('Filtered connections:', {
    all: connections.length,
    students: studentConnections.length,
    teachers: teacherConnections.length,
    alumni: alumniConnections.length
  });

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
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Alumni Dashboard</h3>
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
              <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">3</span>
              </button>
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.displayName ? user.displayName[0].toUpperCase() : '👤'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeSection === 'overview' && (
            <div className="overview-section space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Mentorship</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">💼</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Job Posts</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
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

              {/* My Connections */}
              <div id="my-connections" className="connections-section bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">My Connections</h2>
                  <button 
                    id="find-connections-btn"
                    onClick={() => navigate('/directory')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>Find Connections</span> 🔍
                  </button>
                </div>
                
                {connectionLoading ? (
                  <div className="connections-loading flex justify-center items-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Loading connections...</p>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Connections Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Start building your network by connecting with other alumni, students and teachers.</p>
                    <button
                      id="browse-directory-btn"
                      onClick={() => navigate('/directory')} 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    
                    {/* Teacher Connections */}
                    {teacherConnections.length > 0 && (
                      <div className="mb-8">
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
                    
                    {/* Alumni Connections */}
                    {alumniConnections.length > 0 && (
                      <div>
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
                  </div>
                )}
              </div>
              
              {/* Suggested Connections */}
              <div className="suggested-connections bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Suggested Connections</h2>
                  <button 
                    onClick={() => navigate('/directory')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>Browse Directory</span> 🔍
                  </button>
                </div>
                
                {/* Suggested connection cards */}
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
                        onClick={() => navigate('/directory/student/michael-chen-id')}
                        className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                      >
                        View Profile
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
                        onClick={() => navigate('/directory/teacher/sarah-wilson-id')}
                        className="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                      >
                        View Profile
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
                        onClick={() => navigate('/directory/alumni/david-kim-id')}
                        className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-container">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 text-4xl overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.displayName ? user.displayName[0].toUpperCase() : '👤'
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.displayName || 'Alumni User'}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Software Engineer with over 5 years of experience</p>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-800 dark:text-white">{user?.email || 'email@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                    <p className="text-gray-800 dark:text-white">linkedin.com/in/username</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-800 dark:text-white">+1 234 567 890</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-gray-800 dark:text-white">San Francisco, CA</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Work Experience</h3>
                
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Senior Software Engineer</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2019 - Present</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">TechCorp</p>
                  <p className="text-gray-700 dark:text-gray-300">Leading a team of developers to build innovative web solutions.</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Software Developer</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2016 - 2019</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">WebWorks</p>
                  <p className="text-gray-700 dark:text-gray-300">Designed and maintained various client-side applications.</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Education</h3>
                
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Master of Science in Computer Science</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2008 - 2010</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">University of California, Berkeley</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Bachelor of Science in Information Technology</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2004 - 2008</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Stanford University</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">JavaScript</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">React</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Node.js</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Python</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">AWS</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Docker</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Git</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">TypeScript</span>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'connections' && (
            <div className="connections-section">
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Connections</h2>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center">
                  <span className="mr-2">+</span> Create Program
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mentorship Card 1 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
                     style={{ backgroundColor: isDarkMode ? '#080725' : 'white' }}>
                  <div className="relative">
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="absolute top-12 left-6 w-20 h-20 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-700 flex items-center justify-center text-3xl">
                      💻
                    </div>
                  </div>
                  
                  <div className="p-5 pt-14">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Web Development Mentorship</h3>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">Active</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Help students learn modern web development technologies and best practices.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">👥</span>
                        <span className="text-sm">5 Mentees</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">⭐</span>
                        <span className="text-sm">4.8 Rating (12 reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">⏱️</span>
                        <span className="text-sm">Started 3 months ago</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm">
                        View Details
                      </button>
                      <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm">
                        Manage Mentees
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Mentorship Card 2 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
                     style={{ backgroundColor: isDarkMode ? '#080725' : 'white' }}>
                  <div className="relative">
                    <div className="h-24 bg-gradient-to-r from-green-500 to-teal-600"></div>
                    <div className="absolute top-12 left-6 w-20 h-20 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-700 flex items-center justify-center text-3xl">
                      📊
                    </div>
                  </div>
                  
                  <div className="p-5 pt-14">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Science Fundamentals</h3>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">Active</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Guide students through data analysis, visualization, and machine learning basics.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">👥</span>
                        <span className="text-sm">3 Mentees</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">⭐</span>
                        <span className="text-sm">4.9 Rating (8 reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">⏱️</span>
                        <span className="text-sm">Started 2 months ago</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm">
                        View Details
                      </button>
                      <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm">
                        Manage Mentees
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Mentorship Card 3 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
                     style={{ backgroundColor: isDarkMode ? '#080725' : 'white' }}>
                  <div className="relative">
                    <div className="h-24 bg-gradient-to-r from-yellow-500 to-orange-600"></div>
                    <div className="absolute top-12 left-6 w-20 h-20 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-700 flex items-center justify-center text-3xl">
                      🎨
                    </div>
                  </div>
                  
                  <div className="p-5 pt-14">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UI/UX Design Workshop</h3>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">Starting Soon</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Teach design principles, user research, and prototyping techniques.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">👥</span>
                        <span className="text-sm">0 Mentees (4 spots available)</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">📅</span>
                        <span className="text-sm">Starts on June 15, 2023</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">⏱️</span>
                        <span className="text-sm">8-week program</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm">
                        View Details
                      </button>
                      <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm">
                        Edit Program
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Mentorship Card 4 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
                     style={{ backgroundColor: isDarkMode ? '#080725' : 'white' }}>
                  <div className="relative">
                    <div className="h-24 bg-gradient-to-r from-red-500 to-pink-600"></div>
                    <div className="absolute top-12 left-6 w-20 h-20 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-700 flex items-center justify-center text-3xl">
                      🚀
                    </div>
                  </div>
                  
                  <div className="p-5 pt-14">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Career Development</h3>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">Completed</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Guide students through resume building, interview prep, and job search strategies.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">👥</span>
                        <span className="text-sm">7 Mentees</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">⭐</span>
                        <span className="text-sm">4.7 Rating (15 reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="text-sm mr-2">🏆</span>
                        <span className="text-sm">5 mentees found jobs</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm">
                        View Details
                      </button>
                      <button className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm">
                        Restart Program
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  View All Mentorship Programs
                </button>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div className="jobs-section">
              <div className="section-header">
                <h2>Job Opportunities</h2>
                <div className="search-box">
                  <input type="text" placeholder="Search jobs..." />
                  <span className="search-icon">🔍</span>
                </div>
              </div>
              <div className="jobs-grid">
                <div className="job-card">
                  <div className="job-header">
                    <h3>Senior Software Engineer</h3>
                    <span className="job-status">New</span>
                  </div>
                  <p className="company-name">Google</p>
                  <p className="job-location">Mountain View, CA</p>
                  <div className="job-tags">
                    <span>Full-time</span>
                    <span>Remote</span>
                    <span>$120k-$180k</span>
                  </div>
                  <button className="apply-btn">Apply Now</button>
                </div>
                {/* Add more job cards */}
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
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                    style={{ 
                      color: filter === 'all' ? 'white' : (isDarkMode ? 'white' : '#374151') 
                    }}
                  >
                    All Events
                  </button>
                  <button 
                    className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setFilter('upcoming')}
                    style={{ 
                      color: filter === 'upcoming' ? 'white' : (isDarkMode ? 'white' : '#374151') 
                    }}
                  >
                    Upcoming
                  </button>
                  <button 
                    className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                    onClick={() => setFilter('past')}
                    style={{ 
                      color: filter === 'past' ? 'white' : (isDarkMode ? 'white' : '#374151') 
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

          {activeSection === 'settings' && (
            <div className="settings-section">
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Account Settings</h3>
                  <form className="settings-form">
                    <div className="form-group">
                      <label>Display Name</label>
                      <input type="text" defaultValue={user?.displayName || ''} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" defaultValue={user?.email || ''} />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" defaultValue="+1 234 567 8900" />
                    </div>
                    <button type="submit" className="save-btn">Save Changes</button>
                  </form>
                </div>
                <div className="settings-card">
                  <h3>Notification Settings</h3>
                  <div className="notification-settings">
                    <div className="setting-item">
                      <label>Job Alerts</label>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="setting-item">
                      <label>Event Updates</label>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="setting-item">
                      <label>Connection Requests</label>
                      <input type="checkbox" defaultChecked />
                    </div>
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

export default AlumniDashboard;