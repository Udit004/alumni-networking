import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const CourseApplications = ({ isDarkMode, profileData }) => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Define base URLs for API endpoints to handle different ports
  const baseUrls = [
    process.env.REACT_APP_API_URL || 'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5003',
    'http://localhost:5004',
    'http://localhost:5000'
  ];

  useEffect(() => {
    fetchApplications();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApplications = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to fetch applications from ${baseUrl}...`);
          const response = await axios.get(
            `${baseUrl}/api/course-applications/teacher`,
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
        setApplications(responseData.applications || []);
        setError(null);
      } else {
        console.error('Failed to fetch applications:', responseData?.message);
        setError('Failed to load applications. Please try again later.');
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = (application) => {
    setSelectedApplication(application);
    setReviewNotes('');
  };

  const handleCloseReview = () => {
    setSelectedApplication(null);
    setReviewNotes('');
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    if (!currentUser) return;

    setProcessingId(applicationId);
    try {
      const token = await currentUser.getIdToken();
      let success = false;
      let responseData = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to update application status on ${baseUrl}...`);
          const response = await axios.put(
            `${baseUrl}/api/course-applications/${applicationId}`,
            {
              status: newStatus,
              reviewNotes: reviewNotes
            },
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
        // Update the local state
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app._id === applicationId
              ? { ...app, status: newStatus, reviewNotes, reviewedAt: new Date() }
              : app
          )
        );

        setSelectedApplication(null);
        setReviewNotes('');

        // Show success message
        alert(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert(responseData?.message || `Failed to ${newStatus} application. Please try again.`);
      }
    } catch (err) {
      console.error(`Error ${newStatus}ing application:`, err);
      alert(`Failed to ${newStatus} application. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Course Applications</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchApplications}
            className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            title="Refresh applications"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading applications...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error loading applications</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No {filter !== 'all' ? filter : ''} applications found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'pending'
              ? "You don't have any pending applications to review"
              : filter === 'approved'
              ? "You haven't approved any applications yet"
              : filter === 'rejected'
              ? "You haven't rejected any applications yet"
              : "You don't have any course applications"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Applied On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.map((application) => (
                <tr key={application._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{application.studentName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{application.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{application.courseName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(application.appliedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : application.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {application.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewApplication(application)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          disabled={processingId === application._id}
                        >
                          Review
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReviewApplication(application)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Application Review
                </h2>
                <button
                  onClick={handleCloseReview}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Student Information</h3>
                  <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Name:</span> {selectedApplication.studentName}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Email:</span> {selectedApplication.studentEmail}</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Applied On:</span> {formatDate(selectedApplication.appliedAt)}</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedApplication.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : selectedApplication.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Course Information</h3>
                  <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Course:</span> {selectedApplication.courseName}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Application Details</h3>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Why do you want to take this course?</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedApplication.reason}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Prior experience in this subject:</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedApplication.experience}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">What do you hope to learn from this course?</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedApplication.expectations}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Commitment to attending sessions:</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedApplication.commitment}</p>
                </div>
              </div>

              {selectedApplication.status === 'pending' && (
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Review Notes (optional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Add any notes about this application..."
                  ></textarea>
                </div>
              )}

              {selectedApplication.status !== 'pending' && selectedApplication.reviewNotes && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Review Notes:</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedApplication.reviewNotes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseReview}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Close
                </button>

                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedApplication._id, 'rejected')}
                      disabled={processingId === selectedApplication._id}
                      className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                        processingId === selectedApplication._id ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingId === selectedApplication._id ? 'Processing...' : 'Reject Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedApplication._id, 'approved')}
                      disabled={processingId === selectedApplication._id}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                        processingId === selectedApplication._id ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingId === selectedApplication._id ? 'Processing...' : 'Approve Application'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApplications;
