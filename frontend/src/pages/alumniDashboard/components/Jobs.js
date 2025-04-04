import React, { useState } from 'react';

const Jobs = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('jobListings');
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Sample job listings data
  const jobListings = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      logo: '💻',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      description: 'We are seeking an experienced Full Stack Developer to join our growing team...',
      category: 'Engineering',
      applications: 18,
      saved: true
    },
    {
      id: 2,
      title: 'Product Marketing Manager',
      company: 'Innovate Inc.',
      location: 'Remote',
      type: 'Full-time',
      salary: '$90,000 - $110,000',
      posted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      logo: '📊',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      skills: ['Product Marketing', 'Market Research', 'SEO', 'Campaign Management'],
      description: 'Join our marketing team to develop and execute product marketing strategies...',
      category: 'Marketing',
      applications: 24,
      saved: false
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'DesignHub',
      location: 'San Francisco, CA',
      type: 'Contract',
      salary: '$70 - $90 per hour',
      posted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      logo: '🎨',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      description: 'DesignHub is looking for a talented UX/UI Designer to create beautiful, functional interfaces...',
      category: 'Design',
      applications: 36,
      saved: true
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'Analytics Pro',
      location: 'Boston, MA',
      type: 'Full-time',
      salary: '$110,000 - $140,000',
      posted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      logo: '📈',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      skills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization'],
      description: 'We are looking for a Data Scientist to analyze complex data and develop predictive models...',
      category: 'Data Science',
      applications: 42,
      saved: false
    },
    {
      id: 5,
      title: 'Project Manager',
      company: 'Global Systems',
      location: 'Chicago, IL',
      type: 'Part-time',
      salary: '$45 - $55 per hour',
      posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      logo: '📋',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      skills: ['Project Management', 'Agile', 'Budgeting', 'Stakeholder Management'],
      description: 'Seeking an experienced Project Manager to oversee technology implementation projects...',
      category: 'Management',
      applications: 15,
      saved: false
    }
  ];

  // Sample posted jobs data
  const postedJobs = [
    {
      id: 101,
      title: 'Junior Web Developer',
      company: 'My Company',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70,000 - $85,000',
      posted: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      views: 156,
      applications: 23,
      status: 'active'
    },
    {
      id: 102,
      title: 'Marketing Intern',
      company: 'My Company',
      location: 'New York, NY',
      type: 'Internship',
      salary: '$25 per hour',
      posted: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      views: 89,
      applications: 12,
      status: 'expired'
    }
  ];

  // Sample job applications data
  const applications = [
    {
      id: 201,
      jobTitle: 'Frontend Developer',
      company: 'WebTech Solutions',
      appliedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: 'Applied',
      logo: '🌐',
      notes: 'Phone interview scheduled for next week'
    },
    {
      id: 202,
      jobTitle: 'Product Manager',
      company: 'Innovate Labs',
      appliedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'Interview',
      logo: '🔍',
      nextStep: 'Second interview on ' + new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      notes: 'Prepare presentation on product strategy'
    },
    {
      id: 203,
      jobTitle: 'Senior Developer',
      company: 'TechGiant Inc.',
      appliedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      status: 'Rejected',
      logo: '💻',
      notes: 'Position was filled internally'
    }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const toggleSave = (jobId) => {
    // In a real application, this would update the state and send a request to the server
    console.log(`Toggle save for job ${jobId}`);
  };

  // Filter job listings based on search, location, category, and type
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.company.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === '' || job.location.includes(locationFilter);
    const matchesCategory = categoryFilter === '' || job.category === categoryFilter;
    const matchesType = typeFilter === '' || job.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesCategory && matchesType;
  });

  const categories = ['Engineering', 'Marketing', 'Design', 'Data Science', 'Management'];
  const locations = ['New York, NY', 'San Francisco, CA', 'Boston, MA', 'Chicago, IL', 'Remote'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  return (
    <div className="jobs-section space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('jobListings')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'jobListings'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Job Listings
            </button>
            <button
              onClick={() => setActiveTab('myApplications')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'myApplications'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Applications
            </button>
            <button
              onClick={() => setActiveTab('savedJobs')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'savedJobs'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Saved Jobs
            </button>
            <button
              onClick={() => setActiveTab('postedJobs')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'postedJobs'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Jobs I've Posted
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'jobListings' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Job Opportunities</h2>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                  <span>Post a Job</span> <span>➕</span>
                </button>
              </div>
              
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search job title, company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="">All Job Types</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-6">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No jobs match your search criteria</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <div 
                      key={job.id}
                      className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                          {job.logo}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{job.company} • {job.location}</p>
                            </div>
                            
                            <div className="mt-2 sm:mt-0 flex items-center gap-4">
                              <span 
                                className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              >
                                {job.type}
                              </span>
                              <button 
                                onClick={() => toggleSave(job.id)}
                                className="text-xl"
                              >
                                {job.saved ? '⭐' : '☆'}
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">💰</span>
                              <span className="text-sm">{job.salary}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">📅</span>
                              <span className="text-sm">Posted {getTimeAgo(job.posted)} • Apply by {formatDate(job.deadline)}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.skills.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {job.applications} people have applied
                            </span>
                            
                            <div className="flex gap-2">
                              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                                Apply Now
                              </button>
                              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {filteredJobs.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors">
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'myApplications' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Job Applications</h2>
              </div>
              
              {applications.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No job applications yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start applying for jobs to track your applications here</p>
                  <button 
                    onClick={() => setActiveTab('jobListings')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Browse Job Listings
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div 
                      key={application.id}
                      className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
                      style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                          {application.logo}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{application.jobTitle}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{application.company}</p>
                            </div>
                            
                            <div className="mt-2 sm:mt-0">
                              <span className={`px-3 py-1 text-xs rounded-full ${
                                application.status === 'Applied' 
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                                  : application.status === 'Interview'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              }`}>
                                {application.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">📅</span>
                              <span className="text-sm">Applied on {formatDate(application.appliedDate)}</span>
                            </div>
                            
                            {application.nextStep && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">📌</span>
                                <span className="text-sm">Next: {application.nextStep}</span>
                              </div>
                            )}
                            
                            {application.notes && (
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">📝</span>
                                <span className="text-sm">{application.notes}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 flex justify-end gap-2">
                            <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300">
                              View Job
                            </button>
                            {application.status !== 'Rejected' && (
                              <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                                Update Status
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'savedJobs' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Saved Jobs</h2>
              </div>
              
              {jobListings.filter(job => job.saved).length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No saved jobs yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Save jobs by clicking the star icon</p>
                  <button 
                    onClick={() => setActiveTab('jobListings')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Browse Job Listings
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobListings.filter(job => job.saved).map((job) => (
                    <div 
                      key={job.id}
                      className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
                      style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                          {job.logo}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{job.company} • {job.location}</p>
                            </div>
                            
                            <div className="mt-2 sm:mt-0 flex items-center gap-4">
                              <span 
                                className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              >
                                {job.type}
                              </span>
                              <button 
                                onClick={() => toggleSave(job.id)}
                                className="text-xl"
                              >
                                ⭐
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">💰</span>
                              <span className="text-sm">{job.salary}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="text-sm mr-2">📅</span>
                              <span className="text-sm">Apply by {formatDate(job.deadline)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-end gap-2">
                            <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300">
                              View Details
                            </button>
                            <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'postedJobs' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Jobs I've Posted</h2>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                  <span>Post a Job</span> <span>➕</span>
                </button>
              </div>
              
              {postedJobs.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">💼</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">You haven't posted any jobs yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create job listings to find talented candidates</p>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Posted
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Stats
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {postedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{job.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{job.type}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{job.salary}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(job.posted)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{getTimeAgo(job.posted)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(job.deadline)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{job.views} views</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{job.applications} applications</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              job.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {job.status === 'active' ? 'Active' : 'Expired'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex gap-2">
                              <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                View
                              </button>
                              <span className="text-gray-300 dark:text-gray-600">|</span>
                              <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                Edit
                              </button>
                              <span className="text-gray-300 dark:text-gray-600">|</span>
                              <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                {job.status === 'active' ? 'Close' : 'Repost'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs; 