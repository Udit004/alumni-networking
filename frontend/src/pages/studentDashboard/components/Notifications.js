import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { markNotificationAsRead } from '../../../services/notificationService';

const Notifications = ({ currentUser, isDarkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const notificationsList = [];
        
        querySnapshot.forEach((doc) => {
          notificationsList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        
        setNotifications(notificationsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [currentUser]);

  const handleMarkAsRead = async (event, notificationId) => {
    event.stopPropagation(); // Prevent the container click event
    
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(notification => !notification.read);
    
    try {
      const markAllPromises = unreadNotifications.map(notification => 
        markNotificationAsRead(notification.id)
      );
      
      await Promise.all(markAllPromises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection':
        return '👥';
      case 'message':
        return '💬';
      case 'event':
        return '🗓️';
      case 'job':
        return '💼';
      case 'course':
        return '📚';
      case 'assignment':
        return '📝';
      case 'mentorship':
        return '🧠';
      default:
        return '🔔';
    }
  };
  
  // Filter notifications based on selected filter and timeframe
  const filteredNotifications = notifications.filter(notification => {
    if (filter !== 'all' && notification.type !== filter) return false;
    
    if (timeframe === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(notification.timestamp?.toDate?.() || notification.timestamp) >= today;
    }
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(notification.timestamp?.toDate?.() || notification.timestamp) >= weekAgo;
    }
    if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(notification.timestamp?.toDate?.() || notification.timestamp) >= monthAgo;
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
    new Date(notification.timestamp?.toDate?.() || notification.timestamp) >= todayDate
  );
  
  const yesterdayNotifications = filteredNotifications.filter(notification => 
    new Date(notification.timestamp?.toDate?.() || notification.timestamp) >= yesterdayDate && 
    new Date(notification.timestamp?.toDate?.() || notification.timestamp) < todayDate
  );
  
  const earlierNotifications = filteredNotifications.filter(notification => 
    new Date(notification.timestamp?.toDate?.() || notification.timestamp) < yesterdayDate
  );
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="notifications-container">
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
                <option value="course">Courses</option>
                <option value="assignment">Assignments</option>
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
                  onClick={handleMarkAllAsRead}
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
          {/* Loading state */}
          {loading && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          )}
          
          {/* Error state */}
          {error && !loading && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 text-2xl mb-4">
                ⚠️
              </div>
              <h3 className="text-lg font-medium text-red-500 dark:text-red-400 mb-2">Error loading notifications</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {error}
              </p>
            </div>
          )}
          
          {/* Empty state */}
          {!loading && !error && filteredNotifications.length === 0 && (
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
          {!loading && !error && todayNotifications.length > 0 && (
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
                    notification.type === 'course' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                    notification.type === 'assignment' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-500' :
                    notification.type === 'mentorship' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                    'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                  }`}>
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-gray-900 dark:text-white ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.title || notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message !== notification.title && notification.message}
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
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
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
          {!loading && !error && yesterdayNotifications.length > 0 && (
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
                    notification.type === 'course' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                    notification.type === 'assignment' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-500' :
                    notification.type === 'mentorship' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                    'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                  }`}>
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-gray-900 dark:text-white ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.title || notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message !== notification.title && notification.message}
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
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
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
          {!loading && !error && earlierNotifications.length > 0 && (
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
                    notification.type === 'course' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                    notification.type === 'assignment' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-500' :
                    notification.type === 'mentorship' ? 'bg-green-100 dark:bg-green-900/30 text-green-500' :
                    'bg-gray-100 dark:bg-gray-900/30 text-gray-500'
                  }`}>
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-gray-900 dark:text-white ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.title || notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message !== notification.title && notification.message}
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
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
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
        {!loading && !error && filteredNotifications.length > 10 && (
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
                <p className="text-gray-800 dark:text-white font-medium">Assignment Reminders</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remind me about upcoming assignments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Course Updates</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notifications about course materials and announcements</p>
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