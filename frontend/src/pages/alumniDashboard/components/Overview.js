import React from 'react';
import { useNavigate } from 'react-router-dom';

const Overview = ({ connections, isDarkMode }) => {
  const navigate = useNavigate();

  // Display only the first 6 connections in the overview
  const displayedConnections = connections.slice(0, 6);
  
  return (
    <div className="overview-section space-y-6">
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Connections</h3>
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{connections.length}</p>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/directory')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse Alumni Directory
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Mentorships</h3>
            <span className="text-2xl">🎓</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">2 as mentor</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">1 as mentee</span>
          </div>
          <div className="mt-4">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View Mentorships
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Job Applications</h3>
            <span className="text-2xl">💼</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">2 pending</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">3 viewed</span>
          </div>
          <div className="mt-4">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Browse Job Board
            </button>
          </div>
        </div>
      </div>
      
      {/* Connections Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Connections</h2>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button 
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Find New Connections
            </button>
            <button 
              onClick={() => navigate('/connection-requests')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Connection Requests
            </button>
          </div>
        </div>
        
        {connections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with anyone yet.</p>
            <button 
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Browse Alumni Directory
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedConnections.map(connection => (
                <div 
                  key={connection.id}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
                  onClick={() => navigate(`/profile/${connection.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 text-xl">
                      {connection.photoURL ? (
                        <img src={connection.photoURL} alt={connection.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <span>{connection.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{connection.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {connection.role === 'alumni' 
                          ? `${connection.jobTitle || 'Professional'} at ${connection.company || 'Company'}`
                          : connection.role === 'faculty'
                          ? `${connection.department || 'Faculty'} at ${connection.institution || 'Institution'}`
                          : `Student at ${connection.institution || 'Institution'}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {connections.length > 6 && (
              <div className="text-center mt-4">
                <button 
                  onClick={() => navigate('/connections')} 
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all {connections.length} connections
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</h2>
          <button className="text-blue-600 dark:text-blue-400 hover:underline">
            View all
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Yesterday</p>
            <p className="text-gray-800 dark:text-white">You connected with <span className="font-semibold">Jane Smith</span></p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4 py-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">3 days ago</p>
            <p className="text-gray-800 dark:text-white">You registered for <span className="font-semibold">Tech Networking Event</span></p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4 py-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">1 week ago</p>
            <p className="text-gray-800 dark:text-white">You applied for <span className="font-semibold">Senior Developer</span> position at TechCorp</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4 py-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">2 weeks ago</p>
            <p className="text-gray-800 dark:text-white">You updated your profile information</p>
          </div>
        </div>
      </div>
      
      {/* Upcoming Events Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Upcoming Events</h2>
          <button 
            onClick={() => navigate('/events')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all events
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
               style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">15</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">Jun</span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-white">Tech Networking Mixer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">6:00 PM - 9:00 PM • Downtown Conference Center</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                    Registered
                  </span>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
               style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">22</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">Jun</span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-white">Career Development Workshop</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">1:00 PM - 4:00 PM • Online</p>
                <div className="mt-2 flex justify-between items-center">
                  <button className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    Register
                  </button>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 