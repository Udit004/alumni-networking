import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URLS, DEFAULT_TIMEOUT } from '../config/apiConfig';

const AnnouncementCreation = ({ courseId, onAnnouncementCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = await currentUser.getIdToken();

      // Log the URL for debugging
      const url = `${API_URLS.main}/api/courses/${courseId}/announcements`;
      console.log('Creating announcement at URL:', url);

      const response = await axios.post(
        url,
        { title, content },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: DEFAULT_TIMEOUT
        }
      );

      console.log('Announcement creation response:', response.data);

      if (response.data && response.data.success) {
        setSuccess('Announcement created successfully');
        setTitle('');
        setContent('');

        // Notify parent component to refresh announcements
        if (onAnnouncementCreated) {
          onAnnouncementCreated(response.data.announcement);
        }
      } else {
        setError('Failed to create announcement');
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError(`Failed to create announcement: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Create New Announcement</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Announcement Title"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Announcement content..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Announcement'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
};

export default AnnouncementCreation;
