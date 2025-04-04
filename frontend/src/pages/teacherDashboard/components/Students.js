import React, { useState } from 'react';

const Students = ({ isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  
  // Mock data for students
  const students = [
    {
      id: 'ST10034',
      name: 'Michael Johnson',
      photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
      course: 'CS101',
      courseName: 'Data Structures',
      performance: 85,
      lastActivity: 'Yesterday, 3:24 PM'
    },
    {
      id: 'ST10045',
      name: 'Emma Wilson',
      photoURL: 'https://randomuser.me/api/portraits/women/2.jpg',
      course: 'CS301',
      courseName: 'Web Development',
      performance: 92,
      lastActivity: 'Today, 10:15 AM'
    },
    {
      id: 'ST10057',
      name: 'David Chen',
      photoURL: 'https://randomuser.me/api/portraits/men/3.jpg',
      course: 'CS401',
      courseName: 'Artificial Intelligence',
      performance: 78,
      lastActivity: '2 days ago'
    },
    {
      id: 'ST10062',
      name: 'Sophia Rodriguez',
      photoURL: 'https://randomuser.me/api/portraits/women/4.jpg',
      course: 'CS101',
      courseName: 'Data Structures',
      performance: 95,
      lastActivity: 'Yesterday, 5:30 PM'
    },
    {
      id: 'ST10073',
      name: 'James Taylor',
      photoURL: 'https://randomuser.me/api/portraits/men/5.jpg',
      course: 'CS301',
      courseName: 'Web Development',
      performance: 81,
      lastActivity: '3 days ago'
    },
    {
      id: 'ST10089',
      name: 'Olivia Lee',
      photoURL: 'https://randomuser.me/api/portraits/women/6.jpg',
      course: 'CS401',
      courseName: 'Artificial Intelligence',
      performance: 88,
      lastActivity: 'Today, 9:45 AM'
    }
  ];

  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 'CS101', name: 'CS101 - Data Structures' },
    { id: 'CS301', name: 'CS301 - Web Development' },
    { id: 'CS401', name: 'CS401 - Artificial Intelligence' }
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return 'bg-green-500';
    if (performance >= 80) return 'bg-blue-500';
    if (performance >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="students-section">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Students</h2>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Search students..." 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                        {student.photoURL ? (
                          <img src={student.photoURL} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {student.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{student.course}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.courseName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${getPerformanceColor(student.performance)}`} style={{ width: `${student.performance}%` }}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{student.performance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {student.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-500 hover:text-blue-600 mr-3">View</a>
                    <a href="#" className="text-blue-500 hover:text-blue-600">Message</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No students found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Student Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Course Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">CS101 - Data Structures</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Performance</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">90%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Enrolled Students</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">45</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">95%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">CS301 - Web Development</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Performance</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">86%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Enrolled Students</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">32</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">88%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">CS401 - Artificial Intelligence</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Performance</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">83%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Enrolled Students</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">28</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white">80%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students; 