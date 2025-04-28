import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import './AlumniDirectory.css';

const AlumniDirectory = () => {
  const [alumniProfiles, setAlumniProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAlumniProfiles = async () => {
      setLoading(true);
      try {
        const alumniQuery = query(
          collection(db, 'users'),
          where('role', '==', 'alumni')
        );

        const querySnapshot = await getDocs(alumniQuery);
        const profiles = [];

        querySnapshot.forEach((doc) => {
          profiles.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setAlumniProfiles(profiles);
      } catch (err) {
        console.error('Error fetching alumni profiles:', err);
        setError('Failed to load alumni profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniProfiles();
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

  const handleProfileClick = (alumniId) => {
    navigate(`/directory/alumni/${alumniId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const filteredProfiles = alumniProfiles.filter((profile) => {
    // First filter out the current user
    if (currentUser && profile.id === currentUser.uid) {
      return false;
    }

    // Then apply search term filter
    const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(profile.skills) && profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));

    // Then apply dropdown filter
    if (filterOption === 'all') {
      return matchesSearch;
    } else if (filterOption === 'industry') {
      // You can customize these filters based on your data structure
      const techIndustries = ['software', 'it', 'technology', 'tech'];
      return matchesSearch &&
             (profile.industry?.toLowerCase().includes(filterOption) ||
              techIndustries.some(industry => profile.industry?.toLowerCase().includes(industry)));
    } else if (filterOption === 'graduation-year') {
      // Filter by recent graduates (last 5 years)
      const currentYear = new Date().getFullYear();
      const graduationYear = profile.education?.[0]?.endYear;
      return matchesSearch && graduationYear && currentYear - graduationYear <= 5;
    } else if (filterOption === 'location') {
      // You can customize these filters based on your location data
      return matchesSearch && profile.location?.toLowerCase().includes(filterOption);
    }

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-half bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen-half bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect with Alumni</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Network with graduates working in your field of interest, find mentors, and discover career opportunities.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <button 
            onClick={() => window.open('mailto:career@university.edu', '_blank')}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center font-medium group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Contact Career Services
          </button>
          
          <button className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm flex items-center justify-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Upcoming Alumni Events
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search & Filter</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Find alumni by name, company, job title, or skills</p>
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
              placeholder="Search by name, company, job title, or skills..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterOption}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent"
            >
              <option value="all">All Alumni</option>
              <option value="industry">Tech Industry</option>
              <option value="graduation-year">Recent Graduates</option>
              <option value="location">Local</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 px-1">
        <p className="text-gray-600 dark:text-gray-300">
          Showing <span className="font-medium">{filteredProfiles.length}</span> alumni
        </p>
      </div>

      {/* Alumni Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results Found</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We couldn't find any alumni profiles that match your search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((alumni) => (
            <div
              key={alumni.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 directory-card"
              onClick={() => handleProfileClick(alumni.id)}
            >
              <div className="h-2 bg-gradient-to-r from-primary to-primary-dark"></div>
              <div className="p-6">
                {/* Profile Image or Initials */}
                <div className="flex justify-center mb-5">
                  {alumni.photoURL ? (
                    <img
                      src={alumni.photoURL}
                      alt={alumni.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary shadow-md"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                      {alumni.name ? alumni.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </div>

                {/* Alumni Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {alumni.name || 'Alumni Name'}
                  </h3>
                  <p className="text-primary dark:text-primary-light font-medium mb-1">
                    {alumni.jobTitle || 'Position'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {alumni.company || 'Company'}
                  </p>

                  {/* Skills/Tags */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {Array.isArray(alumni.skills) && alumni.skills.length > 0 ? (
                      <>
                        {alumni.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light text-xs rounded-full skill-tag font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {alumni.skills.length > 3 && (
                          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                            +{alumni.skills.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                        No skills listed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                <button className="text-primary dark:text-primary-light font-medium hover:underline flex items-center group">
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
            <span className="px-3 py-1 rounded-md bg-primary text-white">1</span>
            <button className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;