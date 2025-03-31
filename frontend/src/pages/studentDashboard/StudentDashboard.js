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

          {activeSection === 'forum' && (
            <div className="px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h10" />
                    </svg>
                    Forums & Discussions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Connect, learn, and share with your fellow students.</p>
                </div>
                <div className="flex mt-4 md:mt-0">
                  <button className="px-4 py-2 mr-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Post
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Discussions
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="w-full md:w-1/2 relative">
                  <input
                    type="text"
                    placeholder="Search forums, topics, or keywords..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="w-full md:w-auto">
                  <select 
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
                  >
                    <option value="">All Categories</option>
                    <option value="technology">Technology</option>
                    <option value="academic">Academic</option>
                    <option value="career">Career</option>
                    <option value="campus">Campus Life</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Technology Forum Category */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Technology</h3>
                      <div className="flex text-sm text-gray-500">
                        <span className="mr-4">532 posts</span>
                        <span>128 active users</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Discuss programming, web development, AI, machine learning, cybersecurity, and other tech topics.
                  </p>
                  <button className="w-full py-2 px-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium">
                    Browse Technology Forums
                  </button>
                </div>

                {/* Academic Forum Category */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Academic</h3>
                      <div className="flex text-sm text-gray-500">
                        <span className="mr-4">748 posts</span>
                        <span>215 active users</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Discuss courses, study strategies, research opportunities, and academic challenges.
                  </p>
                  <button className="w-full py-2 px-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm font-medium">
                    Browse Academic Forums
                  </button>
                </div>

                {/* Career Forum Category */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Career</h3>
                      <div className="flex text-sm text-gray-500">
                        <span className="mr-4">625 posts</span>
                        <span>176 active users</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Discuss job hunting, interview tips, resume building, and career advancement opportunities.
                  </p>
                  <button className="w-full py-2 px-4 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm font-medium">
                    Browse Career Forums
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Hot Discussions</h3>
                  <button className="text-blue-500 dark:text-blue-400 hover:underline">View All →</button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                     style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                  {/* Hot Discussion 1 */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 overflow-hidden">
                        <img src="https://randomuser.me/api/portraits/men/78.jpg" alt="User" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Best resources to learn React Native in 2023?
                          </h4>
                          <div className="flex items-center gap-3 mt-2 md:mt-0">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              Technology
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          I'm looking to dive into React Native development and would appreciate recommendations for up-to-date resources, courses, and tutorials that have helped others...
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">👍</span> 24 likes
                          </span>
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">💬</span> 18 replies
                          </span>
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">👁️</span> 142 views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hot Discussion 2 */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0 overflow-hidden">
                        <img src="https://randomuser.me/api/portraits/women/52.jpg" alt="User" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Tips for last minute exam preparation?
                          </h4>
                          <div className="flex items-center gap-3 mt-2 md:mt-0">
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                              Academic
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Yesterday</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          Finals are approaching and I've fallen behind in a couple of subjects. Does anyone have advice for effective cramming or tips to make the most of limited study time?
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">👍</span> 42 likes
                          </span>
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">💬</span> 31 replies
                          </span>
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">👁️</span> 276 views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hot Discussion 3 */}
                  <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0 overflow-hidden">
                        <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="User" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Experience with on-campus recruitment at Google?
                          </h4>
                          <div className="flex items-center gap-3 mt-2 md:mt-0">
                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                              Career
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">2 days ago</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          I have an upcoming on-campus interview with Google for a software engineering role. Would love to hear from anyone who's been through their interview process recently...
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">👍</span> 37 likes
                          </span>
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">💬</span> 22 replies
                          </span>
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">👁️</span> 195 views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Discussions</h3>
                      <select 
                        className="py-1 px-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: isDarkMode ? '#374151' : 'white' }}
                      >
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="activity">Most Active</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg p-2">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <img src="https://randomuser.me/api/portraits/women/22.jpg" className="h-7 w-7 rounded-full mr-2" alt="User" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Emily Chen</p>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">30 mins ago</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Technology</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Switching from Angular to React - worth it?</h4>
                        <div className="flex items-center gap-4 text-xs mt-2">
                          <span className="text-gray-500 dark:text-gray-400">👍 5</span>
                          <span className="text-gray-500 dark:text-gray-400">💬 3</span>
                        </div>
                      </div>
                      
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg p-2">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <img src="https://randomuser.me/api/portraits/men/45.jpg" className="h-7 w-7 rounded-full mr-2" alt="User" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Johnson</p>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">2 hours ago</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">Campus Life</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Best places to eat around campus?</h4>
                        <div className="flex items-center gap-4 text-xs mt-2">
                          <span className="text-gray-500 dark:text-gray-400">👍 18</span>
                          <span className="text-gray-500 dark:text-gray-400">💬 12</span>
                        </div>
                      </div>
                      
                      <div className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg p-2">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <img src="https://randomuser.me/api/portraits/men/36.jpg" className="h-7 w-7 rounded-full mr-2" alt="User" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">James Wilson</p>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">4 hours ago</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">Academic</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Database Systems project partners needed</h4>
                        <div className="flex items-center gap-4 text-xs mt-2">
                          <span className="text-gray-500 dark:text-gray-400">👍 7</span>
                          <span className="text-gray-500 dark:text-gray-400">💬 9</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
                      View More Discussions
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Trending Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                        #programming
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                        #exams
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                        #internships
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                        #react
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                        #jobs
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                        #AI
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                        #studytips
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
                       style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Active Members</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src="https://randomuser.me/api/portraits/men/32.jpg" className="h-8 w-8 rounded-full mr-3" alt="User" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">David Thompson</p>
                            <p className="text-xs text-gray-500">84 posts this month</p>
                          </div>
                        </div>
                        <button className="text-blue-500 hover:text-blue-700 text-sm">Follow</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src="https://randomuser.me/api/portraits/women/44.jpg" className="h-8 w-8 rounded-full mr-3" alt="User" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">Sarah Johnson</p>
                            <p className="text-xs text-gray-500">67 posts this month</p>
                          </div>
                        </div>
                        <button className="text-blue-500 hover:text-blue-700 text-sm">Follow</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src="https://randomuser.me/api/portraits/men/55.jpg" className="h-8 w-8 rounded-full mr-3" alt="User" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">Michael Chen</p>
                            <p className="text-xs text-gray-500">53 posts this month</p>
                          </div>
                        </div>
                        <button className="text-blue-500 hover:text-blue-700 text-sm">Follow</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Start a Discussion</h3>
                    <p className="text-white/90 mb-4">
                      Have a question or something to share? Start a discussion and get responses from your peers.
                    </p>
                    <button className="w-full py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-opacity-90 transition-colors">
                      Create New Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your account preferences and dashboard appearance.</p>
                </div>
                <button className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Setting Categories Sidebar */}
                <div className="md:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-4">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-800 dark:text-white">Settings Categories</h3>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 py-3 flex items-center text-left bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-700 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                      </button>
                      <button className="w-full px-4 py-3 flex items-center text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Privacy & Security
                      </button>
                      <button className="w-full px-4 py-3 flex items-center text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Appearance
                      </button>
                      <button className="w-full px-4 py-3 flex items-center text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                        Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="md:col-span-3">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Social Profiles</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-12 text-center text-xl mr-3 text-blue-500">
                          <i className="fab fa-linkedin"></i>
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            placeholder="LinkedIn URL"
                            defaultValue="https://linkedin.com/in/johndoe"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 text-center text-xl mr-3 text-gray-700 dark:text-gray-300">
                          <i className="fab fa-github"></i>
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            placeholder="GitHub URL"
                            defaultValue="https://github.com/johndoe"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 text-center text-xl mr-3 text-purple-500">
                          <i className="fas fa-globe"></i>
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            placeholder="Portfolio Website"
                            defaultValue="https://johndoe.dev"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Display Preferences</h3>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">Dark Mode</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark themes</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">Email Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">Push Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on this device</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Layout Density</h4>
                        <div className="flex gap-4">
                          <label className="flex-1 relative border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex flex-col items-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500">
                            <input type="radio" name="density" className="sr-only" defaultChecked />
                            <span className="h-10 w-10 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">Compact</span>
                            <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500"></span>
                          </label>
                          <label className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex flex-col items-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500">
                            <input type="radio" name="density" className="sr-only" />
                            <span className="h-10 w-10 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM4 13h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1z" />
                              </svg>
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">Comfortable</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other dashboard sections remain here */}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
