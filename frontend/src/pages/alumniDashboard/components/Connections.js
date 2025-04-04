import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Connections = ({ connections, connectionLoading, isDarkMode }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filteredConnections = connections.filter(connection => {
    // Search filter
    const matchesSearch = connection.name.toLowerCase().includes(search.toLowerCase());
    
    // Role filter
    let matchesRole = true;
    if (filter !== 'all') {
      matchesRole = connection.role === filter;
    }
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="connections-section space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Connections</h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Find Connections</span> <span>👥</span>
            </button>
            
            <button 
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Manage Requests</span> <span>✉️</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
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
              All
            </button>
            <button
              onClick={() => setFilter('alumni')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'alumni' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Alumni
            </button>
            <button
              onClick={() => setFilter('faculty')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'faculty' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'student' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Students
            </button>
          </div>
        </div>
        
        {connectionLoading ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Loading connections...</p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="py-10 text-center">
            {connections.length === 0 ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any connections yet.</p>
                <button 
                  onClick={() => navigate('/directory')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Browse Alumni Directory
                </button>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No connections match your search criteria.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((connection) => (
              <div 
                key={connection.id}
                className="connection-card bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-shadow"
                style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 text-xl">
                    {connection.photoURL ? (
                      <img src={connection.photoURL} alt={connection.name} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <span>{connection.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{connection.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {connection.role === 'alumni' 
                        ? `${connection.jobTitle || 'Professional'} at ${connection.company || 'Company'}`
                        : connection.role === 'faculty'
                        ? `${connection.department || 'Faculty'} at ${connection.institution || 'Institution'}`
                        : `Student at ${connection.institution || 'Institution'}`
                      }
                    </p>
                    
                    {connection.skills && connection.skills.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {connection.skills.slice(0, 3).map((skill, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {connection.skills.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{connection.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <button className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm">
                    View Profile
                  </button>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors">
                      💬
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors">
                      ✉️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredConnections.length > 0 && (
          <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Showing {filteredConnections.length} of {connections.length} connections
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections; 