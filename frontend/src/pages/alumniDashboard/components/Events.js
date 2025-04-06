import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Events = ({ events, loading, error, isDarkMode, API_URL, user, role }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
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

  const handleDeleteEvent = async (eventId) => {
    try {
      setIsDeleting(true);
      setDeleteId(eventId);
      setDeleteError('');
      
      // Call the API endpoint to delete the event
      const response = await fetch(`${API_URL}/api/events/${eventId}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete event');
      }

      // Success message
      alert('Event deleted successfully');
      
      // Redirect to refresh the events list
      navigate(0); // This refreshes the current page

    } catch (err) {
      console.error('Error deleting event:', err);
      setDeleteError(`Failed to delete event: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (!event) return false;
    
    const matchesSearch = event.title?.toLowerCase().includes(search.toLowerCase()) || 
                          event.description?.toLowerCase().includes(search.toLowerCase()) || 
                          event.location?.toLowerCase().includes(search.toLowerCase());
    
    const eventDate = event.date ? new Date(event.date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchesDateFilter = true;
    if (filter === 'upcoming' && eventDate) {
      matchesDateFilter = eventDate >= today;
    } else if (filter === 'past' && eventDate) {
      matchesDateFilter = eventDate < today;
    }

    return matchesSearch && matchesDateFilter;
  });

  return (
    <div className="events-section space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Events</h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/events')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Browse Events</span> <span>🔍</span>
            </button>
            
            <button 
              onClick={() => user ? navigate('/create-event') : alert('Please log in to create events')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Create Event</span> <span>➕</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'upcoming' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'past' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Past
            </button>
          </div>
        </div>
        
        {deleteError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {deleteError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error loading events</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            {error.includes('authentication') && (
              <button 
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-10">
            {events.length === 0 ? (
              <>
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">You haven't created any events yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first event to share with the community</p>
                <button 
                  onClick={() => user ? navigate('/create-event') : alert('Please log in to create events')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Create an Event
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No events match your search</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event.date);
              const attendees = event.registeredUsers?.length || 0;
              
              return (
                <div 
                  key={event._id}
                  className={`bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow
                            ${eventStatus === 'past' ? 'opacity-75' : ''}`}
                  style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-2/3">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                          {event.category === 'Networking' ? '🤝' : 
                           event.category === 'Workshop' ? '🔧' : 
                           event.category === 'Seminar' ? '🎓' : 
                           event.category === 'Social' ? '🎉' : 
                           event.category === 'Career Fair' ? '💼' : '📅'}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                            </div>
                            
                            <div className="mt-2 sm:mt-0">
                              <span className={`px-3 py-1 text-xs rounded-full ${
                                eventStatus === 'past'
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                  : eventStatus === 'today'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              }`}>
                                {eventStatus === 'past' ? 'Past' : eventStatus === 'today' ? 'Today' : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">📅</span>
                              <span className="text-sm">{formatDate(event.date)}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">⏰</span>
                              <span className="text-sm">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">👥</span>
                              <span className="text-sm">{attendees} {attendees === 1 ? 'person' : 'people'} registered</span>
                            </div>
                            
                            {event.category && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">🏷️</span>
                                <span className="text-sm">{event.category}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.description && (
                            <div className="mt-4">
                              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{event.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap gap-2">
                        <button 
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                        >
                          View Details
                        </button>
                        {user && (
                          <>
                            <button 
                              onClick={() => navigate(`/edit-event/${event._id}`)}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                            >
                              Edit Event
                            </button>
                            {eventStatus !== 'past' && (
                              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300">
                                Manage Registrations
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteEvent(event._id)}
                              disabled={isDeleting && deleteId === event._id}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                            >
                              {isDeleting && deleteId === event._id ? 'Deleting...' : 'Delete Event'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:w-1/3 flex flex-col">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Event Stats</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Registrations</p>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold text-gray-800 dark:text-white">{attendees}</p>
                              <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.min(100, (attendees / (event.capacity || 50)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            {event.capacity && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                {attendees}/{event.capacity} spots filled
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Page Views</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                              {Math.floor(Math.random() * 100) + 30}
                            </p>
                          </div>
                          
                          {eventStatus === 'past' && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
                              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {Math.floor(Math.random() * 30) + 70}%
                              </p>
                            </div>
                          )}
                          
                          <div className="pt-3">
                            {eventStatus === 'past' ? (
                              <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                                View Attendee Feedback
                              </button>
                            ) : eventStatus === 'today' ? (
                              <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm">
                                Start Event Session
                              </button>
                            ) : (
                              <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm">
                                Send Reminder
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredEvents.length > 0 && filteredEvents.length < events.length && (
          <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 