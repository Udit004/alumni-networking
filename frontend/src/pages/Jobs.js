import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');
  const { currentUser, userData, role } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();

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
                         job.company.toLowerCase().includes(search.toLowerCase()) ||
                         job.description.toLowerCase().includes(search.toLowerCase());

    // Job type filter
    let matchesType = true;
    if (filter !== 'all') {
      matchesType = job.type.toLowerCase() === filter.toLowerCase();
    }

    return matchesSearch && matchesType;
  });

  return (
    <div className="jobs-page">
      <div className="hero-section jobs-hero text-center py-16 px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Find Your Next Opportunity</h1>
        <p className="text-xl text-white mb-8">Explore job opportunities posted by alumni and our partners</p>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
          </div>

          <button
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={fetchJobs}
          >
            <span>Search</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Available Jobs</h2>

          {currentUser && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/${role.toLowerCase()}-dashboard`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>My Dashboard</span>
              </button>

              {/* Only alumni can create jobs */}
              {role === 'alumni' && (
                <button
                  onClick={() => navigate('/create-job')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>Post a Job</span> <span>➕</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <div className="md:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Filters</h3>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Job Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="jobType"
                      checked={filter === 'all'}
                      onChange={() => setFilter('all')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">All Types</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="jobType"
                      checked={filter === 'full-time'}
                      onChange={() => setFilter('full-time')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Full-time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="jobType"
                      checked={filter === 'part-time'}
                      onChange={() => setFilter('part-time')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Part-time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="jobType"
                      checked={filter === 'contract'}
                      onChange={() => setFilter('contract')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Contract</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="jobType"
                      checked={filter === 'internship'}
                      onChange={() => setFilter('internship')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Internship</span>
                  </label>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearch('');
                  }}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error loading jobs</h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No jobs found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {search ? "Try adjusting your search criteria" : "No jobs have been posted yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                            💼
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                  <a
                                    href={`/jobs/${job._id}`}
                                    className="hover:text-primary dark:hover:text-primary-light"
                                  >
                                    {job.title}
                                  </a>
                                </h3>
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
                            </div>

                            <div className="mt-6">
                              <a
                                href={`/jobs/${job._id}`}
                                className="inline-block px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                              >
                                View Details
                              </a>

                              {/* Only students can apply for jobs that haven't expired */}
                              {currentUser && role === 'student' && (
                                getDaysRemaining(job.applicationDeadline) === "Expired" ? (
                                  <button
                                    className="inline-block ml-3 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                                    disabled
                                  >
                                    Application Closed
                                  </button>
                                ) : (
                                  <button
                                    className="inline-block ml-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                    onClick={() => navigate(`/jobs/${job._id}/apply`)}
                                  >
                                    Apply Now
                                  </button>
                                )
                              )}
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
      </div>
    </div>
  );
};

export default Jobs;