import React, { useState } from 'react';

const Mentorship = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('myPrograms');
  
  // Sample mentorship programs data
  const mentorshipPrograms = [
    {
      id: 1,
      title: 'Web Development Mentorship',
      description: 'Help students learn modern web development technologies and best practices.',
      status: 'active',
      mentees: 5,
      rating: 4.8,
      reviews: 12,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      icon: '💻',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      description: 'Guide students through data analysis, visualization, and machine learning basics.',
      status: 'active',
      mentees: 3,
      rating: 4.9,
      reviews: 8,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      icon: '📊',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 3,
      title: 'UI/UX Design Workshop',
      description: 'Teach design principles, user research, and prototyping techniques.',
      status: 'upcoming',
      mentees: 0,
      spots: 4,
      startDate: new Date('2023-06-15'),
      duration: '8 weeks',
      icon: '🎨',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      id: 4,
      title: 'Career Development',
      description: 'Guide students through resume building, interview prep, and job search strategies.',
      status: 'completed',
      mentees: 7,
      rating: 4.7,
      reviews: 15,
      success: '5 mentees found jobs',
      icon: '🚀',
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  // Sample mentees data
  const mentees = [
    {
      id: 1,
      name: 'Sarah Johnson',
      program: 'Web Development Mentorship',
      avatar: '👩‍💻',
      progress: 75,
      joined: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Lee',
      program: 'Web Development Mentorship',
      avatar: '👨‍💻',
      progress: 60,
      joined: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      program: 'Data Science Fundamentals',
      avatar: '👩‍🔬',
      progress: 85,
      joined: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      nextSession: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 4,
      name: 'David Kim',
      program: 'Career Development',
      avatar: '👨‍💼',
      progress: 100,
      joined: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      outcome: 'Hired at Tech Inc.',
      status: 'completed'
    }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
    return formatDate(date);
  };

  return (
    <div className="mentorship-section space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('myPrograms')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'myPrograms'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Mentorship Programs
            </button>
            <button
              onClick={() => setActiveTab('mentees')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'mentees'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Mentees
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'opportunities'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Mentorship Opportunities
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'myPrograms' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Mentorship Programs</h2>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                  <span>Create Program</span> <span>➕</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentorshipPrograms.map((program) => (
                  <div 
                    key={program.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: isDarkMode ? '#080725' : 'white' }}
                  >
                    <div className="relative">
                      <div className={`h-24 bg-gradient-to-r ${program.gradient}`}></div>
                      <div className="absolute top-12 left-6 w-20 h-20 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-700 flex items-center justify-center text-3xl">
                        {program.icon}
                      </div>
                    </div>
                    
                    <div className="p-5 pt-14">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{program.title}</h3>
                        <span className={`px-2 py-1 ${
                          program.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : program.status === 'upcoming'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        } text-xs rounded-full`}>
                          {program.status === 'active' 
                            ? 'Active' 
                            : program.status === 'upcoming' 
                            ? 'Starting Soon' 
                            : 'Completed'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{program.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="text-sm mr-2">👥</span>
                          <span className="text-sm">
                            {program.status === 'upcoming' 
                              ? `0 Mentees (${program.spots} spots available)` 
                              : `${program.mentees} Mentees`}
                          </span>
                        </div>
                        
                        {(program.status === 'active' || program.status === 'completed') && (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">⭐</span>
                            <span className="text-sm">{program.rating} Rating ({program.reviews} reviews)</span>
                          </div>
                        )}
                        
                        {program.status === 'upcoming' ? (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">📅</span>
                            <span className="text-sm">Starts on {formatDate(program.startDate)}</span>
                          </div>
                        ) : program.status === 'active' ? (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">⏱️</span>
                            <span className="text-sm">Started {Math.floor((new Date() - new Date(program.startDate)) / (1000 * 60 * 60 * 24 * 30))} months ago</span>
                          </div>
                        ) : (
                          program.success && (
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">🏆</span>
                              <span className="text-sm">{program.success}</span>
                            </div>
                          )
                        )}
                        
                        {program.duration && (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">⏱️</span>
                            <span className="text-sm">{program.duration} program</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm">
                          View Details
                        </button>
                        
                        {program.status === 'active' ? (
                          <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm">
                            Manage Mentees
                          </button>
                        ) : program.status === 'upcoming' ? (
                          <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm">
                            Edit Program
                          </button>
                        ) : (
                          <button className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm">
                            Restart Program
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {activeTab === 'mentees' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Mentees</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search mentees..."
                    className="px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mentee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Program
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Next Session
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {mentees.map((mentee) => (
                      <tr key={mentee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl">
                              {mentee.avatar}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {mentee.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Joined {formatDate(mentee.joined)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{mentee.program}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${mentee.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                            {mentee.progress}% Complete
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {mentee.status === 'active' 
                              ? getRelativeTime(mentee.nextSession)
                              : 'Completed'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            mentee.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {mentee.status === 'active' ? 'Active' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex gap-2">
                            <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                              View
                            </button>
                            {mentee.status === 'active' && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                  Schedule
                                </button>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                  Message
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {activeTab === 'opportunities' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Available Mentorship Opportunities</h2>
              </div>
              
              <div className="text-center py-10">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No open mentorship requests at the moment</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">We'll notify you when students are looking for mentors in your area of expertise.</p>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  Update Mentorship Preferences
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mentorship; 