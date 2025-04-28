import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Courses = ({ isDarkMode }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
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
    fetchEnrolledCourses();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEnrolledCourses = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to fetch enrolled courses from ${baseUrl}...`);
          const response = await axios.get(
            `${baseUrl}/api/courses/student/${currentUser.uid}`,
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
        // Process the courses data
        const enrolledCourses = responseData.courses.map(course => ({
          ...course,
          // Add default values for fields that might not be in the MongoDB data
          progress: course.progress || calculateProgress(course),
          status: determineStatus(course),
          enrollmentDate: course.students?.find(s => s.studentId === currentUser.uid)?.enrolledAt || new Date(),
          grade: course.grade || 'N/A'
        }));

        setCourses(enrolledCourses);
        setError(null);
      } else {
        console.error('Failed to fetch enrolled courses:', responseData?.message);
        setError('Failed to load courses. Please try again later.');
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError('Failed to load courses. Please try again later.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate progress based on course dates
  const calculateProgress = (course) => {
    if (!course.startDate || !course.endDate) return 0;

    const start = new Date(course.startDate);
    const end = new Date(course.endDate);
    const now = new Date();

    if (now < start) return 0;
    if (now > end) return 100;

    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  // Helper function to determine course status
  const determineStatus = (course) => {
    if (!course.startDate || !course.endDate) return 'upcoming';

    const start = new Date(course.startDate);
    const end = new Date(course.endDate);
    const now = new Date();

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      (course.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === 'current') {
      return matchesSearch && course.status === 'active';
    } else if (activeTab === 'completed') {
      return matchesSearch && course.status === 'completed';
    } else if (activeTab === 'upcoming') {
      return matchesSearch && course.status === 'upcoming';
    }

    return matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCourseStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Current';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Function to handle materials button click
  const handleMaterialsClick = async (e, course) => {
    e.stopPropagation(); // Prevent triggering the card's click event

    try {
      setLoading(true);
      const token = await currentUser.getIdToken();

      // Try to fetch the latest materials for this course
      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to fetch materials from ${baseUrl} for course ${course._id}...`);
          const response = await axios.get(
            `${baseUrl}/api/materials/student/course/${course._id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log(`Materials response from ${baseUrl}:`, response.data);
          responseData = response.data;
          success = true;
          break; // Exit the loop if successful
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl} for materials:`, err.message);
        }
      }

      if (success && responseData.success) {
        // Update the course with the latest materials
        const updatedCourse = {
          ...course,
          materials: responseData.materials
        };

        // Update the course in the courses array
        setCourses(prevCourses =>
          prevCourses.map(c => c._id === course._id ? updatedCourse : c)
        );

        // Set the selected course with updated materials
        setSelectedCourse(updatedCourse);
      } else {
        // If API call fails, use the materials from the course object
        setSelectedCourse(course);
        console.warn('Could not fetch latest materials, using cached data');
      }
    } catch (error) {
      console.error('Error fetching course materials:', error);
      // Still show the modal with whatever materials are in the course object
      setSelectedCourse(course);
    } finally {
      setLoading(false);
      setShowMaterialsModal(true);
    }
  };

  // Function to close the materials modal
  const handleCloseModal = () => {
    setShowMaterialsModal(false);
    setSelectedCourse(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Courses</h2>
          <button
            onClick={fetchEnrolledCourses}
            className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            title="Refresh courses"
          >
            🔄
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'current'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setActiveTab('current')}
              >
                Current
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </button>
            </div>
          </div>
        </div>

        {/* Materials Modal */}
        {showMaterialsModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
                 style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCourse.title} - Course Materials
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {loading ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading course materials...</p>
                </div>
              ) : selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCourse.materials.map((material) => (
                    <div key={material.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{material.icon || '📄'}</span>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{material.title}</h3>
                      </div>
                      {material.description && (
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{material.description}</p>
                      )}
                      {material.fileUrl && (
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <span className="mr-1">Download {material.fileName || 'Material'}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                        </a>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {material.createdAt && (
                          <span>Added: {new Date(material.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No materials available for this course.</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    handleCloseModal();
                    navigate(`/course/${selectedCourse._id}`);
                  }}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Go to Course Page
                </button>
                <button
                  onClick={handleCloseModal}
                  className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Cards Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
              style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your courses...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {searchTerm
                  ? "No courses match your search"
                  : activeTab === 'all'
                    ? "You are not enrolled in any courses yet"
                    : `You don't have any ${activeTab} courses`
                }
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Enroll in courses from the Courses section in the Mentorship page"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <div
                    className="h-32 bg-blue-500 flex items-center justify-center"
                    style={{
                      backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!course.thumbnail && (
                      <span className="text-white text-xl font-bold">
                        {course.courseCode || course.title?.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{course.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(course.status)}`}>
                        {getCourseStatusText(course.status)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {course.courseCode || 'No Code'} • {course.teacherName || 'Instructor'}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                    </p>

                    {course.status === 'active' && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-between">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {course.status === 'completed' && (
                      <div className="mt-3 flex items-center">
                        <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">Final Grade:</span>
                        <span className="font-bold text-gray-800 dark:text-white">{course.grade}</span>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${course._id}`);
                        }}
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        {course.status === 'active' ? 'Go to Course' :
                         course.status === 'completed' ? 'View Details' :
                         'View Syllabus'}
                      </button>

                      {course.materials && course.materials.length > 0 && (
                        <button
                          onClick={(e) => handleMaterialsClick(e, course)}
                          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          Materials ({course.materials.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;