import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { API_URLS, DEFAULT_TIMEOUT } from '../../../config/apiConfig';
import AnnouncementCreation from '../../../components/AnnouncementCreation';

const Announcements = ({ isDarkMode }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch teacher's courses
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!currentUser) return;

      try {
        setCourseLoading(true);
        console.log('Fetching teacher courses...');

        const token = await currentUser.getIdToken();
        const response = await axios.get(
          `${API_URLS.courses}/teacher/${currentUser.uid}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: DEFAULT_TIMEOUT
          }
        );

        console.log('Teacher courses response:', response.data);

        if (response.data && response.data.success) {
          const teacherCourses = response.data.courses || [];
          setCourses(teacherCourses);

          // If there are courses, select the first one by default
          if (teacherCourses.length > 0) {
            setSelectedCourse(teacherCourses[0]._id);
          }
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error('Error fetching teacher courses:', err);
        setCourses([]);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchTeacherCourses();
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

        const course = courses.find(c => c._id === selectedCourse);
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
  }, [selectedCourse, courses, refreshTrigger, currentUser]);

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

  // Handle announcement creation
  const handleAnnouncementCreated = () => {
    // Trigger a refresh of the announcements list
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle announcement deletion
  const handleDeleteAnnouncement = async (announcementId) => {
    if (!currentUser || !announcementId) return;

    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setLoading(true);
      const token = await currentUser.getIdToken();

      // Log the URL for debugging
      const url = `${API_URLS.main}/api/announcements/${announcementId}`;
      console.log('Deleting announcement at URL:', url);

      const response = await axios.delete(
        url,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: DEFAULT_TIMEOUT
        }
      );

      console.log('Delete announcement response:', response.data);

      if (response.data && response.data.success) {
        // Remove the deleted announcement from the list
        setAnnouncements(prev => prev.filter(a => a._id !== announcementId));
        alert('Announcement deleted successfully');
      } else {
        alert('Failed to delete announcement');
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert(`Failed to delete announcement: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
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
        <p className="text-lg text-gray-600 dark:text-gray-300">Create and manage announcements for your courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Courses Found</h3>
          <p className="text-gray-600 dark:text-gray-300">You don't have any courses yet. Create a course to start making announcements.</p>
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
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <AnnouncementCreation
              courseId={selectedCourse}
              onAnnouncementCreated={handleAnnouncementCreated}
            />
          )}

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Existing Announcements</h3>

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
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">{formatDate(announcement.createdAt)}</span>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement._id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400 italic">
                        Posted by: {announcement.createdByName === 'dev@example.com' ? 'You' : announcement.createdByName || 'You'}
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
          </div>
        </>
      )}
    </div>
  );
};

export default Announcements;
