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
      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, department, title, or subjects..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={filterOption}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Teachers</option>
            <option value="department">By Department</option>
            <option value="experience">Experienced (10+ years)</option>
            <option value="location">Local</option>
          </select>
        </div>
      </div>

      {/* Teacher Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No teacher profiles match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:-translate-y-1 transition-transform directory-card"
              onClick={() => handleProfileClick(teacher.id)}
            >
              <div className="p-1 bg-gradient-to-r from-secondary to-secondary-dark">
                {/* Decorative header - custom gradient for teachers */}
              </div>
              <div className="p-6">
                {/* Profile Image or Initials */}
                <div className="flex justify-center mb-4">
                  {teacher.photoURL ? (
                    <img
                      src={teacher.photoURL}
                      alt={teacher.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-secondary"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center text-white text-2xl font-semibold">
                      {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                </div>

                {/* Teacher Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {teacher.name || 'Teacher Name'}
                  </h3>
                  <p className="text-secondary dark:text-secondary-light font-medium">
                    {teacher.title || 'Title'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {teacher.department || 'Department'}
                  </p>

                  {/* Subjects/Tags */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {Array.isArray(teacher.subjects) && teacher.subjects.length > 0 ? (
                      <>
                        {teacher.subjects.slice(0, 3).map((subject, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full skill-tag"
                          >
                            {subject}
                          </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{teacher.subjects.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        No subjects listed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-center border-t border-gray-100 dark:border-gray-700">
                <button className="text-secondary dark:text-secondary-light font-medium hover:underline flex items-center">
                  <span>View Profile</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDirectory;