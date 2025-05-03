import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { currentUser: user, userRole: role } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Monitor for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.displayName || user?.email}!
            </h2>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-xl">{user?.displayName ? user.displayName[0].toUpperCase() : '👤'}</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
            <div className="flex items-center text-blue-700 dark:text-blue-300">
              <span className="mr-2 text-xl">🔑</span>
              <p className="font-medium">Your role: <span className="font-bold">{role}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-2">📁</span>
                  <a href="#" className="hover:underline">My Profile</a>
                </li>
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-2">📅</span>
                  <a href="/events" className="hover:underline">View Events</a>
                </li>
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-2">🔔</span>
                  <a href="#" className="hover:underline">Notifications</a>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Activity</h3>
              <p className="text-gray-700 dark:text-gray-300">No recent activity to display.</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="mr-2">🚪</span> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
