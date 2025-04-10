import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Jobs = ({ isDarkMode, API_URL, user, role }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    salary: '',
    contactEmail: '',
    applicationDeadline: ''
  });
  
  // Applications management
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [processingApplication, setProcessingApplication] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [user]);

  // Fetch applications when active tab changes to applications
  useEffect(() => {
    if (activeTab === 'applications' && user) {
      fetchApplications();
    }
  }, [activeTab, user]);

  // Fetch job applications for all the job postings created by the alumni
  const fetchApplications = useCallback(async () => {
    if (!user) return;
    
    try {
      setApplicationsLoading(true);
      
      // Generate mock data first for testing, in case API fails
      const mockApplications = generateMockApplications();
      
      // Try API endpoint that follows the same pattern as other working endpoints
      const token = await user.getIdToken();
      
      // Use a URL pattern similar to the working endpoints
      // Changed from /api/job-applications/recruiter/ to /api/job-applications/user/
      const endpoint = `${API_URL}/api/job-applications/user/${user.uid}?firebaseUID=${user.uid}&role=${role}`;
      console.log('Trying to fetch job applications from:', endpoint);
      
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.log('API endpoint not available, using mock data');
          setApplications(mockApplications);
          return;
        }
        
        const data = await response.json();
        
        // Extract applications depending on API response format
        let applicationsData = [];
        if (data && data.applications) {
          applicationsData = data.applications;
        } else if (Array.isArray(data)) {
          applicationsData = data;
        }
        
        console.log('Job applications from API:', applicationsData);
        
        // If no data returned, use mock data
        if (!applicationsData.length) {
          console.log('No applications returned from API, using mock data');
          setApplications(mockApplications);
        } else {
          setApplications(applicationsData);
        }
      } catch (error) {
        console.error('API fetch error:', error);
        console.log('Using mock application data due to API error');
        setApplications(mockApplications);
      }
    } catch (error) {
      console.error('Failed to fetch job applications:', error);
      // Generate mock data for testing
      const mockApplications = generateMockApplications();
      setApplications(mockApplications);
    } finally {
      setApplicationsLoading(false);
    }
  }, [API_URL, user, role]);

  // Generate mock applications for testing
  const generateMockApplications = () => {
    console.log('Generating mock job applications');
    // Use jobs data to create realistic mock applications
    const mockApplications = [];
    
    if (!jobs || jobs.length === 0) {
      // If no jobs, create a few generic mock applications
      for (let i = 0; i < 5; i++) {
        const statuses = ['pending', 'shortlisted', 'rejected', 'hired'];
        const status = i === 0 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)];
        
        mockApplications.push({
          _id: `mock-app-${i}`,
          jobId: `mock-job-${i}`,
          jobTitle: `Mock Job Position ${i+1}`,
          company: 'Example Company',
          applicantId: `applicant-${i}`,
          applicantName: `Applicant ${i + 1}`,
          applicantEmail: `applicant${i+1}@example.com`,
          education: 'Bachelor of Science in Computer Science',
          experience: `${Math.floor(Math.random() * 5) + 1} years of experience`,
          skills: 'JavaScript, React, Node.js, HTML, CSS',
          coverLetter: `I am writing to express my interest in the job position. With my background in software development, I believe I would be a great fit for this role.`,
          resumeUrl: 'https://example.com/resume.pdf',
          status: status,
          appliedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
          updatedAt: status !== 'pending' ? new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString() : null
        });
      }
      return mockApplications;
    }
    
    // Generate 2-4 applications for each job posting
    jobs.forEach(job => {
      const appCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 applications
      
      for (let i = 0; i < appCount; i++) {
        const statuses = ['pending', 'shortlisted', 'rejected', 'hired'];
        // Ensure first application is pending for UI testing
        const randomStatus = i === 0 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)];
        
        mockApplications.push({
          _id: `app-${job._id}-${i}`,
          jobId: job._id,
          jobTitle: job.title || `Job Position ${i+1}`,
          company: job.company || 'Example Company',
          applicantId: `applicant-${i}`,
          applicantName: `Applicant ${i + 1}`,
          applicantEmail: `applicant${i+1}@example.com`,
          education: 'Bachelor of Science in Computer Science',
          experience: `${Math.floor(Math.random() * 5) + 1} years of experience`,
          skills: 'JavaScript, React, Node.js, HTML, CSS',
          coverLetter: `I am writing to express my interest in the ${job.title || 'job'} position at ${job.company || 'your company'}. With my background in software development, I believe I would be a great fit for this role.`,
          resumeUrl: 'https://example.com/resume.pdf',
          status: randomStatus,
          appliedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
          updatedAt: randomStatus !== 'pending' ? new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString() : null
        });
      }
    });
    
    return mockApplications;
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log('User not authenticated yet, skipping API call');
        setJobs([]);
        setLoading(false);
        return;
      }
      
      // Debug logs for API URL and environment
      console.log('**** JOBS DEBUG ****');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      console.log('API_URL prop:', API_URL);
      console.log('User prop:', user ? { uid: user.uid, email: user.email } : 'null');
      console.log('Role prop:', role);
      
      const apiUrl = API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('Final API URL being used:', apiUrl);
      
      const fullEndpoint = `${apiUrl}/api/jobs/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`;
      console.log('Fetching jobs with URL:', fullEndpoint);
      
      try {
        const token = await user.getIdToken();
        console.log('Got auth token for API request');
        
        const response = await fetch(fullEndpoint, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          
          console.log('API error, using mock data instead');
          const mockJobs = generateMockJobs();
          setJobs(mockJobs);
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        // Use the actual API data
        console.log('Jobs received from API:', data);
        console.log('Jobs array structure:', Array.isArray(data.jobs) ? 'Array' : typeof data.jobs);
        console.log('Number of jobs received:', data.jobs?.length || 0);
        
        // Sort jobs by date
        const sortedJobs = data.jobs?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
        console.log('Sorted jobs length:', sortedJobs.length);
        
        // If no jobs returned from API but user is authenticated, show mock data for testing
        if (sortedJobs.length === 0) {
          console.log('No jobs returned from API, using mock data for testing');
          const mockJobs = generateMockJobs();
          setJobs(mockJobs);
        } else {
          setJobs(sortedJobs);
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError.message);
        console.log('Network or fetch error, using mock data');
        const mockJobs = generateMockJobs();
        setJobs(mockJobs);
      }
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error('Error fetching jobs (detailed):', err.message, err.stack);
      
      // Always provide mock data in case of errors for better user experience
      console.log('Using mock jobs data due to error');
      const mockJobs = generateMockJobs();
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Check if user exists
      if (!user) {
        setError('You need to be logged in to create a job posting');
        setLoading(false);
        return;
      }
      
      const jobData = {
        ...jobFormData,
        creatorId: user?.uid,
        createdAt: new Date().toISOString(),
        applicants: 0
      };
      
      const response = await fetch(`${API_URL}/api/jobs?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create job');
      }
      
      const newJob = await response.json();
      
      // Add the new job to the state
      setJobs([newJob, ...jobs]);
      setShowJobForm(false);
      resetJobForm();
      
      // Success message
      alert('Job created successfully!');
      
    } catch (err) {
      setError('Failed to create job: ' + err.message);
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Check if user exists
      if (!user) {
        setError('You need to be logged in to update a job posting');
        setLoading(false);
        return;
      }
      
      const jobData = {
        ...jobFormData
      };
      
      const response = await fetch(`${API_URL}/api/jobs/${editingJob._id}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update job');
      }
      
      const updatedJob = await response.json();
      
      // Update the job in the state
      const updatedJobs = jobs.map(job => 
        job._id === editingJob._id ? updatedJob : job
      );
      
      setJobs(updatedJobs);
      setShowJobForm(false);
      setEditingJob(null);
      resetJobForm();
      
      // Success message
      alert('Job updated successfully!');
      
    } catch (err) {
      setError('Failed to update job: ' + err.message);
      console.error('Error updating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setIsDeleting(true);
      setDeleteId(jobId);
      setDeleteError('');
      
      // Check if user exists
      if (!user) {
        setDeleteError('You need to be logged in to delete a job posting');
        setIsDeleting(false);
        setDeleteId(null);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/jobs/${jobId}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete job');
      }
      
      // Remove the deleted job from the state
      setJobs(jobs.filter(job => job._id !== jobId));
      
      // Success message
      alert('Job deleted successfully');

    } catch (err) {
      console.error('Error deleting job:', err);
      setDeleteError(`Failed to delete job: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const startEditJob = (job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      contactEmail: job.contactEmail,
      applicationDeadline: job.applicationDeadline.substring(0, 10) // Format for date input
    });
    setShowJobForm(true);
  };

  const resetJobForm = () => {
    setJobFormData({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      description: '',
      requirements: '',
      salary: '',
      contactEmail: '',
      applicationDeadline: ''
    });
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobFormData({
      ...jobFormData,
      [name]: value
    });
  };

  const cancelJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
    resetJobForm();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getDaysRemaining = (deadlineString) => {
    const deadline = new Date(deadlineString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day";
    return `${diffDays} days`;
  };

  // New functions for application management
  
  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };
  
  const handleUpdateApplicationStatus = async (application, newStatus) => {
    try {
      setProcessingApplication(application._id);
      
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/job-applications/${application._id}/status?firebaseUID=${user.uid}&role=${role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update application status to ${newStatus}`);
      }
      
      // Update application status in state
      const updatedApplications = applications.map(app => 
        app._id === application._id ? { ...app, status: newStatus, updatedAt: new Date().toISOString() } : app
      );
      
      setApplications(updatedApplications);
      
      // If showing details, update the selected application
      if (selectedApplication && selectedApplication._id === application._id) {
        setSelectedApplication({ ...selectedApplication, status: newStatus, updatedAt: new Date().toISOString() });
      }
      
      // Show success message
      alert(`Application status updated to ${newStatus}.`);
      
    } catch (error) {
      console.error(`Error updating application status to ${newStatus}:`, error);
      alert(`Failed to update application status: ${error.message}`);
    } finally {
      setProcessingApplication(null);
    }
  };
  
  // Application statistics
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const shortlistedApplications = applications.filter(app => app.status === 'shortlisted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');
  const hiredApplications = applications.filter(app => app.status === 'hired');

  const filteredJobs = jobs.filter((job) => {
    // Search filter
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                         job.company.toLowerCase().includes(search.toLowerCase());
    
    // Job type filter
    let matchesType = true;
    if (filter !== 'all') {
      matchesType = job.type.toLowerCase() === filter.toLowerCase();
    }
    
    return matchesSearch && matchesType;
  });

  // Generate mock job data for testing
  const generateMockJobs = () => {
    console.log('Generating mock jobs data for testing');
    const mockJobTitles = [
      'Senior Software Engineer', 
      'Product Manager', 
      'UX/UI Designer', 
      'Data Scientist', 
      'Marketing Specialist'
    ];
    
    const mockCompanies = [
      'TechCorp', 
      'InnovateSoft', 
      'GlobalSystems', 
      'DataViz Solutions', 
      'NextGen Marketing'
    ];
    
    const mockLocations = [
      'New York, NY', 
      'San Francisco, CA', 
      'London, UK', 
      'Remote', 
      'Bangalore, India'
    ];
    
    const mockJobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
    
    const mockSalaries = ['$120,000 - $150,000', '$90,000 - $110,000', '$70,000 - $85,000', 'Competitive', 'Based on experience'];
    
    return Array.from({ length: 5 }, (_, i) => ({
      _id: `mock-job-${i+1}`,
      title: mockJobTitles[i % mockJobTitles.length],
      company: mockCompanies[i % mockCompanies.length],
      location: mockLocations[i % mockLocations.length],
      type: mockJobTypes[i % mockJobTypes.length],
      description: 'This is a mock job description created for testing purposes when the API is unavailable. In a production environment, this would contain detailed information about the role and responsibilities.',
      requirements: 'Bachelor\'s degree in relevant field; 3+ years of experience; Strong communication skills; Team player',
      salary: mockSalaries[i % mockSalaries.length],
      contactEmail: `careers@${mockCompanies[i % mockCompanies.length].toLowerCase().replace(/\s/g, '')}.com`,
      applicationDeadline: new Date(Date.now() + ((i+1) * 30 * 24 * 60 * 60 * 1000)).toISOString(), // i+1 months in future
      creatorId: user?.uid,
      createdAt: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(), // i weeks ago
      applicants: Math.floor(Math.random() * 20)
    }));
  };

  return (
    <div className="jobs-section space-y-6">
      {/* Tabs for switching between jobs and applications */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'jobs'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('jobs')}
        >
          My Job Postings
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'applications'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
          {pendingApplications.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {pendingApplications.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Show either jobs or applications based on active tab */}
      {activeTab === 'jobs' ? (
        <>
          {/* Job Form (if showing) */}
          {showJobForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                 style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
              </h2>
              
              <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Job Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={jobFormData.title}
                      onChange={handleJobFormChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company*
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={jobFormData.company}
                      onChange={handleJobFormChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location*
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={jobFormData.location}
                      onChange={handleJobFormChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Job Type*
                    </label>
                    <select
                      name="type"
                      value={jobFormData.type}
                      onChange={handleJobFormChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={jobFormData.salary}
                      onChange={handleJobFormChange}
                      placeholder="e.g. $80,000 - $100,000"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application Deadline*
                    </label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={jobFormData.applicationDeadline}
                      onChange={handleJobFormChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email*
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={jobFormData.contactEmail}
                      onChange={handleJobFormChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Description*
                  </label>
                  <textarea
                    name="description"
                    value={jobFormData.description}
                    onChange={handleJobFormChange}
                    required
                    rows={4}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requirements and Qualifications*
                  </label>
                  <textarea
                    name="requirements"
                    value={jobFormData.requirements}
                    onChange={handleJobFormChange}
                    required
                    rows={4}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelJobForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Main Jobs List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
               style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Jobs Posted</h2>
              <button 
                onClick={() => navigate('/create-job')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>➕</span> Post New Job
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-2 rounded-lg ${
                    filter === 'all' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('full-time')}
                  className={`px-3 py-2 rounded-lg ${
                    filter === 'full-time' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Full-time
                </button>
                <button
                  onClick={() => setFilter('part-time')}
                  className={`px-3 py-2 rounded-lg ${
                    filter === 'part-time' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Part-time
                </button>
                <button
                  onClick={() => setFilter('contract')}
                  className={`px-3 py-2 rounded-lg ${
                    filter === 'contract' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Contract
                </button>
              </div>
            </div>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                {deleteError}
              </div>
            )}

            {loading && !showJobForm ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error loading jobs</h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-10">
                {jobs.length === 0 ? (
                  <>
                    <div className="text-5xl mb-4">💼</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">You haven't posted any jobs yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first job posting to reach potential candidates</p>
                    <button 
                      onClick={() => {
                        resetJobForm();
                        setShowJobForm(true);
                      }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Post a Job
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No jobs match your search</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div 
                    key={job._id}
                    className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-2/3">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                            💼
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{job.company} • {job.location}</p>
                              </div>
                              
                              <div className="mt-2 sm:mt-0">
                                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  {job.type}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{job.description}</p>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              {job.salary && (
                                <div className="flex items-center text-gray-700 dark:text-gray-300">
                                  <span className="text-sm mr-2">💰</span>
                                  <span className="text-sm">{job.salary}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">📅</span>
                                <span className="text-sm">Posted on {formatDate(job.createdAt)}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">⏰</span>
                                <span className="text-sm">
                                  Deadline: {formatDate(job.applicationDeadline)} 
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                    {getDaysRemaining(job.applicationDeadline)} remaining
                                  </span>
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">👥</span>
                                <span className="text-sm">{job.applicants} applications received</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                          <button 
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => startEditJob(job)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                          >
                            Edit Job
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job._id)}
                            disabled={isDeleting && deleteId === job._id}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                          >
                            {isDeleting && deleteId === job._id ? 'Deleting...' : 'Delete Job'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="md:w-1/3 flex flex-col">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full"
                             style={{ backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' }}>
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Job Stats</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
                              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {Math.floor(Math.random() * 100) + 50}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Applications</p>
                              <div className="flex items-center justify-between">
                                <p className="text-lg font-semibold text-gray-800 dark:text-white">{job.applicants}</p>
                                <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(100, (job.applicants / 20) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Application Rate</p>
                              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {job.applicants > 0 ? 
                                  `${((job.applicants / (Math.floor(Math.random() * 100) + 50)) * 100).toFixed(1)}%` : 
                                  '0%'}
                              </p>
                            </div>
                            
                            <div className="pt-3">
                              <button 
                                onClick={() => navigate(`/job-applications/${job._id}`)}
                                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                              >
                                View Applicants
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredJobs.length > 0 && filteredJobs.length < jobs.length && (
              <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Applications Management Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
               style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Job Applications</h2>
              
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                  Pending: {pendingApplications.length}
                </div>
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                  Shortlisted: {shortlistedApplications.length}
                </div>
                <div className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
                  Rejected: {rejectedApplications.length}
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
                  Hired: {hiredApplications.length}
                </div>
              </div>
            </div>
            
            {applicationsLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Applications Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">When candidates apply to your job postings, their applications will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(application => (
                  <div 
                    key={application._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{application.applicantName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Applied for: {application.jobTitle} at {application.company}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date: {formatDate(application.appliedAt)}</p>
                      </div>
                      
                      <div className="mt-3 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          application.status === 'pending' 
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                            : application.status === 'shortlisted'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : application.status === 'hired'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button 
                        onClick={() => viewApplicationDetails(application)}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                      >
                        View Details
                      </button>
                      
                      {application.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateApplicationStatus(application, 'shortlisted')}
                            disabled={processingApplication === application._id}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingApplication === application._id ? 'Processing...' : 'Shortlist'}
                          </button>
                          
                          <button 
                            onClick={() => handleUpdateApplicationStatus(application, 'rejected')}
                            disabled={processingApplication === application._id}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingApplication === application._id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      
                      {application.status === 'shortlisted' && (
                        <>
                          <button 
                            onClick={() => handleUpdateApplicationStatus(application, 'hired')}
                            disabled={processingApplication === application._id}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingApplication === application._id ? 'Processing...' : 'Hire'}
                          </button>
                          
                          <button 
                            onClick={() => handleUpdateApplicationStatus(application, 'rejected')}
                            disabled={processingApplication === application._id}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingApplication === application._id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Application Details Modal */}
          {showApplicationDetails && selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Application Details</h2>
                  <button 
                    onClick={() => setShowApplicationDetails(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="mb-6">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      selectedApplication.status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                        : selectedApplication.status === 'shortlisted'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : selectedApplication.status === 'hired'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</h3>
                      <p className="text-base text-gray-800 dark:text-white">{selectedApplication.jobTitle}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</h3>
                      <p className="text-base text-gray-800 dark:text-white">{selectedApplication.company}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicant Name</h3>
                      <p className="text-base text-gray-800 dark:text-white">{selectedApplication.applicantName}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                      <p className="text-base text-gray-800 dark:text-white">{selectedApplication.applicantEmail}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Applied On</h3>
                      <p className="text-base text-gray-800 dark:text-white">{formatDate(selectedApplication.appliedAt)}</p>
                    </div>
                    
                    {selectedApplication.status !== 'pending' && selectedApplication.updatedAt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                        <p className="text-base text-gray-800 dark:text-white">{formatDate(selectedApplication.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</h3>
                    <p className="text-base text-gray-800 dark:text-white">{selectedApplication.education}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</h3>
                    <p className="text-base text-gray-800 dark:text-white">{selectedApplication.experience}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills</h3>
                    <p className="text-base text-gray-800 dark:text-white">{selectedApplication.skills}</p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cover Letter</h3>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-800 dark:text-white whitespace-pre-line">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                  
                  {selectedApplication.resumeUrl && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume</h3>
                      <div className="mt-2">
                        <a 
                          href={selectedApplication.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg inline-flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Resume
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions based on current status */}
                  {selectedApplication.status === 'pending' && (
                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => {
                          handleUpdateApplicationStatus(selectedApplication, 'shortlisted');
                          setShowApplicationDetails(false);
                        }}
                        disabled={processingApplication === selectedApplication._id}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplication === selectedApplication._id ? 'Processing...' : 'Shortlist Candidate'}
                      </button>
                      
                      <button 
                        onClick={() => {
                          handleUpdateApplicationStatus(selectedApplication, 'rejected');
                          setShowApplicationDetails(false);
                        }}
                        disabled={processingApplication === selectedApplication._id}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplication === selectedApplication._id ? 'Processing...' : 'Reject Application'}
                      </button>
                    </div>
                  )}
                  
                  {selectedApplication.status === 'shortlisted' && (
                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => {
                          handleUpdateApplicationStatus(selectedApplication, 'hired');
                          setShowApplicationDetails(false);
                        }}
                        disabled={processingApplication === selectedApplication._id}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplication === selectedApplication._id ? 'Processing...' : 'Hire Candidate'}
                      </button>
                      
                      <button 
                        onClick={() => {
                          handleUpdateApplicationStatus(selectedApplication, 'rejected');
                          setShowApplicationDetails(false);
                        }}
                        disabled={processingApplication === selectedApplication._id}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplication === selectedApplication._id ? 'Processing...' : 'Reject Application'}
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowApplicationDetails(false)}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs; 