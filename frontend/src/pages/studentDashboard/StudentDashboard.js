import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import EnrolledEvents from "./EnrolledEvents";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'events', label: 'Enrolled Events', icon: '📅' },
    { id: 'courses', label: 'Course Materials', icon: '📚' },
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { id: 'jobs', label: 'Jobs & Internships', icon: '💼' },
    { id: 'forum', label: 'Forums', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <div 
        className={`h-full transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg
                  ${isNavExpanded ? 'w-64' : 'w-20'}`}
        style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          {isNavExpanded && (
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Student Dashboard</h3>
          )}
          <button 
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
            {isNavExpanded ? '◀' : '▶'}
          </button>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center p-3 my-1 text-left rounded-lg transition-colors ${
                activeSection === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleSectionClick(item.id)}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {isNavExpanded && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-10"
                style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h1>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">3</span>
              </button>
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.displayName ? user.displayName[0].toUpperCase() : '👤'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeSection === 'overview' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">📅</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Enrolled Events</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">📚</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Course Progress</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">75%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">🎓</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Mentorship</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">💬</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Forum Activity</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">📅</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">Enrolled in "Career Development Workshop"</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">📚</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">Completed Module 3 in "Web Development"</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Yesterday</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">💬</div>
                    <div>
                      <p className="text-gray-800 dark:text-white">Posted in "Technology Trends" forum</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                 style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl mb-4 overflow-hidden">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.displayName ? user.displayName[0].toUpperCase() : '👤'
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.displayName || 'Student Name'}</h2>
                    <p className="text-gray-600 dark:text-gray-400">Computer Science Department</p>
                    <div className="flex justify-center gap-4 mt-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">3rd</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">8.5</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">CGPA</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">15</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</h3>
                      <p className="text-gray-900 dark:text-white">{user?.email || 'student@example.com'}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Phone</h3>
                      <p className="text-gray-900 dark:text-white">+91 98765 43210</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Roll Number</h3>
                      <p className="text-gray-900 dark:text-white">CS2021045</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Batch</h3>
                      <p className="text-gray-900 dark:text-white">2021-2025</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:col-span-2">
                      <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Skills & Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">JavaScript</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">React</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Node.js</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Python</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Machine Learning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'events' && <EnrolledEvents />}

          {activeSection === 'courses' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                 style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Course Materials</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="py-2 px-10 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: isDarkMode ? '#374151' : 'white' }}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300">
                    🔍
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Web Development</h3>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">75% Complete</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">Learn modern web development with React and Node.js</p>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                    Continue Learning
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Data Structures</h3>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">40% Complete</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">Master fundamental data structures and algorithms</p>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                    Continue Learning
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'mentorship' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 col-span-1 md:col-span-4"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">My Mentorship Program</h2>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                        <span>Find Mentors</span> 🔍
                      </button>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors flex items-center gap-2">
                        <span>View All</span> →
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Connect with industry professionals and senior alumni who can guide you on your career path.
                    Currently you have 2 active mentorship connections.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl mr-4 overflow-hidden">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Mentor" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">David Thompson</h3>
                        <p className="text-gray-600 dark:text-gray-400">Senior Software Engineer at Google</p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">★★★★★</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">5.0 (24 reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Software Development</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">AI/ML</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Career Growth</span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        "David has been an incredible mentor, providing practical advice on system design and helping me prepare for technical interviews."
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next session:</span>
                      <span className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">Tomorrow, 4:00 PM</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                      Schedule Session
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-2xl mr-4 overflow-hidden">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Mentor" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sarah Johnson</h3>
                        <p className="text-gray-600 dark:text-gray-400">Product Manager at Microsoft</p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">★★★★☆</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">4.8 (19 reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">Product Management</span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">UX Research</span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">Leadership</span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        "Sarah's guidance has been invaluable in helping me understand product development lifecycle and how to transition into product management roles."
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next session:</span>
                      <span className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">Friday, 5:30 PM</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                      Schedule Session
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 col-span-1 md:col-span-3"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span>Recommended Mentors</span>
                    <span className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">New</span>
                  </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:scale-105"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                      <img src="https://randomuser.me/api/portraits/men/55.jpg" alt="Recommended Mentor" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Michael Chen</h3>
                    <p className="text-gray-600 dark:text-gray-400">Technical Director at Amazon</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">5.0</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Cloud Computing</span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">DevOps</span>
                  </div>
                  
                  <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Request Mentorship
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:scale-105"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                      <img src="https://randomuser.me/api/portraits/women/63.jpg" alt="Recommended Mentor" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Emma Rodriguez</h3>
                    <p className="text-gray-600 dark:text-gray-400">Data Science Manager at Netflix</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">4.9</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">Data Science</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">Machine Learning</span>
                  </div>
                  
                  <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Request Mentorship
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:scale-105"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                      <img src="https://randomuser.me/api/portraits/men/22.jpg" alt="Recommended Mentor" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Daniel Kim</h3>
                    <p className="text-gray-600 dark:text-gray-400">Startup Founder & Angel Investor</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★★★★☆</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">4.7</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">Entrepreneurship</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">Fundraising</span>
                  </div>
                  
                  <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Request Mentorship
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Upcoming Mentorship Events</h2>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-center min-w-[80px] h-20 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-800 dark:text-blue-200">15</div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">May</div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Career Guidance Workshop</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Learn how to plan your career path and set goals with guidance from industry experts</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-1">🕒</span> 2:00 PM - 4:00 PM
                        </span>
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-1">📍</span> Virtual (Zoom)
                        </span>
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-1">👥</span> 45 Registered
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm whitespace-nowrap">
                        Register Now
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-center min-w-[80px] h-20 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-800 dark:text-purple-200">22</div>
                        <div className="text-sm text-purple-800 dark:text-purple-200">May</div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tech Industry Panel Discussion</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Hear from alumni working at top tech companies about current industry trends and opportunities</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-1">🕒</span> 6:00 PM - 8:00 PM
                        </span>
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-1">📍</span> Main Auditorium
                        </span>
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-1">👥</span> 78 Registered
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm whitespace-nowrap">
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 col-span-1 md:col-span-4"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Jobs & Internships</h2>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                        <span>Job Alerts</span> 🔔
                      </button>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors flex items-center gap-2">
                        <span>My Applications</span> 📑
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search jobs by title, company or skills..."
                        className="w-full py-3 px-4 pl-12 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: isDarkMode ? '#374151' : 'white' }}
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300">
                        🔍
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        className="py-3 px-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: isDarkMode ? '#374151' : 'white' }}
                      >
                        <option value="">All Job Types</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="internship">Internship</option>
                        <option value="remote">Remote</option>
                      </select>
                      <select 
                        className="py-3 px-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: isDarkMode ? '#374151' : 'white' }}
                      >
                        <option value="">All Locations</option>
                        <option value="bangalore">Bangalore</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi</option>
                        <option value="remote">Remote</option>
                      </select>
                      <button className="py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors">
                        Filters 🔽
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recommended for You</h3>
                  <button className="text-blue-500 dark:text-blue-400 hover:underline">View All →</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Job Card 1 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <div className="p-6">
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <div className="h-14 w-14 rounded-lg bg-white flex items-center justify-center mr-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img src="https://logo.clearbit.com/google.com" alt="Google" className="h-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                Full-time
                              </span>
                              <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                New
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Software Engineer</h3>
                            <p className="text-gray-600 dark:text-gray-400">Google Inc.</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                          <span className="text-xl">⭐</span>
                        </button>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="mr-2">📍</span>
                          <span>Bangalore, India (Hybrid)</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="mr-2">💰</span>
                          <span>₹15-25 LPA</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            JavaScript
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            React
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            Node.js
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            Cloud
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Posted:</span>
                        <span className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">2 days ago</span>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                        Apply Now
                      </button>
                    </div>
                  </div>

                  {/* Job Card 2 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <div className="p-6">
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <div className="h-14 w-14 rounded-lg bg-white flex items-center justify-center mr-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img src="https://logo.clearbit.com/microsoft.com" alt="Microsoft" className="h-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                                Internship
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Data Science Intern</h3>
                            <p className="text-gray-600 dark:text-gray-400">Microsoft</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                          <span className="text-xl">⭐</span>
                        </button>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="mr-2">📍</span>
                          <span>Hyderabad, India (On-site)</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="mr-2">💰</span>
                          <span>₹40,000 - 60,000 /month</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            Python
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            Machine Learning
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                            SQL
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Posted:</span>
                        <span className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">1 week ago</span>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Popular Full-time Positions</h3>
                  <button className="text-blue-500 dark:text-blue-400 hover:underline">View All →</button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Posted</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Frontend Developer</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">React, Redux, TypeScript</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full flex-shrink-0 mr-2">
                                <img src="https://logo.clearbit.com/amazon.com" alt="Amazon" className="h-8 w-8 rounded-full" />
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white">Amazon</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="mr-1">📍</span> Bangalore
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹18-28 LPA</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">3 days ago</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Apply</button>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Backend Engineer</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Java, Spring Boot, AWS</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full flex-shrink-0 mr-2">
                                <img src="https://logo.clearbit.com/flipkart.com" alt="Flipkart" className="h-8 w-8 rounded-full" />
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white">Flipkart</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="mr-1">📍</span> Bangalore
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹14-22 LPA</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1 week ago</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Apply</button>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Product Manager</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">2+ years experience</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full flex-shrink-0 mr-2">
                                <img src="https://logo.clearbit.com/swiggy.com" alt="Swiggy" className="h-8 w-8 rounded-full" />
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white">Swiggy</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="mr-1">📍</span> Bangalore, Remote
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹20-30 LPA</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2 weeks ago</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">Apply</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Top Internship Opportunities</h3>
                  <button className="text-blue-500 dark:text-blue-400 hover:underline">View All →</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Internship Card 1 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <div className="p-5">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full flex-shrink-0 mr-3 overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src="https://logo.clearbit.com/tesla.com" alt="Tesla" className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-white">UI/UX Design Intern</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tesla</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          Figma
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          Sketch
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          UI Design
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>₹25,000/month</span>
                        <span>3 months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">5 days ago</span>
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Internship Card 2 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <div className="p-5">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full flex-shrink-0 mr-3 overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src="https://logo.clearbit.com/infosys.com" alt="Infosys" className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-white">ML Research Intern</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Infosys</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          Python
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          Machine Learning
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          NLP
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>₹35,000/month</span>
                        <span>6 months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">2 days ago</span>
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Internship Card 3 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <div className="p-5">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full flex-shrink-0 mr-3 overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src="https://logo.clearbit.com/uber.com" alt="Uber" className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-white">Android Developer Intern</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Uber</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          Kotlin
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          Java
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          Android
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>₹45,000/month</span>
                        <span>3 months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Just now</span>
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-8"
                   style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0 md:mr-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Complete Your Profile</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add your resume and career preferences to increase your chances of getting hired by top companies.
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium rounded-lg transition-colors whitespace-nowrap">
                    Update Profile →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other sections remain as needed */}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
