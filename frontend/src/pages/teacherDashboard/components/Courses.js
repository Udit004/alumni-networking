import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import CourseApplications from './CourseApplications';

const Courses = ({ isDarkMode, profileData }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'past', 'applications'
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    schedule: '',
    room: '',
    term: '',
    maxStudents: 50,
    status: 'active',
    startDate: '',
    endDate: '',
    nextClass: '',
    upcomingDeadline: {
      title: '',
      due: ''
    }
  });

  // Define base URLs for API endpoints
  const baseUrls = [
    process.env.REACT_APP_API_URL || 'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5000'
  ];

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch courses from API
  const fetchCourses = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching courses for user:', currentUser.uid);

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to connect to ${baseUrl}...`);
          const token = await currentUser.getIdToken();
          const response = await axios.get(
            `${baseUrl}/api/courses/teacher/${currentUser.uid}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log(`Response from ${baseUrl}:`, response.data);
          responseData = response.data;
          success = true;
          break; // Exit the loop if successful
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
        }
      }

      if (success && responseData.success) {
        setCourses(responseData.courses || []);
      } else if (success) {
        setError('Failed to fetch courses: ' + (responseData.message || 'Unknown error'));
        setCourses([]);
      } else {
        setError('Failed to connect to any server. Please check if the backend is running.');
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses: ' + (err.response?.data?.message || err.message || 'Please try again.'));
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new course
  const createCourse = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const token = await currentUser.getIdToken();
      const courseData = {
        ...formData,
        teacherName: profileData?.name || currentUser.displayName || 'Teacher',
        teacherId: currentUser.uid
      };

      console.log('Using teacher name:', profileData?.name || currentUser.displayName || 'Teacher');

      console.log('Sending course data:', courseData);

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to create course on ${baseUrl}...`);
          const response = await axios.post(
            `${baseUrl}/api/courses`,
            courseData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log(`Response from ${baseUrl}:`, response.data);
          responseData = response.data;
          success = true;
          break; // Exit the loop if successful
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
        }
      }

      if (success && responseData.success) {
        setCourses([...courses, responseData.course]);
        setShowModal(false);
        resetForm();
        alert('Course created successfully!');
      } else if (success) {
        setError('Failed to create course: ' + (responseData.message || 'Unknown error'));
      } else {
        setError('Failed to connect to any server. Please check if the backend is running.');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. ' + (err.response?.data?.message || err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Update an existing course
  const updateCourse = async () => {
    if (!currentUser || !editingCourse) return;

    try {
      setLoading(true);
      setError(null);

      const token = await currentUser.getIdToken();

      // Ensure the teacher name is preserved when updating
      const updateData = {
        ...formData,
        teacherName: editingCourse.teacherName || profileData?.name || currentUser.displayName || 'Teacher',
        teacherId: currentUser.uid
      };

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to update course on ${baseUrl}...`);
          const response = await axios.put(
            `${baseUrl}/api/courses/${editingCourse._id}`,
            updateData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log(`Response from ${baseUrl}:`, response.data);
          responseData = response.data;
          success = true;
          break; // Exit the loop if successful
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
        }
      }

      if (success && responseData.success) {
        setCourses(courses.map(course =>
          course._id === editingCourse._id ? responseData.course : course
        ));
        setShowModal(false);
        setEditingCourse(null);
        resetForm();
        alert('Course updated successfully!');
      } else if (success) {
        setError('Failed to update course: ' + (responseData.message || 'Unknown error'));
      } else {
        setError('Failed to connect to any server. Please check if the backend is running.');
      }
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course. ' + (err.response?.data?.message || err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Delete a course
  const deleteCourse = async (courseId) => {
    if (!currentUser) return;

    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await currentUser.getIdToken();

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to delete course on ${baseUrl}...`);
          const response = await axios.delete(
            `${baseUrl}/api/courses/${courseId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log(`Response from ${baseUrl}:`, response.data);
          responseData = response.data;
          success = true;
          break; // Exit the loop if successful
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
        }
      }

      if (success && responseData.success) {
        setCourses(courses.filter(course => course._id !== courseId));
        alert('Course deleted successfully!');
      } else if (success) {
        setError('Failed to delete course: ' + (responseData.message || 'Unknown error'));
      } else {
        setError('Failed to connect to any server. Please check if the backend is running.');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. ' + (err.response?.data?.message || err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      description: '',
      schedule: '',
      room: '',
      term: '',
      maxStudents: 50,
      status: 'active',
      startDate: '',
      endDate: '',
      nextClass: '',
      upcomingDeadline: {
        title: '',
        due: ''
      }
    });
  };

  // Open modal for creating a new course
  const handleCreateCourse = () => {
    setEditingCourse(null);
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing an existing course
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      courseId: course.courseId || '',
      title: course.title || '',
      description: course.description || '',
      schedule: course.schedule || '',
      room: course.room || '',
      term: course.term || '',
      maxStudents: course.maxStudents || 50,
      status: course.status || 'active',
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
      nextClass: course.nextClass ? new Date(course.nextClass).toISOString().split('T')[0] + 'T' + new Date(course.nextClass).toISOString().split('T')[1].substring(0, 5) : '',
      upcomingDeadline: {
        title: course.upcomingDeadline?.title || '',
        due: course.upcomingDeadline?.due ? new Date(course.upcomingDeadline.due).toISOString().split('T')[0] + 'T' + new Date(course.upcomingDeadline.due).toISOString().split('T')[1].substring(0, 5) : ''
      }
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse();
    } else {
      createCourse();
    }
  };

  // Filter active courses
  const activeCourses = courses.filter(course =>
    course.status === 'active' || course.status === 'upcoming'
  );

  // Filter past courses
  const pastCourses = courses.filter(course =>
    course.status === 'completed'
  );

  // Filter courses based on search term
  const filteredActiveCourses = activeCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPastCourses = pastCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = (dateString) => {
    if (!dateString) return 0;
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <button
              className={`px-4 py-2 rounded-md transition ${activeTab === 'applications' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('applications')}
            >
              Applications
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

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Course cards */}
      {activeTab === 'applications' ? (
        <CourseApplications isDarkMode={isDarkMode} profileData={profileData} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          {activeTab === 'active' ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Active Courses</h2>

            {!loading && filteredActiveCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No active courses found matching your search.</p>
                <button
                  onClick={handleCreateCourse}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActiveCourses.map(course => (
                  <div key={course._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="h-32 overflow-hidden relative">
                      <img
                        src={course.thumbnail || `https://source.unsplash.com/random/800x600/?course=${course.title}`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-4 text-white">
                          <h3 className="text-lg font-bold">{course.courseId}</h3>
                          <p>{course.title}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {course.students?.length || 0} Students
                        </span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {course.progress || 0}% Complete
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-4">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                      </div>

                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-start">
                          <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{course.schedule || 'Not scheduled'}</span>
                        </div>
                        <div className="flex items-start">
                          <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{course.room || 'Room not assigned'}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Class:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(course.nextClass)}</span>
                          </div>

                          {course.upcomingDeadline?.title && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upcoming:</span>
                              <div className="flex justify-between items-center mt-1 bg-orange-50 dark:bg-gray-600/50 p-2 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{course.upcomingDeadline.title}</span>
                                <span className={`text-sm font-medium ${getDaysRemaining(course.upcomingDeadline.due) <= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {getDaysRemaining(course.upcomingDeadline.due)} days left
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex-1"
                          onClick={() => window.open(`/course/${course._id}`, '_blank')}
                        >
                          Course Page
                        </button>
                        <button
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-1"
                          onClick={() => handleEditCourse(course)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 text-sm rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => deleteCourse(course._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

            {!loading && filteredPastCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No past courses found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPastCourses.map(course => (
                  <div key={course._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="h-24 overflow-hidden relative">
                      <img
                        src={course.thumbnail || `https://source.unsplash.com/random/800x600/?course=${course.title}`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-3 text-white">
                          <h3 className="text-sm font-bold">{course.courseId}</h3>
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
                          <span>{course.students?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dates:</span>
                          <span>{course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'} - {course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button
                          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          onClick={() => deleteCourse(course._id)}
                        >
                          Delete
                        </button>
                        <button
                          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          onClick={() => window.open(`/course/${course._id}`, '_blank')}
                        >
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
      )}

      {/* Course Analytics */}
      {activeTab === 'active' && filteredActiveCourses.length > 0 && !loading && (
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

      {/* Course Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course ID</label>
                  <input
                    type="text"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., CS101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Course description"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule</label>
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Mon, Wed 10:00 - 11:30 AM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Engineering 301"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Term</label>
                  <input
                    type="text"
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Fall 2023"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Students</label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Class</label>
                  <input
                    type="datetime-local"
                    name="nextClass"
                    value={formData.nextClass}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upcoming Deadline Title</label>
                  <input
                    type="text"
                    name="upcomingDeadline.title"
                    value={formData.upcomingDeadline.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Assignment 1: Introduction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline Date</label>
                  <input
                    type="datetime-local"
                    name="upcomingDeadline.due"
                    value={formData.upcomingDeadline.due}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;