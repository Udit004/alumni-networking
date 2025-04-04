import React from 'react';

const Overview = ({ connections, courseCount, assignmentCount, isDarkMode, navigate }) => {
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
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{connections?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">📚</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Courses</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{courseCount || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">📝</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Assignments</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{assignmentCount || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">🤝</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Mentorship</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activities</h2>
        
        <ul className="space-y-4">
          <li className="border-l-4 border-blue-500 pl-4 py-1">
            <div className="flex justify-between">
              <p className="text-gray-800 dark:text-white font-medium">New assignment added to Web Development</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Due in 5 days</p>
          </li>
          
          <li className="border-l-4 border-green-500 pl-4 py-1">
            <div className="flex justify-between">
              <p className="text-gray-800 dark:text-white font-medium">Your assignment was graded</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">Yesterday</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Data Structures - Score: 92/100</p>
          </li>
          
          <li className="border-l-4 border-purple-500 pl-4 py-1">
            <div className="flex justify-between">
              <p className="text-gray-800 dark:text-white font-medium">New event: Tech Career Fair</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">2 days ago</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">April 15, 2023 - Campus Main Hall</p>
          </li>
          
          <li className="border-l-4 border-yellow-500 pl-4 py-1">
            <div className="flex justify-between">
              <p className="text-gray-800 dark:text-white font-medium">Mentor request accepted</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">3 days ago</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Dr. James Wilson will be your mentor</p>
          </li>
        </ul>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Upcoming Deadlines</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Database Design Project</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">CS301 - Due tomorrow at 11:59 PM</p>
            </div>
            <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
              View
            </button>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Algorithm Analysis Quiz</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">CS202 - Due in 3 days</p>
            </div>
            <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
              View
            </button>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Machine Learning Lab Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">CS401 - Due in 5 days</p>
            </div>
            <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 