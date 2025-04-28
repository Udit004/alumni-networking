import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getWithAuth } from '../../../utils/apiHelper';

const Mentorship = ({ isDarkMode }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [enrolledMentorships, setEnrolledMentorships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMentorships();
    fetchApplications();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      console.log('Fetching mentorships...');

      // Get all mentorships
      const mentorshipsData = await getWithAuth({
        endpoint: '/api/mentorships',
        getToken: () => currentUser.getIdToken()
      });
      console.log('Mentorships response:', mentorshipsData);

      // Get user's enrolled mentorships
      const userMentorshipsData = await getWithAuth({
        endpoint: `/api/mentorships/user/${currentUser.uid}`,
        getToken: () => currentUser.getIdToken()
      });
      console.log('User mentorships response:', userMentorshipsData);

      // Process mentorships data
      const mentorshipsArray = mentorshipsData.success ? mentorshipsData.mentorships :
                              (Array.isArray(mentorshipsData) ? mentorshipsData : []);

      const processedMentorships = mentorshipsArray.map(mentorship => ({
        ...mentorship,
        skills: Array.isArray(mentorship.skills) ? mentorship.skills : [],
        title: mentorship.title || 'Untitled Mentorship',
        category: mentorship.category || 'General',
        duration: mentorship.duration || 'Not specified',
        description: mentorship.description || '',
        mentees: Array.isArray(mentorship.mentees) ? mentorship.mentees : []
      }));

      setMentorships(processedMentorships);

      // Process user mentorships data
      const userMentorships = userMentorshipsData.success ?
                             (userMentorshipsData.mentorships ||
                              userMentorshipsData.enrolledMentorships ||
                              []) :
                             (Array.isArray(userMentorshipsData) ? userMentorshipsData : []);

      setEnrolledMentorships(Array.isArray(userMentorships) ? userMentorships : []);
    } catch (err) {
      console.error('Error fetching mentorships:', err);
      setError('Failed to load mentorships. Please try again.');
      setMentorships([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      console.log('Fetching mentorship applications...');

      // Get user-specific applications
      const applicationsData = await getWithAuth({
        endpoint: `/api/mentorship-applications/user/${currentUser.uid}`,
        getToken: () => currentUser.getIdToken()
      });
      console.log('Applications response:', applicationsData);

      // Process applications data
      let processedApplications = [];

      if (applicationsData.success && Array.isArray(applicationsData.data)) {
        processedApplications = applicationsData.data;
      } else if (Array.isArray(applicationsData)) {
        processedApplications = applicationsData;
      }

      // Normalize application data
      const normalizedApplications = processedApplications.map(app => ({
        ...app,
        skills: Array.isArray(app.skills) ? app.skills :
               (typeof app.skills === 'string' ? app.skills.split(',').map(s => s.trim()) : []),
        name: app.name || 'Unnamed Applicant',
        program: app.program || 'Not specified',
        status: app.status || 'pending'
      }));

      setApplications(normalizedApplications);
    } catch (err) {
      console.error('Error fetching mentorship applications:', err);

      // Try fallback to general endpoint if user-specific endpoint fails
      try {
        console.log('Trying fallback to general applications endpoint...');
        const fallbackData = await getWithAuth({
          endpoint: '/api/mentorship-applications',
          getToken: () => currentUser.getIdToken()
        });

        // Filter for current user's applications
        let userApplications = [];
        if (fallbackData.success && Array.isArray(fallbackData.data)) {
          userApplications = fallbackData.data.filter(app => app.userId === currentUser.uid);
        } else if (Array.isArray(fallbackData)) {
          userApplications = fallbackData.filter(app => app.userId === currentUser.uid);
        }

        // Normalize application data
        const normalizedApplications = userApplications.map(app => ({
          ...app,
          skills: Array.isArray(app.skills) ? app.skills :
                 (typeof app.skills === 'string' ? app.skills.split(',').map(s => s.trim()) : []),
          name: app.name || 'Unnamed Applicant',
          program: app.program || 'Not specified',
          status: app.status || 'pending'
        }));

        setApplications(normalizedApplications);
      } catch (fallbackErr) {
        console.error('Error in fallback mentorship applications fetch:', fallbackErr);
        setApplications([]);
      }
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleApplyMentorship = (mentorshipId) => {
    if (!currentUser) {
      alert('Please login to apply for mentorship');
      return;
    }
    navigate(`/mentorship/${mentorshipId}/apply`);
  };

  const isEnrolled = (mentorshipId) => {
    return enrolledMentorships.some(m => m.mentorshipId === mentorshipId);
  };

  const hasApplied = (mentorshipId) => {
    return applications.some(app => app.mentorshipId?._id === mentorshipId || app.mentorshipId === mentorshipId);
  };

  const filteredMentorships = Array.isArray(mentorships) ? mentorships.filter(mentorship => {
    if (!mentorship) return false;

    const matchesSearch = (mentorship.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (mentorship.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'enrolled' && isEnrolled(mentorship._id)) return matchesSearch;
    if (filter === 'available' && !isEnrolled(mentorship._id)) return matchesSearch;

    return false;
  }) : [];

  // Get application status text and color
  const getStatusDisplay = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return { text: 'Approved', bgColor: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-800 dark:text-green-200' };
      case 'rejected':
        return { text: 'Rejected', bgColor: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200' };
      case 'pending':
      default:
        return { text: 'Pending', bgColor: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200' };
    }
  };

  // Separate mentorships that user has applied for
  const appliedMentorships = filteredMentorships.filter(mentorship =>
    hasApplied(mentorship._id)
  );

  // Check if a mentorship is full
  const isMentorshipFull = (mentorship) => {
    return mentorship.mentees?.length >= mentorship.maxMentees;
  };

  // Suggested mentorships (those the user hasn't applied for, are active, and not full)
  const suggestedMentorships = filteredMentorships.filter(mentorship =>
    !hasApplied(mentorship._id) &&
    mentorship.status === 'active' &&
    !isMentorshipFull(mentorship)
  );

  // Debug logs for counts
  console.log('Mentorship Component - Applications Count:', applications.length);
  console.log('Mentorship Component - Applied Mentorships Count:', appliedMentorships.length);
  console.log('Mentorship Component - Enrolled Mentorships Count:', enrolledMentorships.length);

  // Log application IDs for debugging
  console.log('Mentorship Component - Application IDs:', applications.map(app => app._id));

  // Log the status of each application
  const statusCounts = {
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted' || app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };
  console.log('Mentorship Component - Application Status Counts:', statusCounts);

  return (
    <div className="mentorship-section">
      {/* Search Bar for Mentorships */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Find a Mentor</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for mentorships..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Mentorships</option>
              <option value="enrolled">Enrolled</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* 1. Applied Mentorships Section */}
            {appliedMentorships.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Applied Mentorships</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {appliedMentorships.map(mentorship => (
                    <div key={mentorship._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{mentorship.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Category: {mentorship.category} • Duration: {mentorship.duration}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Array.isArray(mentorship.skills) && mentorship.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-yellow-500 text-white rounded-lg inline-block">Applied</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{mentorship.description}</p>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Commitment: {mentorship.commitment} • Mentees: {mentorship.mentees?.length || 0}/{mentorship.maxMentees}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Applications Status Section */}
            {applications.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Applications</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {applications.map(application => {
                    const mentorshipDetails = application.mentorshipId || {};
                    const { text: statusText, bgColor, textColor } = getStatusDisplay(application.status);

                    // Try to find the mentorship title from the available mentorships if we have the ID as string
                    let mentorshipTitle = "";
                    if (typeof mentorshipDetails === 'object' && mentorshipDetails.title) {
                      mentorshipTitle = mentorshipDetails.title;
                    } else {
                      const mentorshipId = typeof mentorshipDetails === 'string' ? mentorshipDetails : application.mentorshipId;
                      const foundMentorship = mentorships.find(m => m._id === mentorshipId);
                      mentorshipTitle = foundMentorship ? foundMentorship.title : `Mentorship Application`;
                    }

                    return (
                      <div key={application._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                              {mentorshipTitle}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">Applied on: {new Date(application.appliedAt).toLocaleDateString()}</p>
                            <span className={`px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs`}>
                              {statusText}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(application.skills) && application.skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Details</h4>
                            <p className="text-gray-900 dark:text-white text-sm">
                              {application.name} • {application.program}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Suggested Mentorships Section */}
            {suggestedMentorships.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Suggested Mentorships</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {suggestedMentorships.map(mentorship => (
              <div key={mentorship._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{mentorship.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Category: {mentorship.category} • Duration: {mentorship.duration}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                            {Array.isArray(mentorship.skills) && mentorship.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                        Active
                      </span>
                  </div>
                </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{mentorship.description}</p>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Commitment: {mentorship.commitment} • Mentees: {mentorship.mentees?.length || 0}/{mentorship.maxMentees}
                    </p>
                      {mentorship.status !== 'active' ? (
                        <button
                          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                          disabled
                        >
                          Program Completed
                        </button>
                      ) : isMentorshipFull(mentorship) ? (
                        <button
                          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                          disabled
                        >
                          Program Full
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          onClick={() => handleApplyMentorship(mentorship._id)}
                        >
                          Apply
                        </button>
                      )}
                      </div>
                  </div>
                  ))}
                </div>
              </div>
            )}

            {/* No data message */}
            {filteredMentorships.length === 0 && (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600 dark:text-gray-400">No mentorships found matching your criteria.</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Check back later for new mentorship opportunities.</p>
          </div>
            )}
          </>
        )}
      </div>

      {/* Enrolled Mentorships Section (if any) */}
      {enrolledMentorships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">My Mentorships</h2>

          <div className="space-y-6">
            {enrolledMentorships.map(enrollment => {
              const mentorship = mentorships.find(m => m._id === enrollment.mentorshipId);
              if (!mentorship) return null;

              return (
                <div key={mentorship._id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{mentorship.title || 'Untitled Mentorship'}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Mentor: {mentorship.mentorName || 'Unknown'}</p>
                    </div>
                    <div>
                      <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
                        Contact Mentor
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Session</h4>
                      <p className="text-gray-900 dark:text-white">Thursday, 3:00 PM</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progress</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Remaining</h4>
                      <p className="text-gray-900 dark:text-white">4 weeks</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading indicator for applications */}
      {applicationsLoading && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 flex justify-center"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Show debugging info if no data is loaded */}
      {filteredMentorships.length === 0 && applications.length === 0 && enrolledMentorships.length === 0 && !applicationsLoading && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Your Mentorship Status</h2>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              You haven't applied for any mentorships yet. Browse the available mentorships above and apply!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you've just submitted an application, try refreshing the page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;