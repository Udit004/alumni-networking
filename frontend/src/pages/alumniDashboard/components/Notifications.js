import React, { useState } from 'react';

const Notifications = ({ 
  notifications = [], 
  getNotificationIcon, 
  formatNotificationTime, 
  markAsRead, 
  markAllAsRead, 
  isDarkMode 
}) => {
  const [filter, setFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('all');
  
  // Ensure notifications is an array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  
  // Get unread count
  const unreadCount = safeNotifications.filter(notification => !notification.read).length;
  
  // Filter notifications based on current filter
  const filteredNotifications = safeNotifications.filter(notification => {
    if (filter !== 'all' && notification.type !== filter) return false;
    
    if (timeframe === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(notification.timestamp) >= today;
    }
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(notification.timestamp) >= weekAgo;
    }
    if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(notification.timestamp) >= monthAgo;
    }
    
    return true;
  });
  
  // Group notifications by date
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  yesterdayDate.setHours(0, 0, 0, 0);
  
  const todayNotifications = filteredNotifications.filter(notification => 
    new Date(notification.timestamp) >= todayDate
  );
  
  const yesterdayNotifications = filteredNotifications.filter(notification => 
    new Date(notification.timestamp) >= yesterdayDate && 
    new Date(notification.timestamp) < todayDate
  );
  
  const earlierNotifications = filteredNotifications.filter(notification => 
    new Date(notification.timestamp) < yesterdayDate
  );

  return (
    <div className="notifications-container w-full max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {/* Header with filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h2>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="connection">Connections</option>
                <option value="message">Messages</option>
                <option value="event">Events</option>
                <option value="job">Jobs</option>
                <option value="mentorship">Mentorship</option>
              </select>
              
              <select
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Notification content */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Empty state */}
          {filteredNotifications.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 text-2xl mb-4">
                📬
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No notifications</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                You don't have any notifications matching your current filters. Try changing your filters or check back later.
              </p>
            </div>
          )}
          
          {/* Today's notifications */}
          {todayNotifications.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</h3>
              </div>
              
              {todayNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start space-x-4 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.type === 'connection' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                    notification.type === 'message' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                    notification.type === 'event' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500' :
                    notification.type === 'job' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                    'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                  }`}>
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-gray-900 dark:text-white ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatNotificationTime(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.type === 'connection' ? 'Connection Request' :
                       notification.type === 'message' ? 'New Message' :
                       notification.type === 'event' ? 'Event Update' :
                       notification.type === 'job' ? 'Job Opportunity' :
                       notification.type === 'mentorship' ? 'Mentorship' : 'Notification'}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2">
                      {notification.actionUrl && (
                        <a 
                          href={notification.actionUrl}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {notification.actionText || 'View Details'}
                        </a>
                      )}
                      
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Yesterday's notifications */}
          {yesterdayNotifications.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Yesterday</h3>
              </div>
              
              {yesterdayNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start space-x-4 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.type === 'connection' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                    notification.type === 'message' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                    notification.type === 'event' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500' :
                    notification.type === 'job' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                    'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                  }`}>
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-gray-900 dark:text-white ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatNotificationTime(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.type === 'connection' ? 'Connection Request' :
                       notification.type === 'message' ? 'New Message' :
                       notification.type === 'event' ? 'Event Update' :
                       notification.type === 'job' ? 'Job Opportunity' :
                       notification.type === 'mentorship' ? 'Mentorship' : 'Notification'}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2">
                      {notification.actionUrl && (
                        <a 
                          href={notification.actionUrl}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {notification.actionText || 'View Details'}
                        </a>
                      )}
                      
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Earlier notifications */}
          {earlierNotifications.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Earlier</h3>
              </div>
              
              {earlierNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start space-x-4 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.type === 'connection' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                    notification.type === 'message' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' :
                    notification.type === 'event' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500' :
                    notification.type === 'job' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                    'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                  }`}>
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-gray-900 dark:text-white ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatNotificationTime(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.type === 'connection' ? 'Connection Request' :
                       notification.type === 'message' ? 'New Message' :
                       notification.type === 'event' ? 'Event Update' :
                       notification.type === 'job' ? 'Job Opportunity' :
                       notification.type === 'mentorship' ? 'Mentorship' : 'Notification'}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2">
                      {notification.actionUrl && (
                        <a 
                          href={notification.actionUrl}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {notification.actionText || 'View Details'}
                        </a>
                      )}
                      
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination or load more */}
        {filteredNotifications.length > 10 && (
          <div className="p-4 text-center">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>
      
      {/* Notification settings */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notification Settings</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Connection Requests</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notifications about new connection requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Event Reminders</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remind me about upcoming events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Job Opportunities</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">New job postings matching my profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Mentorship Updates</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notifications about mentorship activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 