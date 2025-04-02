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
    // First apply search term filter
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
      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, company, job title, or skills..."
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
            <option value="all">All Alumni</option>
            <option value="industry">Tech Industry</option>
            <option value="graduation-year">Recent Graduates</option>
            <option value="location">Local</option>
          </select>
        </div>
      </div>

      {/* Alumni Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No alumni profiles match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((alumni) => (
            <div 
              key={alumni.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:-translate-y-1 transition-transform directory-card"
              onClick={() => handleProfileClick(alumni.id)}
            >
              <div className="p-1 bg-gradient-to-r from-primary to-primary-dark">
                {/* Decorative header - custom gradient for alumni */}
              </div>
              <div className="p-6">
                {/* Profile Image or Initials */}
                <div className="flex justify-center mb-4">
                  {alumni.photoURL ? (
                    <img 
                      src={alumni.photoURL} 
                      alt={alumni.name} 
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-semibold">
                      {alumni.name ? alumni.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </div>
                
                {/* Alumni Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {alumni.name || 'Alumni Name'}
                  </h3>
                  <p className="text-primary dark:text-primary-light font-medium">
                    {alumni.jobTitle || 'Position'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {alumni.company || 'Company'}
                  </p>
                  
                  {/* Skills/Tags */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {Array.isArray(alumni.skills) && alumni.skills.length > 0 ? (
                      <>
                        {alumni.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full skill-tag"
                          >
                            {skill}
                          </span>
                        ))}
                        {alumni.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{alumni.skills.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        No skills listed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-center border-t border-gray-100 dark:border-gray-700">
                <button className="text-primary dark:text-primary-light font-medium hover:underline flex items-center">
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

export default AlumniDirectory; 