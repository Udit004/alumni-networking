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
  const { user } = useAuth();
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
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
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
              <div className="section-header">
                <h2>Alumni Events</h2>
                <button className="create-event-btn" onClick={() => navigate('/create-event')}>
                  Create Event
                </button>
              </div>

              <div className="events-filters">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                <div className="filter-buttons">
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

              {error && <div className="error-message">{error}</div>}

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading events...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="events-grid">
                  {filteredEvents.map((event) => {
                    const status = getEventStatus(event.date);
                    const isRegistered = user && event.registeredUsers?.some(r => r.userId === user.uid);
                    
                    return (
                      <div key={event._id} className={`event-card ${status}`}>
                        <div className="event-status-badge">
                          {status === 'upcoming' ? 'Upcoming' : status === 'today' ? 'Today' : 'Past'}
                        </div>
                        <div className="event-content">
                          <h3 className="event-title">{event.title}</h3>
                          <p className="event-description">{event.description}</p>
                          <div className="event-details">
                            <div className="detail-item">
                              <span className="detail-icon">📅</span>
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">⏰</span>
                              <span>{event.time}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">📍</span>
                              <span>{event.location}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">👥</span>
                              <span>{event.registeredUsers?.length || 0} Registered</span>
                            </div>
                          </div>
                          <div className="event-actions">
                            {isRegistered ? (
                              <button className="action-btn registered" disabled>
                                ✅ Registered
                              </button>
                            ) : (
                              <button 
                                className="action-btn register"
                                onClick={() => navigate(`/events/${event._id}`)}
                              >
                                🎟 View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-events">
                  <p>No events found matching your criteria.</p>
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