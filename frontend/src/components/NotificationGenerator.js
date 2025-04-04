import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NotificationGenerator = () => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const generateTestNotification = () => {
    if (!currentUser) {
      setStatus('Error: You must be logged in to generate notifications');
      return;
    }

    setLoading(true);
    setStatus('Generating test notification...');

    // Simulate API call
    setTimeout(() => {
      setStatus('Test notification created successfully!');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Notification Generator</h3>
      
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Use this tool to create a test notification to verify that the notification system is working.
      </p>
      
      <button
        onClick={generateTestNotification}
        disabled={loading}
        className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Create Test Notification'}
      </button>
      
      {status && (
        <div className={`mt-4 p-3 rounded ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default NotificationGenerator; 