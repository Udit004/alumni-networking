import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CourseEnrollmentForm from '../components/CourseEnrollmentForm';

const MentorshipCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [term, setTerm] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  // Removed viewMode state since it's now handled in student dashboard
  const { currentUser, userData, role } = useAuth();
  const navigate = useNavigate();

  // Define base URLs for API endpoints to handle different ports
  const baseUrls = [
    process.env.REACT_APP_API_URL || 'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5003',
    'http://localhost:5004',
    'http://localhost:5000'
  ];

  useEffect(() => {
    fetchCourses();
  }, [currentUser, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourses = async () => {
    try {
      setLoading(true);

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to fetch courses from ${baseUrl}...`);
          const response = await axios.get(`${baseUrl}/api/courses`);
          console.log(`Response from ${baseUrl}:`, response.data);
          responseData = response.data;
          success = true;
          break; // Exit the loop if successful
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
        }
      }

      if (success && responseData.success) {
        // Filter active and upcoming courses and sort by date
        const availableCourses = responseData.courses?.filter(c =>
          c.status === 'active' || c.status === 'upcoming'
        ) || [];

        const sortedCourses = availableCourses.sort((a, b) =>
          new Date(a.startDate) - new Date(b.startDate)
        );

        setCourses(sortedCourses);
      } else {
        setError('Failed to fetch courses. Please try again.');
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchEnrolledCourses function since it's now handled in student dashboard

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const enrollInCourse = (course) => {
    if (!currentUser) {
      alert('Please log in to enroll in a course');
      return;
    }

    if (role !== 'student') {
      alert('Only students can enroll in courses');
      return;
    }

    // Show the enrollment form instead of directly enrolling
    setSelectedCourse(course);
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentSuccess = () => {
    setShowEnrollmentForm(false);
    setSelectedCourse(null);
    fetchCourses(); // Refresh the courses list
  };

  const isEnrolled = (course) => {
    return course.students?.some(student => student.studentId === currentUser?.uid);
  };

  const isFull = (course) => {
    return course.students?.length >= course.maxStudents;
  };

  // Use the courses list directly
  const courseList = courses;

  const filteredCourses = courseList.filter((course) => {
    // Search filter
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(search.toLowerCase());

    // Term filter
    let matchesTerm = true;
    if (term !== 'all') {
      matchesTerm = course.term === term;
    }

    // Status filter
    let matchesStatus = true;
    if (filter !== 'all') {
      matchesStatus = course.status === filter;
    }

    return matchesSearch && matchesTerm && matchesStatus;
  });

  return (
    <div className="courses-section">
      <div className="hero-section mentorship-hero text-center py-16 px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Explore Courses</h1>
        <p className="text-xl text-white mb-8">Discover and enroll in courses taught by our teachers</p>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
          </div>

          <button
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={fetchCourses}
          >
            <span>Search</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
              Available Courses
            </h2>
            {currentUser && role === 'student' && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View your enrolled courses in the <a href="/student-dashboard" className="text-blue-500 hover:underline">Student Dashboard</a>
              </p>
            )}
          </div>

          {currentUser && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/${role.toLowerCase()}-dashboard`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>My Dashboard</span>
              </button>

              {/* Allow teachers to create courses */}
              {role === 'teacher' && (
                <button
                  onClick={() => navigate('/teacher-dashboard')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>Manage Courses</span> <span>➕</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <div className="md:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Filters</h3>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Status</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={filter === 'all'}
                      onChange={() => setFilter('all')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">All Courses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={filter === 'active'}
                      onChange={() => setFilter('active')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Active Courses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={filter === 'upcoming'}
                      onChange={() => setFilter('upcoming')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Upcoming Courses</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Term</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="term"
                      checked={term === 'all'}
                      onChange={() => setTerm('all')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">All Terms</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="term"
                      checked={term === 'Spring 2023'}
                      onChange={() => setTerm('Spring 2023')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Spring 2023</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="term"
                      checked={term === 'Fall 2023'}
                      onChange={() => setTerm('Fall 2023')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Fall 2023</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="term"
                      checked={term === 'Spring 2024'}
                      onChange={() => setTerm('Spring 2024')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Spring 2024</span>
                  </label>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setTerm('all');
                    setFilter('all');
                    setSearch('');
                  }}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Course Listings */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">Loading courses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error loading courses</h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {search || term !== 'all' || filter !== 'all'
                    ? "Try adjusting your search criteria"
                    : "No courses have been posted yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div
                      className="h-48 bg-blue-500 relative"
                      style={{
                        backgroundImage: `url(${course.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute top-2 right-2">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          course.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {course.status === 'active' ? 'Active' : 'Upcoming'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Instructor: {course.teacherName}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="text-sm mr-2">📅</span>
                          <span className="text-sm">{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                        </div>

                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="text-sm mr-2">🕒</span>
                          <span className="text-sm">{course.schedule}</span>
                        </div>

                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="text-sm mr-2">📍</span>
                          <span className="text-sm">{course.room}</span>
                        </div>

                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="text-sm mr-2">👥</span>
                          <span className="text-sm">
                            {course.students?.length || 0}/{course.maxStudents} students enrolled
                            {isFull(course) && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                Full
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => navigate(`/course/${course._id}`)}
                          className="inline-block px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                        >
                          View Details
                        </button>

                        {/* Enrollment button for students */}
                        {currentUser && role === 'student' && (
                          isEnrolled(course) ? (
                            <button
                              className="inline-block ml-3 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg cursor-default"
                              disabled
                            >
                              Enrolled
                            </button>
                          ) : course.status === 'completed' ? (
                            <button
                              className="inline-block ml-3 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                              disabled
                            >
                              Course Completed
                            </button>
                          ) : isFull(course) ? (
                            <button
                              className="inline-block ml-3 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                              disabled
                            >
                              Course Full
                            </button>
                          ) : (
                            <button
                              className="inline-block ml-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              onClick={() => enrollInCourse(course)}
                            >
                              Apply for Course
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredCourses.length > 0 && filteredCourses.length < courseList.length && (
              <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                Showing {filteredCourses.length} of {courseList.length} courses
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Enrollment Application Form */}
      {showEnrollmentForm && selectedCourse && (
        <CourseEnrollmentForm
          course={selectedCourse}
          onClose={() => {
            setShowEnrollmentForm(false);
            setSelectedCourse(null);
          }}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
};

export default MentorshipCourses;
