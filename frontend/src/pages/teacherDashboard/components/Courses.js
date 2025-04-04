import React, { useState } from 'react';

const Courses = ({ isDarkMode }) => {
  const [activeCourses, setActiveCourses] = useState([
    {
      id: 'CS101',
      title: 'Data Structures',
      students: 45,
      progress: 65,
      schedule: 'Mon, Wed 10:00 - 11:30 AM',
      room: 'Engineering 301',
      thumbnail: 'https://source.unsplash.com/random/800x600/?data',
      nextClass: '2023-10-20T10:00:00',
      upcomingDeadline: {
        title: 'Assignment 3: Binary Trees',
        due: '2023-10-25T23:59:00'
      }
    },
    {
      id: 'CS301',
      title: 'Web Development',
      students: 32,
      progress: 42,
      schedule: 'Tue, Thu 2:00 - 3:30 PM',
      room: 'Science Hall 105',
      thumbnail: 'https://source.unsplash.com/random/800x600/?web',
      nextClass: '2023-10-19T14:00:00',
      upcomingDeadline: {
        title: 'Project Milestone 1',
        due: '2023-10-22T23:59:00'
      }
    },
    {
      id: 'CS401',
      title: 'Artificial Intelligence',
      students: 28,
      progress: 35,
      schedule: 'Wed, Fri 1:00 - 2:30 PM',
      room: 'Engineering 204',
      thumbnail: 'https://source.unsplash.com/random/800x600/?ai',
      nextClass: '2023-10-18T13:00:00',
      upcomingDeadline: {
        title: 'Research Paper Outline',
        due: '2023-10-30T23:59:00'
      }
    }
  ]);

  const [pastCourses, setPastCourses] = useState([
    {
      id: 'CS201',
      title: 'Object-Oriented Programming',
      students: 38,
      term: 'Spring 2023',
      thumbnail: 'https://source.unsplash.com/random/800x600/?coding'
    },
    {
      id: 'CS250',
      title: 'Database Systems',
      students: 30,
      term: 'Fall 2022',
      thumbnail: 'https://source.unsplash.com/random/800x600/?database'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Filter courses based on search term
  const filteredActiveCourses = activeCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPastCourses = pastCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle creating a new course
  const handleCreateCourse = () => {
    console.log('Create new course clicked');
    // Navigation to create course form or modal opening would go here
  };

  return (
    <div className="courses-container">
      {/* Search and filter bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md transition ${activeTab === 'active' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-md transition ${activeTab === 'past' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </button>
          </div>
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Course
          </button>
        </div>
      </div>

      {/* Course cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        {activeTab === 'active' ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Active Courses</h2>
            
            {filteredActiveCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No active courses found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActiveCourses.map(course => (
                  <div key={course.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="h-32 overflow-hidden relative">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-4 text-white">
                          <h3 className="text-lg font-bold">{course.id}</h3>
                          <p>{course.title}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {course.students} Students
                        </span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {course.progress}% Complete
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-4">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-start">
                          <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{course.schedule}</span>
                        </div>
                        <div className="flex items-start">
                          <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{course.room}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Class:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(course.nextClass)}</span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upcoming:</span>
                            <div className="flex justify-between items-center mt-1 bg-orange-50 dark:bg-gray-600/50 p-2 rounded">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{course.upcomingDeadline.title}</span>
                              <span className={`text-sm font-medium ${getDaysRemaining(course.upcomingDeadline.due) <= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {getDaysRemaining(course.upcomingDeadline.due)} days left
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex-1">
                          Course Page
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-1">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Past Courses</h2>
            
            {filteredPastCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No past courses found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPastCourses.map(course => (
                  <div key={course.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="h-24 overflow-hidden relative">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-3 text-white">
                          <h3 className="text-sm font-bold">{course.id}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 dark:text-white">{course.title}</h3>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Term:</span>
                          <span>{course.term}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Students:</span>
                          <span>{course.students}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          View Archive
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Course Analytics */}
      {activeTab === 'active' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Course Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Student Engagement</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Attendance</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">87%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assignment Completion</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">92%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Discussion Participation</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">74%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '74%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Performance Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">A (90-100%)</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">23 students</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">B (80-89%)</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">31 students</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '47%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">C (70-79%)</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">8 students</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">D (60-69%)</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">3 students</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '4%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">F (below 60%)</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">1 student</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '2%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Teaching Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Teaching Hours</p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white">126 hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assignment Feedback</p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white">213 items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Course Resources</p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white">47 files</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Student Inquiries</p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white">89 resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses; 