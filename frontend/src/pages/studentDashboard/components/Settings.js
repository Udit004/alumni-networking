import React, { useState } from 'react';

const Settings = ({ isDarkMode, setIsDarkMode }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [notificationsForAssignments, setNotificationsForAssignments] = useState(true);
  const [notificationsForEvents, setNotificationsForEvents] = useState(true);
  const [notificationsForMessages, setNotificationsForMessages] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    // In a real application, this would send a request to the backend
    // to save the user's settings
    console.log('Saving settings:', {
      emailNotifications,
      smsNotifications,
      profileVisibility,
      notificationsForAssignments,
      notificationsForEvents,
      notificationsForMessages,
      isDarkMode
    });
    
    // Show success message
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="settings-section space-y-8">
      {saveSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-lg mb-4 flex items-center">
          <span className="mr-2">✓</span>
          Settings saved successfully!
        </div>
      )}
      
      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
         style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Account Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
              value="student@example.com" 
              readOnly
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Password</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
              Change Password
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
         style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Notification Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input 
                type="checkbox" 
                id="email-notif" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" 
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              <label htmlFor="email-notif" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input 
                type="checkbox" 
                id="sms-notif" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" 
                checked={smsNotifications}
                onChange={() => setSmsNotifications(!smsNotifications)}
              />
              <label htmlFor="sms-notif" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Assignment Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new assignments and due dates</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input 
                type="checkbox" 
                id="assignment-notif" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" 
                checked={notificationsForAssignments}
                onChange={() => setNotificationsForAssignments(!notificationsForAssignments)}
              />
              <label htmlFor="assignment-notif" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Event Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new events</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input 
                type="checkbox" 
                id="event-notif" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" 
                checked={notificationsForEvents}
                onChange={() => setNotificationsForEvents(!notificationsForEvents)}
              />
              <label htmlFor="event-notif" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Message Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new messages</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input 
                type="checkbox" 
                id="message-notif" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" 
                checked={notificationsForMessages}
                onChange={() => setNotificationsForMessages(!notificationsForMessages)}
              />
              <label htmlFor="message-notif" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
         style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-800 dark:text-white font-medium">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
          </div>
          <div className="relative inline-block w-12 align-middle select-none">
            <input 
              type="checkbox" 
              id="theme-toggle" 
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" 
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <label htmlFor="theme-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
      </div>
      
      {/* Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
         style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Privacy</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-800 dark:text-white font-medium">Profile Visibility</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile</p>
          </div>
          <select 
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="connections">Connections Only</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
      
      {/* Security */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
         style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Security</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-800 dark:text-white font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
            Set Up
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          onClick={handleSaveSettings}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings; 