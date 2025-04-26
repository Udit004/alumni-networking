import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaSearch, FaUserGraduate, FaBook, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';
import API_URLS from '../../../config/apiConfig';

// Mock data for courses
const mockCourses = [
  {
    _id: 'course1',
    title: 'Data Structures and Algorithms',
    description: 'Learn fundamental data structures and algorithms',
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-05-30'),
    capacity: 30,
    enrolledStudents: 25,
    createdAt: new Date('2022-12-01')
  },
  {
    _id: 'course2',
    title: 'Web Development',
    description: 'Learn modern web development techniques',
    startDate: new Date('2023-02-10'),
    endDate: new Date('2023-06-15'),
    capacity: 25,
    enrolledStudents: 20,
    createdAt: new Date('2022-12-15')
  },
  {
    _id: 'course3',
    title: 'Artificial Intelligence',
    description: 'Introduction to AI concepts and applications',
    startDate: new Date('2023-03-05'),
    endDate: new Date('2023-07-20'),
    capacity: 20,
    enrolledStudents: 18,
    createdAt: new Date('2023-01-10')
  }
];

// Mock data for students
const mockStudentsByCourse = {
  'course1': [
    {
      studentId: 'student1',
      studentName: 'John Smith',
      studentEmail: 'john.smith@example.com',
      program: 'Computer Science',
      currentYear: '3rd Year',
      enrolledAt: new Date('2023-01-20')
    },
    {
      studentId: 'student2',
      studentName: 'Emily Johnson',
      studentEmail: 'emily.johnson@example.com',
      program: 'Information Technology',
      currentYear: '2nd Year',
      enrolledAt: new Date('2023-01-22')
    }
  ],
  'course2': [
    {
      studentId: 'student3',
      studentName: 'Michael Brown',
      studentEmail: 'michael.brown@example.com',
      program: 'Computer Engineering',
      currentYear: '4th Year',
      enrolledAt: new Date('2023-02-15')
    },
    {
      studentId: 'student1',
      studentName: 'John Smith',
      studentEmail: 'john.smith@example.com',
      program: 'Computer Science',
      currentYear: '3rd Year',
      enrolledAt: new Date('2023-02-12')
    }
  ],
  'course3': [
    {
      studentId: 'student4',
      studentName: 'Sarah Davis',
      studentEmail: 'sarah.davis@example.com',
      program: 'Data Science',
      currentYear: '3rd Year',
      enrolledAt: new Date('2023-03-10')
    },
    {
      studentId: 'student2',
      studentName: 'Emily Johnson',
      studentEmail: 'emily.johnson@example.com',
      program: 'Information Technology',
      currentYear: '2nd Year',
      enrolledAt: new Date('2023-03-08')
    }
  ]
};

