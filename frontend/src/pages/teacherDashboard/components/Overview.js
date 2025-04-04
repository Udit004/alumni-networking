import React from 'react';

const Overview = ({ connections, studentConnections, alumniConnections, teacherConnections, isDarkMode, navigate, handleRequestConnection }) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats cards */}
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
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Students</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{studentConnections.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">📚</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Courses</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">4</p>
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

      {/* Connections Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">My Connections</h2>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Find Connections</span> 🔍
            </button>
          </div>
        </div>
        
        {connections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with any students or alumni yet.</p>
            <button 
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Browse Directory
            </button>
          </div>
        ) : (
          <div>
            {/* Student Connections */}
            {studentConnections.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Student Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentConnections.map((student) => (
                    <div 
                      key={student.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/directory/student/${student.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white overflow-hidden">
                          {student.photoURL ? (
                            <img src={student.photoURL} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            student.name?.charAt(0).toUpperCase() || "S"
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{student.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.program} {student.batch && `Batch ${student.batch}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(student.skills) && student.skills.slice(0, 2).map((skill, index) => (
                              <span 
                                key={index}
                                className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {Array.isArray(student.skills) && student.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                +{student.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display other connections types */}
          </div>
        )}
      </div>

      {/* Suggested Connections */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Suggested Connections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Student Suggestion */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl overflow-hidden mb-3">
                <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Suggested Student" className="h-full w-full object-cover" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-white">Michael Chen</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Computer Science, Batch 2024</p>
              <div className="flex flex-wrap justify-center gap-1 mb-4">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                  Python
                </span>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                  Machine Learning
                </span>
              </div>
              <button 
                onClick={() => handleRequestConnection('michael-chen-id')}
                className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
              >
                Connect
              </button>
            </div>
          </div>
          
          {/* More suggested connections */}
        </div>
      </div>
    </div>
  );
};

export default Overview; 