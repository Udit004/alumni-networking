import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import './AlumniDashboard.css';

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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">🤝</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Connections</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">45</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">🎓</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Mentorship</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">💼</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Job Applications</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">📅</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Upcoming Events</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">🤝</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">New connection request from John Doe</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">💼</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">New job opportunity at Google</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">📅</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">Upcoming Alumni Meet</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <div className="profile-info">
                  <h2>{user?.displayName || 'Alumni Name'}</h2>
                  <p>Software Engineer at Google</p>
                </div>
              </div>
              <div className="profile-details">
                <div className="detail-group">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="detail-group">
                  <label>Phone</label>
                  <p>+1 234 567 8900</p>
                </div>
                <div className="detail-group">
                  <label>Graduation Year</label>
                  <p>2020</p>
                </div>
                <div className="detail-group">
                  <label>Specialization</label>
                  <p>Computer Science</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'connections' && (
            <div className="connections-section">
              <div className="section-header">
                <h2>My Connections</h2>
                <div className="search-box">
                  <input type="text" placeholder="Search connections..." />
                  <span className="search-icon">🔍</span>
                </div>
              </div>
              <div className="connections-grid">
                <div className="connection-card">
                  <div className="connection-avatar">
                    <span className="avatar-icon">👤</span>
                  </div>
                  <div className="connection-info">
                    <h3>John Doe</h3>
                    <p>Software Engineer at Microsoft</p>
                    <div className="connection-actions">
                      <button className="action-btn">Message</button>
                      <button className="action-btn">View Profile</button>
                    </div>
                  </div>
                </div>
                {/* Add more connection cards */}
              </div>
            </div>
          )}

          {activeSection === 'mentorship' && (
            <div className="mentorship-section">
              <div className="section-header">
                <h2>Mentorship Programs</h2>
                <button className="create-mentorship-btn">Create Program</button>
              </div>
              <div className="mentorship-grid">
                <div className="mentorship-card">
                  <div className="mentorship-header">
                    <h3>Web Development Mentorship</h3>
                    <span className="mentorship-status">Active</span>
                  </div>
                  <p className="mentorship-description">Help students learn modern web development</p>
                  <div className="mentorship-stats">
                    <span>👥 5 Mentees</span>
                    <span>⭐ 4.8 Rating</span>
                  </div>
                </div>
                {/* Add more mentorship cards */}
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