// Helper functions for API calls
const getTeacherCourses = async (token) => {
  try {
    const response = await axios.get(
      `${API_URLS.courses}/my-courses`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.success) {
      return response.data.data || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return [];
  }
};

const getCourseStudents = async (token, courseId) => {
  try {
    const response = await axios.get(
      `${API_URLS.courses}/${courseId}/students`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.success) {
      return response.data.data || [];
    }

    return [];
  } catch (error) {
    console.error(`Error fetching students for course ${courseId}:`, error);
    return [];
  }
};

const Students = ({ isDarkMode }) => {
  const auth = useAuth();
  const currentUser = auth ? auth.currentUser : null;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const [courseStudents, setCourseStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch courses and students data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, we would fetch from the API
        // For now, use mock data
        let coursesData = [];
        let studentsData = {};

        if (currentUser) {
          try {
            // Get token
            const token = await currentUser.getIdToken();

            // Fetch courses
            coursesData = await getTeacherCourses(token);

            // Fetch students for each course
            for (const course of coursesData) {
              const students = await getCourseStudents(token, course._id);
              studentsData[course._id] = students;
            }
          } catch (apiError) {
            console.error('API error:', apiError);
            // Fall back to mock data
            coursesData = mockCourses;
            studentsData = mockStudentsByCourse;
          }
        } else {
          // Use mock data if no user
          coursesData = mockCourses;
          studentsData = mockStudentsByCourse;
        }

        setCourses(coursesData);
        setCourseStudents(studentsData);

        // Initialize expanded state for all courses
        const initialExpandedState = {};
        coursesData.forEach(course => {
          initialExpandedState[course._id] = true; // Start with all expanded
        });
        setExpandedCourses(initialExpandedState);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load courses and students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Toggle course expansion
  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Get all students across all courses
  const getAllStudents = () => {
    const allStudents = [];
    Object.values(courseStudents).forEach(students => {
      students.forEach(student => {
        // Check if student already exists in the array
        const existingStudent = allStudents.find(s => s.studentId === student.studentId);
        if (!existingStudent) {
          allStudents.push(student);
        }
      });
    });
    return allStudents;
  };

  // Filter students based on search term and selected course
  const getFilteredStudents = () => {
    if (selectedCourse === 'all') {
      // Filter all students
      return getAllStudents().filter(student =>
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Filter students from the selected course
      return (courseStudents[selectedCourse] || []).filter(student =>
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const filteredStudents = getFilteredStudents();

  // Get courses for a specific student
  const getStudentCourses = (studentId) => {
    const studentCourses = [];
    courses.forEach(course => {
      const isEnrolled = courseStudents[course._id]?.some(student => student.studentId === studentId);
      if (isEnrolled) {
        studentCourses.push(course);
      }
    });
    return studentCourses;
  };

  // Define getPerformanceColor function
  const getPerformanceColor = (performance) => {
    if (!performance) return 'bg-gray-500';
    if (performance >= 90) return 'bg-green-500';
    if (performance >= 80) return 'bg-blue-500';
    if (performance >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Loading state
  if (loading) {
    return (
      <div className="students-section">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="students-section">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="students-section">
      {/* Course-wise Students View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <FaUserGraduate className="mr-2" /> My Students
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                className="px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-yellow-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-yellow-700 dark:text-yellow-300">
              You haven't created any courses yet. Create a course to see students enrolled in your courses.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* If a specific course is selected, show only that course */}
            {selectedCourse !== 'all' ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Course Header */}
                <div
                  className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleCourseExpansion(selectedCourse)}
                >
                  <div className="flex items-center">
                    <FaBook className="mr-2 text-blue-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {courses.find(c => c._id === selectedCourse)?.title || 'Unknown Course'}
                    </h3>
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      {courseStudents[selectedCourse]?.length || 0} students
                    </span>
                  </div>
                  {expandedCourses[selectedCourse] ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>

                {/* Students in this course */}
                {expandedCourses[selectedCourse] && (
                  <div className="p-4">
                    {courseStudents[selectedCourse]?.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No students enrolled in this course yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStudents.map((student) => (
                          <div
                            key={student.studentId}
                            className={`p-4 rounded-lg cursor-pointer transition-all ${
                              selectedStudent?.studentId === student.studentId
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <div className="flex items-center">
                              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {student.studentName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="ml-4">
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                  {student.studentName || 'Unknown Student'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {student.program || 'No program specified'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {student.studentEmail || 'No email available'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Show all courses */
              courses.map((course) => (
                <div key={course._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Course Header */}
                  <div
                    className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCourseExpansion(course._id)}
                  >
                    <div className="flex items-center">
                      <FaBook className="mr-2 text-blue-500" />
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {course.title}
                      </h3>
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        {courseStudents[course._id]?.length || 0} students
                      </span>
                    </div>
                    {expandedCourses[course._id] ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>

                  {/* Students in this course */}
                  {expandedCourses[course._id] && (
                    <div className="p-4">
                      {!courseStudents[course._id] || courseStudents[course._id].length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          No students enrolled in this course yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {courseStudents[course._id]
                            .filter(student =>
                              student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((student) => (
                              <div
                                key={`${course._id}-${student.studentId}`}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${
                                  selectedStudent?.studentId === student.studentId
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                onClick={() => setSelectedStudent(student)}
                              >
                                <div className="flex items-center">
                                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    {student.studentName?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  <div className="ml-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-white">
                                      {student.studentName || 'Unknown Student'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {student.program || 'No program specified'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {student.studentEmail || 'No email available'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* No students found message */}
        {selectedCourse === 'all' && getAllStudents().length === 0 && (
          <div className="text-center py-12 mt-6">
            <p className="text-gray-500 dark:text-gray-400">No students are enrolled in any of your courses yet.</p>
          </div>
        )}

        {/* Selected student details */}
        {selectedStudent && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {selectedStudent.studentName || 'Unknown Student'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Email:</span> {selectedStudent.studentEmail || 'No email available'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Program:</span> {selectedStudent.program || 'No program specified'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Year:</span> {selectedStudent.currentYear || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Enrolled Courses:</span>{' '}
                  {getStudentCourses(selectedStudent.studentId).map(course => course.title).join(', ') || 'None'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Joined:</span> {
                    selectedStudent.enrolledAt
                      ? new Date(selectedStudent.enrolledAt).toLocaleDateString()
                      : 'Unknown date'
                  }
                </p>
                <div className="mt-2">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                    onClick={() => {
                      // Handle message action
                      alert(`Messaging ${selectedStudent.studentName} is not implemented yet.`);
                    }}
                  >
                    Message
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Statistics */}
      {courses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Course Statistics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map(course => {
              const studentCount = courseStudents[course._id]?.length || 0;

              return (
                <div key={course._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">{course.title}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Enrolled Students</p>
                      <p className="text-2xl font-semibold text-gray-800 dark:text-white">{studentCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created On</p>
                      <p className="text-md font-semibold text-gray-800 dark:text-white">
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                        onClick={() => {
                          setSelectedCourse(course._id);
                        }}
                      >
                        View Students
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;