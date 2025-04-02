import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import './StudentProfile.css';

const StudentProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profileData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          // Verify this is a student profile
          if (profileData.role !== 'student') {
            setError('This user is not a student.');
          } else {
            setProfile(profileData);
          }
        } else {
          setError('Student profile not found.');
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError('Failed to load student profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentProfile();
    }
  }, [id]);

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

  const handleConnect = () => {
    // Implement connection request functionality
    console.log('Connection request sent to:', profile.name);
    // In a real app, you would send a connection request to the backend
    alert(`Connection request sent to ${profile.name}`);
  };

  const handleMessage = () => {
    // Implement messaging functionality
    console.log('Navigate to message with:', profile.name);
    // In a real app, you would navigate to a messaging interface
    alert(`Message feature with ${profile.name} would open here`);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => navigate('/directory/student')} 
            className="mt-4 px-4 py-2 bg-tertiary text-white rounded-md hover:bg-opacity-90"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Not Found</h2>
          <p className="text-gray-700 dark:text-gray-300">The requested student profile could not be found.</p>
          <button 
            onClick={() => navigate('/directory/student')} 
            className="mt-4 px-4 py-2 bg-tertiary text-white rounded-md hover:bg-opacity-90"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/directory/student')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-tertiary dark:hover:text-tertiary-light"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Directory
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-2 bg-tertiary">
            {/* Decorative header */}
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Profile Image */}
              <div className="mb-4 md:mb-0 md:mr-6">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.name} 
                    className="h-32 w-32 rounded-full object-cover border-2 border-tertiary"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-tertiary flex items-center justify-center text-white text-4xl font-semibold">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.name || 'Student Name'}
                </h1>
                <p className="text-xl text-tertiary dark:text-tertiary-light font-medium mt-1">
                  {profile.year || 'Year'} Student
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {profile.major && `${profile.major}`} {profile.location && `• ${profile.location}`}
                </p>
                
                {/* Interest Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.isArray(profile.interests) && profile.interests.length > 0 ? (
                    profile.interests.map((interest, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full skill-tag"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                      No interests listed
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 md:mt-0 md:ml-6 flex flex-col space-y-2">
                <button 
                  onClick={handleConnect}
                  className="px-4 py-2 bg-tertiary text-white rounded-md hover:bg-opacity-90 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Connect
                </button>
                <button 
                  onClick={handleMessage}
                  className="px-4 py-2 border border-tertiary text-tertiary dark:text-tertiary-light rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => handleSectionChange('overview')}
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
                activeSection === 'overview'
                  ? 'text-tertiary dark:text-tertiary-light border-b-2 border-tertiary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => handleSectionChange('education')}
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
                activeSection === 'education'
                  ? 'text-tertiary dark:text-tertiary-light border-b-2 border-tertiary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Education
            </button>
            <button 
              onClick={() => handleSectionChange('projects')}
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
                activeSection === 'projects'
                  ? 'text-tertiary dark:text-tertiary-light border-b-2 border-tertiary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Projects
            </button>
            <button 
              onClick={() => handleSectionChange('activities')}
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
                activeSection === 'activities'
                  ? 'text-tertiary dark:text-tertiary-light border-b-2 border-tertiary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Activities
            </button>
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {profile.bio || 'No bio information available.'}
              </p>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{profile.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                      <p className="text-gray-900 dark:text-white">
                        {profile.website ? (
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-tertiary dark:text-tertiary-light hover:underline"
                          >
                            {profile.website}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-gray-900 dark:text-white">{profile.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
              
              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{edu.degree}</h3>
                          <p className="text-tertiary dark:text-tertiary-light">{edu.institution}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 md:mt-0">
                          {edu.startYear} - {edu.endYear || 'Present'}
                          {edu.location && ` • ${edu.location}`}
                        </p>
                      </div>
                      {edu.major && (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          Major: {edu.major}
                        </p>
                      )}
                      {edu.minor && (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          Minor: {edu.minor}
                        </p>
                      )}
                      {edu.gpa && (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          GPA: {edu.gpa}
                        </p>
                      )}
                      {edu.description && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No education information available.</p>
              )}
            </div>
          )}

          {activeSection === 'projects' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>
              
              {profile.projects && profile.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-750 rounded-lg overflow-hidden shadow-sm">
                      {project.imageUrl && (
                        <img 
                          src={project.imageUrl} 
                          alt={project.title} 
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.date}</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">{project.description}</p>
                        
                        {project.skills && project.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Array.isArray(project.skills) ? project.skills.map((skill, skillIndex) => (
                              <span 
                                key={skillIndex} 
                                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            )) : (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                Skills not specified
                              </span>
                            )}
                          </div>
                        )}
                        
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-4 inline-block text-tertiary dark:text-tertiary-light hover:underline"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No project information available.</p>
              )}
            </div>
          )}

          {activeSection === 'activities' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Extracurricular Activities</h2>
              
              {profile.activities && profile.activities.length > 0 ? (
                <div className="space-y-6">
                  {profile.activities.map((activity, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{activity.name}</h3>
                          <p className="text-tertiary dark:text-tertiary-light">{activity.role}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 md:mt-0">
                          {activity.startDate} - {activity.endDate || 'Present'}
                        </p>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {activity.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No extracurricular activities information available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 