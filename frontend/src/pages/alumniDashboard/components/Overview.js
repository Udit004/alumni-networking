import React from 'react';
import { useNavigate } from 'react-router-dom';

const Overview = ({ 
  connections, 
  isDarkMode, 
  mentoringCount = 0, 
  jobPostingsCount = 0, 
  activeJobsCount = 0, 
  filledJobsCount = 0,
  eventsCount = 0,
  navigate: navigationProp
}) => {
  // Always call the hook unconditionally
  const defaultNavigate = useNavigate();
  // Use the prop if provided, otherwise use the hook
  const navigate = navigationProp || defaultNavigate;

  // Display only the first 6 connections in the overview
  const displayedConnections = connections.slice(0, 6);
  
  return (
    <div className="overview-section space-y-6">
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              Browsefix the student dashboard mentorship and job counter to work propely like course couter and other and show total no of applied application Directory
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Mentoring</h3>
            <span className="text-2xl">🎓</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{mentoringCount}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active mentees</span>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/mentorship')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Mentorships
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Job Postings</h3>
            <span className="text-2xl">💼</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{jobPostingsCount}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{activeJobsCount} active</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{filledJobsCount} filled</span>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/jobs')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse Job Board
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Events</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{eventsCount}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Created events</span>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/events')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All Events
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
              onClick={() => {
                navigate('/alumni-dashboard');
                // Set the active section to network
                window.localStorage.setItem('alumniActiveSection', 'network');
                // Set the active tab to pending in the Network component
                window.localStorage.setItem('networkActiveTab', 'pending');
                // Force page reload to apply changes
                window.location.reload();
              }}
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
            <p className="text-gray-800 dark:text-white">You posted a <span className="font-semibold">Senior Developer</span> position at TechCorp</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4 py-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">2 weeks ago</p>
            <p className="text-gray-800 dark:text-white">You updated your profile information</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 