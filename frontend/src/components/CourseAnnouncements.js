import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS, DEFAULT_TIMEOUT } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';

const CourseAnnouncements = ({ courseId, isTeacher = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch announcements for the course
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!courseId) {
        setAnnouncements([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching announcements for course ${courseId}...`);

        const token = await currentUser.getIdToken();

        // Log the URL for debugging
        const url = `${API_URLS.main}/api/courses/${courseId}/announcements`;
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

        console.log(`Announcements response for course ${courseId}:`, response.data);

        if (Array.isArray(response.data)) {
          setAnnouncements(response.data);
        } else {
          console.warn('Unexpected response format:', response.data);
          setAnnouncements([]);
        }
      } catch (err) {
        console.error(`Error fetching announcements for course ${courseId}:`, err);
        setError('Failed to load announcements. Please try again later.');
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [courseId, currentUser]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Announcements</h3>
        <p className="text-gray-600 dark:text-gray-400">Important messages and updates from your instructor</p>
      </div>

      {announcements.length === 0 ? (
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
    </div>
  );
};

export default CourseAnnouncements;
