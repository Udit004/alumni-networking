import React from 'react';

const Events = ({ 
  events,
  loading,
  error,
  search,
  setSearch,
  filter,
  setFilter,
  getEventStatus,
  navigate,
  isDarkMode,
  API_URL,
  user,
  role 
}) => {
  return (
    <div className="events-section">
      <div className="section-header mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Events</h2>
        <button 
          className="create-event-btn px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
          onClick={() => navigate('/teacher-dashboard/events/create')}
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
            className={`filter-btn px-4 py-2 rounded-md transition-colors ${
              filter === "all" 
                ? "bg-blue-500 text-white dark:text-white font-medium active" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilter("all")}
            style={{ 
              color: filter === "all" ? "white" : (isDarkMode ? "white" : "#374151") 
            }}
          >
            All Events
          </button>
          <button 
            className={`filter-btn px-4 py-2 rounded-md transition-colors ${
              filter === "upcoming" 
                ? "bg-blue-500 text-white dark:text-white font-medium active" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilter("upcoming")}
            style={{ 
              color: filter === "upcoming" ? "white" : (isDarkMode ? "white" : "#374151") 
            }}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn px-4 py-2 rounded-md transition-colors ${
              filter === "past" 
                ? "bg-blue-500 text-white dark:text-white font-medium active" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilter("past")}
            style={{ 
              color: filter === "past" ? "white" : (isDarkMode ? "white" : "#374151") 
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
      ) : events && events.length > 0 ? (
        <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
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
                            // Event deleted successfully
                            window.location.reload();
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
  );
};

export default Events; 