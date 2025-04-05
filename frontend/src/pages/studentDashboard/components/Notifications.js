import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { markNotificationAsRead } from '../../../services/notificationService';

const Notifications = ({ currentUser, isDarkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="notifications-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Notifications</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="loader">Loading...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              You don't have any notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-3 ${
                    notification.read ? 'opacity-75' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-800 rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {notification.title || 'New Notification'}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 mb-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2">
                      {notification.actionUrl && (
                        <a 
                          href={notification.actionUrl}
                          className="text-blue-600 dark:text-blue-400 text-sm hover:underline inline-block"
                        >
                          {notification.actionText || 'View Details'}
                        </a>
                      )}
                      
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 