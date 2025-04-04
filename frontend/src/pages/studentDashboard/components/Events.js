import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

const Events = ({ currentUser, isDarkMode }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      try {
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          orderBy('date', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const eventsList = [];
        
        querySnapshot.forEach((doc) => {
          const event = doc.data();
          const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
          const now = new Date();
          
          // Only include upcoming events or events that happened today
          if (eventDate >= new Date(now.setHours(0, 0, 0, 0))) {
            eventsList.push({
              id: doc.id,
              ...event,
              isRegistered: Array.isArray(event.registeredUsers) && event.registeredUsers.includes(currentUser.uid),
              isBookmarked: Array.isArray(event.bookmarkedUsers) && event.bookmarkedUsers.includes(currentUser.uid),
            });
          }
        });
        
        setEvents(eventsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentUser]);
  
  const formatDate = (date) => {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatTime = (date) => {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'workshop':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'seminar':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'conference':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'networking':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'career fair':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'hackathon':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'workshop':
        return '🛠️';
      case 'seminar':
        return '🎤';
      case 'conference':
        return '🏢';
      case 'networking':
        return '🌐';
      case 'career fair':
        return '💼';
      case 'hackathon':
        return '💻';
      default:
        return '📅';
    }
  };
  
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoryFilter === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && event.category?.toLowerCase() === categoryFilter.toLowerCase();
    }
  });
  
  const categories = ['all', ...new Set(events.map(event => event.category?.toLowerCase()).filter(Boolean))];

  return (
    <div className="events-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Upcoming Events</h2>
        
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button 
                  key={category}
                  className={`px-4 py-2 rounded-lg ${
                    categoryFilter === category 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Events List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="loader">Loading...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm || categoryFilter !== 'all'
                ? "No events match your search or filter"
                : "There are no upcoming events"
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEvents.map((event) => {
                const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                const isToday = new Date().toDateString() === eventDate.toDateString();
                
                return (
                  <div 
                    key={event.id} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Event Date */}
                      <div className="text-center">
                        <div className={`w-20 h-20 rounded-lg ${isToday ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'} flex flex-col items-center justify-center`}>
                          <div className={`text-sm font-medium ${isToday ? 'text-blue-800 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`}>
                            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className={`text-2xl font-bold ${isToday ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-white'}`}>
                            {eventDate.getDate()}
                          </div>
                          <div className={`text-sm ${isToday ? 'text-blue-800 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`}>
                            {eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(event.date)}
                        </div>
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {event.title}
                          </h3>
                          
                          {event.category && (
                            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(event.category)}`}>
                              {getCategoryIcon(event.category)} {event.category}
                            </span>
                          )}
                        </div>
                        
                        {event.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <span className="mr-1">📍</span>
                            {event.location}
                          </p>
                        )}
                        
                        {event.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 mb-4">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            className={`px-4 py-2 rounded-lg ${
                              event.isRegistered
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {event.isRegistered ? 'Registered' : 'Register Now'}
                          </button>
                          
                          <button
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
                          >
                            View Details
                          </button>
                          
                          <button
                            className={`p-2 rounded-full ${
                              event.isBookmarked
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            }`}
                          >
                            {event.isBookmarked ? '⭐' : '☆'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Attendance Info */}
                      {event.maxAttendees && (
                        <div className="text-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Attendees
                          </div>
                          <div className="text-lg font-medium text-gray-800 dark:text-white">
                            {event.registeredCount || 0} / {event.maxAttendees}
                          </div>
                          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${((event.registeredCount || 0) / event.maxAttendees) * 100}%` }}
                            ></div>
                          </div>
                          
                          {event.maxAttendees - (event.registeredCount || 0) <= 5 && (
                            <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                              Only {event.maxAttendees - (event.registeredCount || 0)} spots left!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events; 