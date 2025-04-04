import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const Jobs = ({ isDarkMode }) => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/jobs`);
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setLoading(false);
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!currentUser) return;
    
    try {
      await axios.post(`${API_URL}/api/jobs/${jobId}/apply`, {
        userId: currentUser.uid
      });
      
      // Update local state to reflect the application
      setJobs(jobs.map(job => 
        job._id === jobId ? 
          { ...job, applicants: [...job.applicants, { userId: currentUser.uid }] } : 
          job
      ));
      
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to submit application. Please try again.');
    }
  };

  const hasApplied = (job) => {
    return job.applicants?.some(applicant => applicant.userId === currentUser?.uid);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'fullTime' && job.type === 'Full-time') return matchesSearch;
    if (filter === 'partTime' && job.type === 'Part-time') return matchesSearch;
    if (filter === 'internship' && job.type === 'Internship') return matchesSearch;
    if (filter === 'remote' && job.location.toLowerCase().includes('remote')) return matchesSearch;
    
    return false;
  });

  return (
    <div className="jobs-section">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Find Your Next Opportunity</h2>
          
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
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600 dark:text-gray-400">No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map(job => (
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
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{job.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    {job.applicationDeadline && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div>
                    {hasApplied(job) ? (
                      <span className="px-4 py-2 bg-green-500 text-white rounded-lg inline-block">Applied</span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs; 