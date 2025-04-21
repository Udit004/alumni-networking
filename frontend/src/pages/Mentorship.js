import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MentorshipCourses from './MentorshipCourses';
import './Mentorship.css';

const Mentorship = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('mentorship'); // Default to mentorship tab
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Only fetch mentorships if the mentorship tab is active
    if (activeTab === 'mentorship') {
      fetchMentorships();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMentorships = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/mentorships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mentorships');
      }

      const data = await response.json();

      // Filter active mentorships and sort by date
      const activeMentorships = data.mentorships?.filter(m => m.status === 'active') || [];
      const sortedMentorships = activeMentorships.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMentorships(sortedMentorships);

    } catch (err) {
      setError('Failed to load mentorship programs. Please try again.');
      console.error('Error fetching mentorships:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredMentorships = mentorships.filter((mentorship) => {
    // Search filter
    const matchesSearch = mentorship.title.toLowerCase().includes(search.toLowerCase()) ||
                         mentorship.description.toLowerCase().includes(search.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (category !== 'all') {
      matchesCategory = mentorship.category === category;
    }

    return matchesSearch && matchesCategory;
  });

  // Handle tab switching
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="mentorship-page">
      {/* Tabs for switching between Mentorship and Courses */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => handleTabClick('mentorship')}
                className={`inline-block py-4 px-4 text-sm font-medium ${
                  activeTab === 'mentorship'
                    ? 'text-primary dark:text-primary-light border-b-2 border-primary dark:border-primary-light'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Mentorship Programs
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => handleTabClick('courses')}
                className={`inline-block py-4 px-4 text-sm font-medium ${
                  activeTab === 'courses'
                    ? 'text-secondary dark:text-secondary-light border-b-2 border-secondary dark:border-secondary-light'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Courses
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Render content based on active tab */}
      {activeTab === 'courses' ? (
        <MentorshipCourses />
      ) : (
        <>
          <div className="hero-section mentorship-hero text-center py-16 px-4">
            <h1 className="text-4xl font-bold text-white mb-4">Find Your Mentor</h1>
            <p className="text-xl text-white mb-8">Connect with experienced professionals ready to guide you</p>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search mentorship programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
          </div>

          <button
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={fetchMentorships}
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
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Mentorship Programs</h2>

          {currentUser && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/${role.toLowerCase()}-dashboard`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>My Dashboard</span>
              </button>

              {/* Allow both alumni and teachers to create mentorship programs */}
              {(role === 'alumni' || role === 'teacher') && (
                <button
                  onClick={() => navigate('/create-mentorship')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>Create Mentorship Program</span> <span>➕</span>
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
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'all'}
                      onChange={() => setCategory('all')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">All Categories</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'Career Development'}
                      onChange={() => setCategory('Career Development')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Career Development</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'Technical Skills'}
                      onChange={() => setCategory('Technical Skills')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Technical Skills</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'Leadership'}
                      onChange={() => setCategory('Leadership')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Leadership</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'Entrepreneurship'}
                      onChange={() => setCategory('Entrepreneurship')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Entrepreneurship</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'Academic'}
                      onChange={() => setCategory('Academic')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Academic</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'Personal Growth'}
                      onChange={() => setCategory('Personal Growth')}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Personal Growth</span>
                  </label>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setCategory('all');
                    setSearch('');
                  }}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Mentorship Listings */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">Loading mentorship programs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error loading mentorship programs</h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : filteredMentorships.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No mentorship programs found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {search || category !== 'all' ? "Try adjusting your search criteria" : "No mentorship programs have been posted yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredMentorships.map((mentorship) => (
                  <div
                    key={mentorship._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-2xl">
                            🎓
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                  <a
                                    href={`/mentorship/${mentorship._id}`}
                                    className="hover:text-primary dark:hover:text-primary-light"
                                  >
                                    {mentorship.title}
                                  </a>
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">{mentorship.category}</p>
                              </div>

                              <div className="mt-2 sm:mt-0">
                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                  Active
                                </span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{mentorship.description}</p>
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">⏱️</span>
                                <span className="text-sm">{mentorship.commitment} for {mentorship.duration}</span>
                              </div>

                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">🧠</span>
                                <span className="text-sm">{mentorship.skills}</span>
                              </div>

                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">👥</span>
                                <span className="text-sm">
                                  {mentorship.mentees}/{mentorship.maxMentees} spots filled
                                  {mentorship.mentees >= mentorship.maxMentees && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                      Full
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <span className="text-sm mr-2">📅</span>
                                <span className="text-sm">Started on {formatDate(mentorship.createdAt)}</span>
                              </div>
                            </div>

                            <div className="mt-6">
                              <a
                                href={`/mentorship/${mentorship._id}`}
                                className="inline-block px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                              >
                                View Details
                              </a>

                              {/* Only students can apply as mentees */}
                              {currentUser && role === 'student' && (
                                mentorship.status !== 'active' ? (
                                  <button
                                    className="inline-block ml-3 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                                    disabled
                                  >
                                    Program Completed
                                  </button>
                                ) : mentorship.mentees >= mentorship.maxMentees ? (
                                  <button
                                    className="inline-block ml-3 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                                    disabled
                                  >
                                    Program Full
                                  </button>
                                ) : (
                                  <button
                                    className="inline-block ml-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                    onClick={() => navigate(`/mentorship/${mentorship._id}/apply`)}
                                  >
                                    Apply as Mentee
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

            {filteredMentorships.length > 0 && filteredMentorships.length < mentorships.length && (
              <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                Showing {filteredMentorships.length} of {mentorships.length} mentorship programs
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Mentorship;