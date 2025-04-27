import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import './TeacherDirectory.css';

const TeacherDirectory = () => {
  const [teacherProfiles, setTeacherProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTeacherProfiles = async () => {
      setLoading(true);
      try {
        const teacherQuery = query(
          collection(db, 'users'),
          where('role', '==', 'teacher')
        );

        const querySnapshot = await getDocs(teacherQuery);
        const profiles = [];

        querySnapshot.forEach((doc) => {
          profiles.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setTeacherProfiles(profiles);
      } catch (err) {
        console.error('Error fetching teacher profiles:', err);
        setError('Failed to load teacher profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfiles();
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

  const handleProfileClick = (teacherId) => {
    navigate(`/directory/teacher/${teacherId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const filteredProfiles = teacherProfiles.filter((profile) => {
    // First filter out the current user
    if (currentUser && profile.id === currentUser.uid) {
      return false;
    }

    // Then apply search term filter
    const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(profile.subjects) && profile.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())));

    // Then apply dropdown filter
    if (filterOption === 'all') {
      return matchesSearch;
    } else if (filterOption === 'department') {
      return matchesSearch && profile.department?.toLowerCase().includes(filterOption);
    } else if (filterOption === 'experience') {
      // Filter by experience (over 10 years)
      return matchesSearch && profile.yearsOfExperience && profile.yearsOfExperience >= 10;
    } else if (filterOption === 'location') {
      return matchesSearch && profile.location?.toLowerCase().includes(filterOption);
    }

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-half bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
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
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-md hover:bg-opacity-90"
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Meet Our Faculty</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with professors and instructors, find subject matter experts, and discover research opportunities.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <button 
            onClick={() => navigate('/events')}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md flex items-center justify-center font-medium group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Faculty Office Hours
          </button>
          
          <button className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm flex items-center justify-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Research Opportunities
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search & Filter</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Find faculty by name, department, title, or subjects</p>
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
              placeholder="Search by name, department, title, or subjects..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-light focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterOption}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary dark:focus:ring-secondary-light focus:border-transparent"
            >
              <option value="all">All Teachers</option>
              <option value="department">By Department</option>
              <option value="experience">Experienced (10+ years)</option>
              <option value="location">Local</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 px-1">
        <p className="text-gray-600 dark:text-gray-300">
          Showing <span className="font-medium">{filteredProfiles.length}</span> faculty members
        </p>
      </div>

      {/* Teacher Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results Found</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We couldn't find any faculty profiles that match your search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 directory-card"
              onClick={() => handleProfileClick(teacher.id)}
            >
              <div className="h-2 bg-gradient-to-r from-secondary to-secondary-dark"></div>
              <div className="p-6">
                {/* Profile Image or Initials */}
                <div className="flex justify-center mb-5">
                  {teacher.photoURL ? (
                    <img
                      src={teacher.photoURL}
                      alt={teacher.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-secondary shadow-md"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                      {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                </div>

                {/* Teacher Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {teacher.name || 'Teacher Name'}
                  </h3>
                  <p className="text-secondary dark:text-secondary-light font-medium mb-1">
                    {teacher.title || 'Title'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {teacher.department || 'Department'}
                  </p>

                  {/* Subjects/Tags */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {Array.isArray(teacher.subjects) && teacher.subjects.length > 0 ? (
                      <>
                        {teacher.subjects.slice(0, 3).map((subject, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-secondary/10 dark:bg-secondary/20 text-secondary-dark dark:text-secondary-light text-xs rounded-full skill-tag font-medium"
                          >
                            {subject}
                          </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                            +{teacher.subjects.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                        No subjects listed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                <button className="text-secondary dark:text-secondary-light font-medium hover:underline flex items-center group">
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
            <span className="px-3 py-1 rounded-md bg-secondary text-white">1</span>
            <button className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default TeacherDirectory;