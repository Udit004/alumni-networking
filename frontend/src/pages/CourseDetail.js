import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CourseAnnouncements from '../components/CourseAnnouncements';
import AnnouncementCreation from '../components/AnnouncementCreation';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    fetchCourse();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch course materials when the course is loaded and the user is enrolled
  useEffect(() => {
    if (course && currentUser && isEnrolled()) {
      fetchCourseMaterials();
    }
  }, [course, currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourse = async () => {
    try {
      setLoading(true);

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to fetch course from ${baseUrl}...`);
          const response = await axios.get(`${baseUrl}/api/courses/${id}`);
          console.log(`Response from ${baseUrl}:`, response.data);
          responseData = response.data;
          success = true;
          break; // Exit the loop if successful
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
        }
      }

      if (success && responseData.success) {
        setCourse(responseData.course);
      } else {
        setError('Failed to fetch course details. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const enrollInCourse = async () => {
    if (!currentUser) {
      alert('Please log in to enroll in this course');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const studentData = {
        studentId: currentUser.uid,
        studentName: currentUser.displayName || userData?.name || 'Student'
      };

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to enroll in course on ${baseUrl}...`);
          const response = await axios.post(
            `${baseUrl}/api/courses/${id}/enroll`,
            studentData,
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
        alert('Successfully enrolled in the course!');
        fetchCourse(); // Refresh the course details
      } else {
        alert(responseData?.message || 'Failed to enroll in the course. Please try again.');
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in the course. Please try again.');
    }
  };

  const unenrollFromCourse = async () => {
    if (!currentUser) {
      alert('Please log in to unenroll from this course');
      return;
    }

    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const studentData = {
        studentId: currentUser.uid
      };

      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to unenroll from course on ${baseUrl}...`);
          const response = await axios.post(
            `${baseUrl}/api/courses/${id}/unenroll`,
            studentData,
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
        alert('Successfully unenrolled from the course!');
        fetchCourse(); // Refresh the course details
      } else {
        alert(responseData?.message || 'Failed to unenroll from the course. Please try again.');
      }
    } catch (err) {
      console.error('Error unenrolling from course:', err);
      alert('Failed to unenroll from the course. Please try again.');
    }
  };

  // Fetch course materials directly from the API
  const fetchCourseMaterials = async () => {
    if (!currentUser || !course || !id) return;

    try {
      const token = await currentUser.getIdToken();
      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to fetch materials from ${baseUrl} for course ${id}...`);
          const response = await axios.get(
            `${baseUrl}/api/materials/student/course/${id}`,
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
        setCourse(prevCourse => ({
          ...prevCourse,
          materials: responseData.materials
        }));
      }
    } catch (err) {
      console.error('Error fetching course materials:', err);
    }
  };

  const isEnrolled = () => {
    if (!currentUser || !course) return false;
    return course.students?.some(student => student.studentId === currentUser.uid);
  };

  const isFull = () => {
    if (!course) return false;
    return course.students?.length >= course.maxStudents;
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Error Loading Course</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/mentorship')}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Course Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/mentorship')}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Course Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div
          className="h-64 bg-blue-500 relative"
          style={{
            backgroundImage: `url(${course.thumbnail || 'https://via.placeholder.com/1200x400?text=Course+Banner'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-8 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full mb-4 ${
                    course.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : course.status === 'upcoming'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
                  <p className="text-xl text-white opacity-90">Instructor: {course.teacherName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <span className="text-lg mr-2">📅</span>
              <div>
                <p className="font-medium">Dates</p>
                <p>{formatDate(course.startDate)} - {formatDate(course.endDate)}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <span className="text-lg mr-2">🕒</span>
              <div>
                <p className="font-medium">Schedule</p>
                <p>{course.schedule}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <span className="text-lg mr-2">📍</span>
              <div>
                <p className="font-medium">Location</p>
                <p>{course.room}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <span className="text-lg mr-2">👥</span>
              <div>
                <p className="font-medium">Enrollment</p>
                <p>
                  {course.students?.length || 0}/{course.maxStudents} students
                  {isFull() && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                      Full
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <span className="text-lg mr-2">🏫</span>
              <div>
                <p className="font-medium">Term</p>
                <p>{course.term || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Enrollment Actions */}
          {currentUser && role === 'student' && (
            <div className="mb-8">
              {isEnrolled() ? (
                <div className="flex items-center">
                  <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg mr-4">
                    ✓ You are enrolled in this course
                  </span>
                  <button
                    onClick={unenrollFromCourse}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Unenroll
                  </button>
                </div>
              ) : course.status === 'completed' ? (
                <button
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Course Completed
                </button>
              ) : isFull() ? (
                <button
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Course Full
                </button>
              ) : (
                <button
                  onClick={enrollInCourse}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Enroll in this Course
                </button>
              )}
            </div>
          )}

          {/* Teacher Actions */}
          {currentUser && (role === 'teacher' || role === 'admin') && course.teacherId === currentUser.uid && (
            <div className="mb-8">
              <button
                onClick={() => navigate('/teacher-dashboard')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mr-4"
              >
                Manage Course
              </button>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Description</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {course.description}
              </p>
            </div>
          </div>

          {course.prerequisites && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prerequisites</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {course.prerequisites}
                </p>
              </div>
            </div>
          )}

          {isEnrolled() && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Materials</h2>
                <button
                  onClick={fetchCourseMaterials}
                  className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="Refresh materials"
                >
                  🔄
                </button>
              </div>
              {course.materials && course.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.materials.map((material) => (
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
                    {material.link && !material.fileUrl && (
                      <a
                        href={material.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Material →
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
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No materials available for this course yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Announcements Section */}
          {(isEnrolled() || (currentUser && course.teacherId === currentUser.uid)) && (
            <div className="mb-8">
              {/* Teacher can create announcements */}
              {currentUser && course.teacherId === currentUser.uid && (
                <AnnouncementCreation
                  courseId={id}
                  onAnnouncementCreated={() => {
                    // This will be called after a new announcement is created
                    // We could refresh the announcements list here if needed
                  }}
                />
              )}

              {/* Display announcements */}
              <CourseAnnouncements
                courseId={id}
                isTeacher={currentUser && course.teacherId === currentUser.uid}
              />
            </div>
          )}

          {/* Classmates Section */}
          {isEnrolled() && course.students && course.students.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Classmates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {course.students.map((student) => (
                  <div key={student.studentId} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                      {student.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.studentName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enrolled on {formatDate(student.enrolledAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={() => navigate('/mentorship')}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
        >
          Back to Courses
        </button>
      </div>
    </div>
  );
};

export default CourseDetail;
