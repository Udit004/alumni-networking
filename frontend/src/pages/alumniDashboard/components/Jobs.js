import React, { useState, useEffect } from 'react';
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
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/jobs/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      
      // Use the actual API data
      console.log('Jobs received from API:', {
        jobs: data.jobs?.length || 0
      });
      
      // Sort jobs by date
      const sortedJobs = data.jobs?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
      setJobs(sortedJobs);
      
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
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

  return (
    <div className="jobs-section space-y-6">
      {/* Job Form */}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Job Postings</h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Browse Jobs</span> <span>🔍</span>
            </button>
            
            <button 
              onClick={() => {
                resetJobForm();
                setShowJobForm(true);
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Post New Job</span> <span>➕</span>
            </button>
          </div>
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
    </div>
  );
};

export default Jobs; 