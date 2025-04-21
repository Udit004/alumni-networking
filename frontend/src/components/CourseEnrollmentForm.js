import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CourseEnrollmentForm = ({ course, onClose, onSuccess }) => {
  const { currentUser, userData } = useAuth();
  const [formData, setFormData] = useState({
    reason: '',
    experience: '',
    expectations: '',
    commitment: 'Yes'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Define base URLs for API endpoints to handle different ports
  const baseUrls = [
    process.env.REACT_APP_API_URL || 'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5003',
    'http://localhost:5004',
    'http://localhost:5000'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('You must be logged in to apply for a course');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const applicationData = {
        // Course info
        courseId: course._id,
        courseName: course.title,

        // Student info - this will be overridden by the backend for security
        // but we include it for completeness
        studentId: currentUser.uid,
        studentName: currentUser.displayName || userData?.name || 'Student',
        studentEmail: currentUser.email,

        // Teacher info
        teacherId: course.teacherId,
        teacherName: course.teacherName,

        // Application details
        status: 'pending',
        reason: formData.reason,
        experience: formData.experience,
        expectations: formData.expectations,
        commitment: formData.commitment,
        appliedAt: new Date().toISOString()
      };

      console.log('Submitting application with data:', applicationData);

      const token = await currentUser.getIdToken();
      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to submit course application on ${baseUrl}...`);
          const response = await axios.post(
            `${baseUrl}/api/course-applications/${course._id}`,
            applicationData,
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
          if (err.response) {
            console.log('Error response data:', err.response.data);
          }
        }
      }

      if (success && responseData.success) {
        onSuccess();
      } else {
        setError(responseData?.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting course application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Apply for Course: {course.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please complete this form to apply for enrollment in this course. Your application will be reviewed by the instructor.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Why do you want to take this course? *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
                placeholder="Explain your interest in this course..."
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Do you have any prior experience in this subject? *
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
                placeholder="Describe any relevant experience..."
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                What do you hope to learn from this course? *
              </label>
              <textarea
                name="expectations"
                value={formData.expectations}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
                placeholder="Share your learning goals..."
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Can you commit to attending all scheduled sessions? *
              </label>
              <select
                name="commitment"
                value={formData.commitment}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Yes">Yes, I can attend all sessions</option>
                <option value="Most">I can attend most sessions</option>
                <option value="Some">I might miss some sessions</option>
                <option value="No">No, I have scheduling conflicts</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentForm;
