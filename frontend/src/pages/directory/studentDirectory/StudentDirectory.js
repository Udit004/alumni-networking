import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import './StudentDirectory.css';

const StudentDirectory = () => {
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchStudentProfiles = async () => {
      setLoading(true);
      try {
        const studentQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student')
        );

        const querySnapshot = await getDocs(studentQuery);
        const profiles = [];

        querySnapshot.forEach((doc) => {
          profiles.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setStudentProfiles(profiles);
      } catch (err) {
        console.error('Error fetching student profiles:', err);
        setError('Failed to load student profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfiles();
  }, []);

  useEffect(() => {
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Monitor for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleProfileClick = (studentId) => {
    navigate(`/directory/student/${studentId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const filteredProfiles = studentProfiles.filter((profile) => {
    // First filter out the current user
    if (currentUser && profile.id === currentUser.uid) {
      return false;
    }

    // Then apply search term filter
    const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.year?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (Array.isArray(profile.interests) && profile.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase())));

    // Then apply dropdown filter
    if (filterOption === 'all') {
      return matchesSearch;
    } else if (filterOption === 'year') {
      return matchesSearch && profile.year?.toLowerCase().includes(filterOption);
    } else if (filterOption === 'major') {
      return matchesSearch && profile.major?.toLowerCase().includes(filterOption);
    } else if (filterOption === 'location') {
      return matchesSearch && profile.location?.toLowerCase().includes(filterOption);
    }

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-half bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen-half bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-200">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-tertiary text-white rounded-md hover:bg-opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Directory Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Find Students & Colleagues</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with fellow students to collaborate on projects, share resources, and build your academic network.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <button 
            onClick={() => navigate('/directory')} 
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center font-medium group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Find a Mentor
          </button>
          
          <button className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm flex items-center justify-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Browse Study Groups
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search & Filter</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Find students based on their interests, year, or major</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, major, year, or interests..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-tertiary dark:focus:ring-tertiary-light focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterOption}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tertiary dark:focus:ring-tertiary-light focus:border-transparent"
            >
              <option value="all">All Students</option>
              <option value="year">By Year</option>
              <option value="major">By Major</option>
              <option value="location">Local</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 px-1">
        <p className="text-gray-600 dark:text-gray-300">
          Showing <span className="font-medium">{filteredProfiles.length}</span> students
        </p>
      </div>

      {/* Student Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results Found</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We couldn't find any student profiles that match your search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 directory-card"
              onClick={() => handleProfileClick(student.id)}
            >
              <div className="h-2 bg-gradient-to-r from-tertiary to-tertiary-dark"></div>
              <div className="p-6">
                {/* Profile Image or Initials */}
                <div className="flex justify-center mb-5">
                  {student.photoURL ? (
                    <img
                      src={student.photoURL}
                      alt={student.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-tertiary shadow-md"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-tertiary to-tertiary-dark flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {student.name || 'Student Name'}
                  </h3>
                  <p className="text-tertiary dark:text-tertiary-light font-medium mb-1">
                    {student.year || 'Year'} • {student.institution || 'Institution'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {student.major || 'Major'}
                  </p>

                  {/* Interests/Tags */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {Array.isArray(student.interests) && student.interests.length > 0 ? (
                      <>
                        {student.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-tertiary/10 dark:bg-tertiary/20 text-tertiary-dark dark:text-tertiary-light text-xs rounded-full skill-tag font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                        {student.interests.length > 3 && (
                          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                            +{student.interests.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                        No interests listed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                <button className="text-tertiary dark:text-tertiary-light font-medium hover:underline flex items-center group">
                  <span>View Profile</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination - if needed in the future */}
      {filteredProfiles.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <span className="px-3 py-1 rounded-md bg-tertiary text-white">1</span>
            <button className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default StudentDirectory;