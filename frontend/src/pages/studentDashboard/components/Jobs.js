import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getWithAuth } from '../../../utils/apiHelper';

const Jobs = ({ isDarkMode }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Define fetch functions
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs...');

      const jobsData = await getWithAuth({
        endpoint: '/api/jobs',
        getToken: () => currentUser.getIdToken()
      });
      console.log('Jobs API Response Data:', jobsData);

      // Process jobs data
      const jobsArray = jobsData.success ? jobsData.jobs :
                       (Array.isArray(jobsData) ? jobsData : []);
      console.log('Jobs array before processing:', jobsArray);

      const processedJobs = jobsArray.map(job => ({
        ...job,
        title: job.title || 'Untitled Job',
        company: job.company || 'Unknown Company',
        location: job.location || 'Unspecified Location',
        type: job.type || 'Not specified',
        description: job.description || '',
        salary: job.salary || null,
        status: job.status || 'active',
        applicants: Array.isArray(job.applicants) ? job.applicants : []
      }));

      console.log('Final processed jobs:', processedJobs);
      setJobs(processedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchJobApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true);
      console.log('Fetching job applications...');

      // Try the user-specific endpoint first
      try {
        const applicationsData = await getWithAuth({
          endpoint: `/api/job-applications/user/${currentUser.uid}`,
          getToken: () => currentUser.getIdToken()
        });
        console.log('Job applications response:', applicationsData);

        // Process applications data
        let processedApplications = [];

        if (applicationsData.success && Array.isArray(applicationsData.data)) {
          processedApplications = applicationsData.data;
        } else if (Array.isArray(applicationsData)) {
          processedApplications = applicationsData;
        } else if (applicationsData.applications && Array.isArray(applicationsData.applications)) {
          processedApplications = applicationsData.applications;
        }

        // Filter for current user's applications if needed
        const userApplications = processedApplications.filter(app =>
          !app.userId || app.userId === currentUser.uid || app.firebaseUID === currentUser.uid
        );

        // Normalize application data
        const normalizedApplications = userApplications.map(app => ({
          ...app,
          jobId: app.jobId,
          skills: Array.isArray(app.skills) ? app.skills :
                 (typeof app.skills === 'string' ? app.skills.split(',').map(s => s.trim()) : []),
          status: app.status || 'pending',
          name: app.name || currentUser?.displayName || 'Unknown',
          appliedAt: app.appliedAt || new Date().toISOString()
        }));

        console.log('Processed applications:', normalizedApplications);
        setApplications(normalizedApplications);
      } catch (userError) {
        console.error('Error fetching from user endpoint:', userError);

        // Try the test endpoint as fallback
        console.log('Falling back to test endpoint...');
        const testData = await getWithAuth({
          endpoint: `/api/job-applications/user-test/${currentUser.uid}`,
          getToken: () => currentUser.getIdToken()
        });

        console.log('Test endpoint response:', testData);

        // Process test data
        let testApplications = [];
        if (testData.success && Array.isArray(testData.data)) {
          testApplications = testData.data;
        } else if (Array.isArray(testData)) {
          testApplications = testData;
        }

        // Normalize test application data
        const normalizedTestApplications = testApplications.map(app => ({
          ...app,
          jobId: app.jobId,
          skills: Array.isArray(app.skills) ? app.skills :
                 (typeof app.skills === 'string' ? app.skills.split(',').map(s => s.trim()) : []),
          status: app.status || 'pending',
          name: app.name || currentUser?.displayName || 'Unknown',
          appliedAt: app.appliedAt || new Date().toISOString()
        }));

        console.log('Processed test applications:', normalizedTestApplications);
        setApplications(normalizedTestApplications);
      }
    } catch (err) {
      console.error('Error fetching job applications:', err);

      // Try general endpoint as a last resort
      try {
        console.log('Trying general applications endpoint as last resort...');
        const generalData = await getWithAuth({
          endpoint: '/api/job-applications',
          getToken: () => currentUser.getIdToken()
        });

        // Filter for current user's applications
        let userApplications = [];
        if (generalData.success && Array.isArray(generalData.data)) {
          userApplications = generalData.data.filter(app => app.userId === currentUser.uid);
        } else if (Array.isArray(generalData)) {
          userApplications = generalData.filter(app => app.userId === currentUser.uid);
        }

        // Normalize application data
        const normalizedApplications = userApplications.map(app => ({
          ...app,
          jobId: app.jobId,
          skills: Array.isArray(app.skills) ? app.skills :
                 (typeof app.skills === 'string' ? app.skills.split(',').map(s => s.trim()) : []),
          status: app.status || 'pending',
          name: app.name || currentUser?.displayName || 'Unknown',
          appliedAt: app.appliedAt || new Date().toISOString()
        }));

        console.log('Processed general applications:', normalizedApplications);
        setApplications(normalizedApplications);
      } catch (generalError) {
        console.error('Error in general applications fetch:', generalError);
        setApplications([]);
      }
    } finally {
      setApplicationsLoading(false);
    }
  }, [currentUser]);

  // Set up effect to fetch data when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchJobs();
      fetchJobApplications();
    }
  }, [currentUser, fetchJobs, fetchJobApplications]);

  const handleApplyJob = (jobId) => {
    if (!currentUser) {
      alert('Please login to apply for this job');
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  const hasApplied = useCallback((jobId) => {
    if (!currentUser || !applications.length) return false;

    // Convert jobId to string for comparison
    const jobIdStr = jobId?.toString();

    const result = applications.some(app => {
      // Handle both string IDs and object IDs
      const appJobId = typeof app.jobId === 'object' ? app.jobId?._id : app.jobId;
      return appJobId?.toString() === jobIdStr;
    });

    console.log(`Checking if applied to job ${jobId}: ${result}`);
    return result;
  }, [applications, currentUser]);

  const getApplicationStatus = useCallback((jobId) => {
    if (!currentUser || !applications.length) return null;

    // Convert jobId to string for comparison
    const jobIdStr = jobId.toString();

    const application = applications.find(app => {
      const appJobId = app.jobId?.toString();
      return appJobId === jobIdStr && app.userId === currentUser.uid;
    });

    return application ? application.status : null;
  }, [applications, currentUser]);

  const getJobDetails = useCallback((jobId) => {
    return jobs.find(job => job._id === jobId);
  }, [jobs]);

  const filteredJobs = useMemo(() =>
    Array.isArray(jobs) ? jobs.filter(job => {
      if (!job) return false;

      const matchesSearch =
        (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === 'all') return matchesSearch;
      if (filter === 'fullTime' && job.type === 'Full-time') return matchesSearch;
      if (filter === 'partTime' && job.type === 'Part-time') return matchesSearch;
      if (filter === 'internship' && job.type === 'Internship') return matchesSearch;
      if (filter === 'remote' && (job.location || '').toLowerCase().includes('remote')) return matchesSearch;

      return false;
    }) : []
  , [jobs, searchTerm, filter]);

  const getStatusDisplay = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return { text: 'Approved', bgColor: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-800 dark:text-green-200' };
      case 'rejected':
      case 'declined':
        return { text: 'Rejected', bgColor: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200' };
      case 'pending':
      default:
        return { text: 'Pending', bgColor: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200' };
    }
  };

  // Check if a job is expired based on application deadline
  const isJobExpired = useCallback((job) => {
    if (!job || !job.applicationDeadline) return false;

    const deadline = new Date(job.applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deadline < today;
  }, []);

  // Separate jobs that user has applied for
  const appliedJobs = useMemo(() => {
    console.log('Calculating applied jobs...');
    console.log('Current jobs:', filteredJobs);
    console.log('Current applications:', applications);

    // First, extract all job IDs from applications
    const applicationJobIds = applications.map(app => {
      // Handle both string IDs and object IDs
      const jobId = typeof app.jobId === 'object' ? app.jobId?._id : app.jobId;
      return jobId?.toString();
    }).filter(Boolean);

    console.log('All application job IDs:', applicationJobIds);

    // Then filter jobs that match these IDs
    const applied = filteredJobs.filter(job => {
      const jobIdStr = job._id?.toString();
      const isApplied = applicationJobIds.includes(jobIdStr);
      console.log(`Job: ${job.title || job._id}, id: ${jobIdStr}, isApplied: ${isApplied}`);
      return isApplied;
    });

    console.log('Final applied jobs:', applied);

    // Create a map of existing job IDs for faster lookup
    const existingJobIdsMap = {};
    applied.forEach(job => {
      existingJobIdsMap[job._id.toString()] = true;
    });

    // Create placeholder jobs for applications that don't have matching jobs
    // This ensures the count matches between "Applied Jobs" and "My Job Applications"
    const placeholderJobs = [];

    // Process each application
    applications.forEach(app => {
      const appJobId = typeof app.jobId === 'object' ? app.jobId?._id : app.jobId;
      if (!appJobId) return;

      const appJobIdStr = appJobId.toString();

      // If this job ID isn't in our applied jobs list, create a placeholder
      if (!existingJobIdsMap[appJobIdStr]) {
        console.log(`Creating placeholder for job ID: ${appJobIdStr}`);
        placeholderJobs.push({
          _id: appJobId,
          title: app.jobTitle || 'Job Application',
          company: app.company || 'Unknown Company',
          location: app.location || 'Not specified',
          type: 'Not specified',
          description: 'This job may no longer be available',
          applicationDeadline: app.appliedAt,
          status: app.status || 'pending',
          createdAt: app.appliedAt,
          isPlaceholder: true,
          applicationId: app._id // Store the application ID for reference
        });
      }
    });

    console.log(`Created ${placeholderJobs.length} placeholder jobs`);
    console.log('Total applied jobs (including placeholders):', applied.length + placeholderJobs.length);

    return [...applied, ...placeholderJobs];
  }, [filteredJobs, applications]);

  // Suggested jobs (those the user hasn't applied for and aren't expired)
  const suggestedJobs = useMemo(() => {
    const suggested = filteredJobs.filter(job =>
      !hasApplied(job._id) &&
      job.status === 'active' &&
      !isJobExpired(job)
    );
    console.log('Suggested jobs:', suggested);
    return suggested;
  }, [filteredJobs, hasApplied, isJobExpired]);

  // Debug logs for counts
  console.log('Jobs Component - Applications Count:', applications.length);
  console.log('Jobs Component - Applied Jobs Count:', appliedJobs.length);

  // Log application IDs for debugging
  console.log('Jobs Component - Application IDs:', applications.map(app => app._id));

  // Log the status of each application
  const statusCounts = {
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };
  console.log('Jobs Component - Application Status Counts:', statusCounts);

  return (
    <div className="jobs-section">
      {/* Search Bar for Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Find Your Next Opportunity</h2>
            <button
              onClick={() => {
                fetchJobs();
                fetchJobApplications();
              }}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for jobs..."
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
              <option value="all">All Jobs</option>
              <option value="fullTime">Full-time</option>
              <option value="partTime">Part-time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
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
            {/* 1. Applied Jobs Section */}
            {appliedJobs.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Applied Jobs</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {appliedJobs.map(job => {
                    const status = getApplicationStatus(job._id);
                    const { text: statusText, bgColor, textColor } = getStatusDisplay(status);

                    return (
                      <div key={job._id} className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow border-l-4 ${job.isPlaceholder ? 'border-gray-400' : 'border-yellow-500'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{job.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{job.company} • {job.location}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                {job.type}
                              </span>
                              {job.salary && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                                  {job.salary}
                                </span>
                              )}
                              {job.isPlaceholder && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                  Archived
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`px-4 py-2 ${bgColor} ${textColor} rounded-lg inline-block`}>
                            {statusText}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{job.description}</p>
                        <div>
                          {job.applicationDeadline && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Applications Status Section */}
            {applications.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Job Applications</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {applications.map(application => {
                    const jobDetails = getJobDetails(application.jobId);
                    const { text: statusText, bgColor, textColor } = getStatusDisplay(application.status);

                    return (
                      <div key={application._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                              {jobDetails?.title || 'Job Application'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                            <span className={`px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs`}>
                              {statusText}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Details</h4>
                            <p className="text-gray-900 dark:text-white text-sm">
                              Position: {jobDetails?.title || 'Not specified'}<br />
                              Company: {jobDetails?.company || 'Not specified'}<br />
                              Location: {application.location || 'Not specified'}<br />
                              Education: {application.education || 'Not specified'}<br />
                              Experience: {application.experience || 'Not specified'}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills & Cover Letter</h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {Array.isArray(application.skills) && application.skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <p className="text-gray-900 dark:text-white text-sm line-clamp-2">
                              {application.coverletter || 'No cover letter provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Suggested Jobs Section */}
            {suggestedJobs.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Suggested Jobs</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {suggestedJobs.map(job => (
                    <div key={job._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{job.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">{job.company} • {job.location}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                              {job.type}
                            </span>
                            {job.salary && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                                {job.salary}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{job.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          {job.applicationDeadline && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {isJobExpired(job) ? (
                          <button
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                            disabled
                          >
                            Application Closed
                          </button>
                        ) : (
                          <button
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            onClick={() => handleApplyJob(job._id)}
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No data message */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600 dark:text-gray-400">No jobs found matching your criteria.</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Check back later for new job opportunities.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading indicator for applications */}
      {applicationsLoading && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 flex justify-center"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Show message if no data is loaded */}
      {filteredJobs.length === 0 && applications.length === 0 && !applicationsLoading && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Your Job Search</h2>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              You haven't applied for any jobs yet. Browse the available opportunities above and apply!
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

export default Jobs;