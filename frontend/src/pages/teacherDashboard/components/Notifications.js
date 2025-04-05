import React from 'react';

const Notifications = ({ 
  notifications = [],
  unreadCount = 0, 
  markAsRead, 
  markAllAsRead, 
  handleNotificationClick, 
  getNotificationIcon, 
  formatNotificationTime, 
  isDarkMode 
}) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="notifications-section">
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Faculty Notifications</h2>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="student">Student Updates</option>
              <option value="course">Course Updates</option>
              <option value="event">Events</option>
              <option value="connection">Connections</option>
              <option value="message">Messages</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Notification grouping by day */}
        <div className="space-y-6">
          {/* Today's notifications */}
          <div>
            <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-2 text-sm">Today</h3>
            <div className="space-y-1">
              {safeNotifications
                .filter(notification => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return notification.timestamp >= today;
                })
                .map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`mr-4 p-3 rounded-full ${
                      notification.type === 'student' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                      notification.type === 'course' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                      notification.type === 'connection' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                      notification.type === 'message' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
                    }`}>
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {formatNotificationTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {notification.type === 'student' ? 'Student Activity' :
                         notification.type === 'course' ? 'Course Update' :
                         notification.type === 'connection' ? 'Connection Request' :
                         notification.type === 'message' ? 'New Message' : 'Event Update'}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 h-3 w-3 bg-blue-500 rounded-full self-center"></div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Earlier notifications */}
          <div>
            <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-2 text-sm">Earlier</h3>
            <div className="space-y-1">
              {safeNotifications
                .filter(notification => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return notification.timestamp < today;
                })
                .map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`mr-4 p-3 rounded-full ${
                      notification.type === 'student' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                      notification.type === 'course' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                      notification.type === 'connection' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                      notification.type === 'message' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
                    }`}>
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {formatNotificationTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {notification.type === 'student' ? 'Student Activity' :
                         notification.type === 'course' ? 'Course Update' :
                         notification.type === 'connection' ? 'Connection Request' :
                         notification.type === 'message' ? 'New Message' : 'Event Update'}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 h-3 w-3 bg-blue-500 rounded-full self-center"></div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {safeNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Notifications</h3>
            <p className="text-gray-500 dark:text-gray-400">
              You don't have any notifications yet. Check back later for updates on student activities, events, and more.
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Student Submission Alerts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when students submit assignments</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" id="submission-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
              <label htmlFor="submission-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Course Enrollment Updates</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new course enrollments</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" id="enrollment-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
              <label htmlFor="enrollment-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Department Announcements</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about announcements from your department</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" id="department-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
              <label htmlFor="department-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Connection Requests</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone sends you a connection request</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" id="connection-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
              <label htmlFor="connection-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Message Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive new messages</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" id="message-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
              <label htmlFor="message-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications in addition to in-app notifications</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" id="email-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-0" defaultChecked />
              <label htmlFor="email-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 