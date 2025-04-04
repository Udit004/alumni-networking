import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './SideNav.css';

const SideNav = ({ 
  isNavExpanded, 
  setIsNavExpanded, 
  activeSection, 
  handleSectionClick,
  unreadCount = 0
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', count: unreadCount },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'mentorship', label: 'Mentorship', icon: '🤝' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div 
      className={`sidenav h-full transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg
                ${isNavExpanded ? 'expanded' : 'collapsed'}`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        {isNavExpanded && (
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Student Dashboard</h3>
        )}
        <button 
          className="toggle-btn p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
        >
          {isNavExpanded ? '◀' : '▶'}
        </button>
      </div>

      <nav className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item w-full flex items-center p-3 my-1 text-left rounded-lg transition-colors ${
              activeSection === item.id 
                ? 'active bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleSectionClick(item.id)}
          >
            <span className="icon text-xl mr-3">{item.icon}</span>
            {isNavExpanded && (
              <div className="flex-1 flex justify-between items-center">
                <span className="label font-medium">{item.label}</span>
                {item.count > 0 && (
                  <span className="count flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5">
                    {item.count}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          className="menu-item w-full flex items-center p-3 my-1 text-left rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
          onClick={handleLogout}
        >
          <span className="icon text-xl mr-3">🚪</span>
          {isNavExpanded && (
            <span className="label font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SideNav; 