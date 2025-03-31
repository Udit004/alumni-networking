import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';

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

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'materials', label: 'Materials', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
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
      // In production, filter events by teacher ID
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      // Filter events created by this teacher
      const teacherEvents = data.filter(event => event.createdBy?.userId === user?.uid);
      const sortedEvents = teacherEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">👥</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Students</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">150</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">📚</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Courses</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">📈</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Attendance</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">85%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">📅</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Events Created</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">8</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">👥</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">5 new students enrolled in Data Structures course</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">📊</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">Assignment submissions received for Algorithms</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">📅</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">Created new Tech Talk event</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
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
                           className="event-card bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
                           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
                      >
                        <div className={`event-status text-xs font-semibold px-3 py-1 inline-block absolute right-0 top-0 rounded-bl-lg ${
                          status === "upcoming" 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-500 text-white"
                        }`}>
                          {status === 'upcoming' ? 'Upcoming' : 'Past'}
                        </div>
                        
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
                              className="py-2 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors"
                              onClick={() => navigate(`/edit-event/${event._id}`)}
                            >
                              ✏️
                            </button>
                            <button
                              className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              onClick={() => {
                                if(window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                                  // Call API to delete event
                                  fetch(`${API_URL}/api/events/${event._id}?firebaseUID=${user.uid}&role=teacher`, {
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

          {activeSection === 'materials' && (
            <div className="materials-section">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Teaching Materials</h2>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 hover:shadow-lg"
                  onClick={() => {
                    navigate('/create-material');
                  }}
                >
                  <span className="mr-2">+</span> Add New Material
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <div key={material.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all relative group"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                        onClick={() => {
                          if(window.confirm(`Are you sure you want to delete "${material.title}"?`)) {
                            handleDeleteMaterial(material.id);
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className={`p-3 rounded-full bg-${material.color}-100 dark:bg-${material.color}-900 text-${material.color}-500 dark:text-${material.color}-300 text-xl mr-4`}>
                        {material.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{material.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{material.course}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{material.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>👥 {material.students} students</span>
                      <span>📅 {material.lastUpdated}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">Edit</button>
                      <button className="flex-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-3 py-1 rounded-lg hover:bg-green-200 dark:hover:bg-green-800">Share</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="analytics-section">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Analytics Dashboard</h2>
              
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-3">👥</div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Alumni</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">1,250</p>
                      <p className="text-xs text-green-500">+8% from last year</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-3">👨‍🏫</div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Active Teachers</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">85</p>
                      <p className="text-xs text-green-500">+5% from last year</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-3">🎓</div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Students</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">450</p>
                      <p className="text-xs text-green-500">+12% from last year</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-3">🤝</div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Mentorship Rate</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">68%</p>
                      <p className="text-xs text-green-500">+15% from last year</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Alumni Engagement Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alumni Engagement Trend</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Jan</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Feb</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Mar</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Apr</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">May</span>
                      </div>
                      <div className="flex items-end h-48">
                        <div className="flex-1 flex flex-col items-center">
                          <div className="h-24 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">65%</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="h-24 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">72%</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="h-24 bg-gradient-to-t from-green-500 to-green-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">78%</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="h-24 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">82%</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="h-24 bg-gradient-to-t from-red-500 to-red-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-sm text-blue-600 dark:text-blue-300">Highest Engagement</p>
                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-200">85%</p>
                        <p className="text-xs text-blue-500">May 2024</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="text-sm text-green-600 dark:text-green-300">Average Growth</p>
                        <p className="text-lg font-semibold text-green-700 dark:text-green-200">+5%</p>
                        <p className="text-xs text-green-500">Monthly</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alumni Career Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-full">
                      <div className="flex items-center mb-4">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Tech Industry (35%)</span>
                      </div>
                      <div className="flex items-center mb-4">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Research (25%)</span>
                      </div>
                      <div className="flex items-center mb-4">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Education (20%)</span>
                      </div>
                      <div className="flex items-center mb-4">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Other Sectors (20%)</span>
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className="flex-1 text-center">
                          <div className="h-24 bg-gradient-to-t from-green-500 to-green-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">35%</span>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-24 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">25%</span>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-24 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">20%</span>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-24 bg-gradient-to-t from-red-500 to-red-300 rounded-t" style={{ width: '20%', margin: '0 auto' }}></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">20%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Community Analytics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Total Members</th>
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Active Members</th>
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Engagement Rate</th>
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-4">Alumni</td>
                        <td className="py-3 px-4">1,250</td>
                        <td className="py-3 px-4">850</td>
                        <td className="py-3 px-4">68%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm">
                            +8%
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-4">Teachers</td>
                        <td className="py-3 px-4">85</td>
                        <td className="py-3 px-4">75</td>
                        <td className="py-3 px-4">88%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm">
                            +5%
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-4">Students</td>
                        <td className="py-3 px-4">450</td>
                        <td className="py-3 px-4">420</td>
                        <td className="py-3 px-4">93%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm">
                            +12%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Mentors</td>
                        <td className="py-3 px-4">150</td>
                        <td className="py-3 px-4">120</td>
                        <td className="py-3 px-4">80%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm">
                            +15%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'courses' && (
            <div className="courses-section">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Engineering Courses</h2>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 hover:shadow-lg"
                  onClick={() => navigate('/create-course')}
                >
                  <span className="mr-2">+</span> Add New Course
                </button>
              </div>

              {/* Course Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Computer Science Courses */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">💻</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Computer Science</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Data Structures</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CS101</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">45 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Algorithms</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CS201</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">38 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Machine Learning</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CS301</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">35 students</span>
                    </div>
                  </div>
                </div>

                {/* Electronics Courses */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">⚡</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Electronics</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Digital Electronics</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">EE101</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">42 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Circuit Analysis</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">EE201</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">40 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Power Systems</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">EE301</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">36 students</span>
                    </div>
                  </div>
                </div>

                {/* Mechanical Courses */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300 text-xl mr-4">⚙️</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Mechanical</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Thermodynamics</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ME101</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">48 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Fluid Mechanics</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ME201</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">45 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Machine Design</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ME301</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">42 students</span>
                    </div>
                  </div>
                </div>

                {/* Civil Courses */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">🏗️</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Civil</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Structural Analysis</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CE101</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">50 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Geotechnical Engineering</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CE201</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">45 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Transportation Engineering</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CE301</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">40 students</span>
                    </div>
                  </div>
                </div>

                {/* Chemical Courses */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">🧪</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chemical</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Process Control</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CHE101</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">38 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Chemical Kinetics</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CHE201</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">35 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Unit Operations</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CHE301</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">32 students</span>
                    </div>
                  </div>
                </div>

                {/* Aerospace Courses */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-500 dark:text-indigo-300 text-xl mr-4">✈️</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Aerospace</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Aerodynamics</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">AE101</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">30 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Propulsion Systems</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">AE201</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">28 students</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-gray-800 dark:text-white">Space Systems</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">AE301</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">25 students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="settings-section">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>
              
              {/* Profile Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Display Name</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your name as shown to students</p>
                    </div>
                    <input 
                      type="text" 
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your courses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Course Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Course Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Default Course Duration</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Set default duration for new courses</p>
                    </div>
                    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>3 months</option>
                      <option>6 months</option>
                      <option>12 months</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Auto-enrollment</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Allow students to enroll automatically</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Assignment Submissions</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when students submit assignments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Student Messages</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for student messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Course Updates</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about course changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Profile Visibility</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile</p>
                    </div>
                    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Everyone</option>
                      <option>Students Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Contact Information</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Show contact details to students</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 