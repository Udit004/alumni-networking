import React from 'react';

const Overview = ({ connections, isDarkMode }) => {
  return (
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
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>Find New Connections</span> <span>👥</span>
          </button>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any connections yet.</p>
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Browse Alumni Directory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.slice(0, 6).map((connection) => (
              <div 
                key={connection.id}
                className="connection-card bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300">
                  {connection.photoURL ? (
                    <img src={connection.photoURL} alt={connection.name} className="h-12 w-12 rounded-full" />
                  ) : (
                    <span>{connection.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{connection.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {connection.role === 'alumni' 
                      ? `${connection.jobTitle || 'Professional'} at ${connection.company || 'Company'}`
                      : `${connection.department || 'Faculty'} at ${connection.institution || 'Institution'}`
                    }
                  </p>
                </div>
                <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  <span>💬</span>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {connections.length > 6 && (
          <div className="mt-4 text-center">
            <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View all connections ({connections.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview; 