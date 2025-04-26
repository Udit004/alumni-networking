import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { API_URLS, DEFAULT_TIMEOUT } from '../../../config/apiConfig';

const Announcements = ({ isDarkMode }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!currentUser) return;

      try {
        setCourseLoading(true);
        console.log('Fetching enrolled courses...');

        const token = await currentUser.getIdToken();
        const response = await axios.get(
          `${API_URLS.courses}/student/${currentUser.uid}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: DEFAULT_TIMEOUT
          }
        );

        console.log('Enrolled courses response:', response.data);

        if (response.data && response.data.success) {
          const courses = response.data.courses || [];
          setEnrolledCourses(courses);

          // If there are courses, select the first one by default
          if (courses.length > 0) {
            setSelectedCourse(courses[0]._id);
          }
        } else {
          setEnrolledCourses([]);
        }
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setEnrolledCourses([]);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [currentUser]);

  // Fetch announcements when selected course changes
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!selectedCourse) {
        setAnnouncements([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const course = enrolledCourses.find(c => c._id === selectedCourse);
        console.log(`Fetching announcements for course ${selectedCourse} (${course?.title})...`);

        const token = await currentUser.getIdToken();

        // Log the URL for debugging
        const url = `${API_URLS.main}/api/courses/${selectedCourse}/announcements`;
        console.log('Fetching announcements from URL:', url);

        const response = await axios.get(
          url,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: DEFAULT_TIMEOUT
          }
        );

        console.log(`Announcements response for course ${selectedCourse}:`, response.data);

        if (Array.isArray(response.data)) {
          // Add course info to each announcement
          const announcementsWithCourseInfo = response.data.map(announcement => ({
            ...announcement,
            courseName: course?.title || 'Unknown Course',
            courseId: selectedCourse
          }));

          setAnnouncements(announcementsWithCourseInfo);
        } else {
          console.warn('Unexpected response format:', response.data);
          setAnnouncements([]);
        }
      } catch (err) {
        console.error(`Error fetching announcements for course ${selectedCourse}:`, err);
        setError('Failed to load announcements. Please try again later.');
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [selectedCourse, enrolledCourses, currentUser]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle course selection change
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  if (courseLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Course Announcements</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">Important messages and updates from your course instructors</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Enrolled Courses</h3>
          <p className="text-gray-600 dark:text-gray-300">You are not enrolled in any courses yet. Enroll in courses to receive announcements from instructors.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Course:
            </label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {enrolledCourses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">No announcements available for this course.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-blue-500 overflow-hidden transition-transform hover:translate-y-[-2px] hover:shadow-lg">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{announcement.title}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{formatDate(announcement.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 italic">
                      Posted by: {announcement.createdByName === 'dev@example.com' ? 'Instructor' : announcement.createdByName || 'Instructor'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Announcements;
