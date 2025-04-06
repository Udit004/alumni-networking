import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ profileData = {}, currentUser, isDarkMode }) => {
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);

  const handleEditProfile = () => {
    navigate('/profile');
  };

  // Generate initial for avatar
  const getInitial = () => {
    return profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'T';
  };

  // Format skills/expertise for display
  const formatExpertise = (expertise) => {
    if (!expertise) return [];
    if (Array.isArray(expertise)) return expertise;
    return expertise.split(',').map(skill => skill.trim());
  };

  // Function to show truncated bio with read more option
  const renderBio = (bio) => {
    if (!bio) return <p className="text-gray-600 dark:text-gray-300">No bio information provided.</p>;
    
    const maxLength = 150;
    if (bio.length <= maxLength || showFullBio) {
      return <p className="text-gray-600 dark:text-gray-300">{bio}</p>;
    }
    
    return (
      <>
        <p className="text-gray-600 dark:text-gray-300">{bio.substring(0, maxLength)}...</p>
        <button 
          onClick={() => setShowFullBio(true)}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 text-sm font-medium mt-1"
        >
          Read more
        </button>
      </>
    );
  };

  return (
    <div className="profile-container">
      {/* Cover image/banner */}
      <div className="relative rounded-xl overflow-hidden h-48 mb-16">
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 absolute"></div>
        
        {/* Profile avatar - positioned to overlap the banner */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg">
              {profileData?.photoURL ? (
                <img 
                  src={profileData.photoURL} 
                  alt={`${profileData?.displayName || 'User'}'s avatar`} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-4xl font-bold text-blue-500">
                  {(profileData?.displayName?.charAt(0) || 'T').toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Edit overlay button for profile picture */}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center text-white shadow-md hover:bg-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Edit Cover button */}
        <button className="absolute top-4 right-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm transition shadow-sm">
          Edit Cover
        </button>
      </div>

      {/* Main profile content */}
      <div className="pl-8 pr-8">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-6 sm:mt-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profileData?.name || 'Faculty Member'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {profileData?.designation || 'Professor'} at {profileData?.department || 'Department'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {profileData?.email || 'Email not provided'}
            </p>
          </div>
          
          <button className="mt-4 sm:mt-0 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
            <span className="font-medium">Designation:</span> {profileData?.designation || 'N/A'}
          </div>
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
            <span className="font-medium">Department:</span> {profileData?.department || 'N/A'}
          </div>
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
            <span className="font-medium">Institution:</span> {profileData?.institution || 'N/A'}
          </div>
        </div>

        {/* Profile content in sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* About section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              About
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              {renderBio(profileData?.bio || '')}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-800 dark:text-gray-200 break-all">{profileData?.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Office Phone</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Office Location</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Research Profile</p>
                {profileData?.linkedIn && (
                  <a 
                    href={profileData.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  >
                    View Research Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Professional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              Professional Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Designation</p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{profileData?.designation || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.department || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.experience || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.joined || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Publications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Publications
            </h2>
            <div className="space-y-3">
              {profileData?.publications && profileData.publications.length > 0 ? (
                profileData.publications.map((publication, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                    <p className="text-gray-800 dark:text-gray-200">{publication.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{publication.journal}, {publication.year}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No publications listed</p>
              )}
              {profileData?.publications && profileData.publications.length > 0 && (
                <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 text-sm mt-2">
                  View all publications
                </button>
              )}
            </div>
          </div>

          {/* Areas of Expertise */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {formatExpertise(profileData?.expertise).length > 0 ? (
                formatExpertise(profileData.expertise).map((area, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No areas of expertise listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Office Hours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileData?.officeHours && profileData.officeHours.length > 0 ? (
              profileData.officeHours.map((hours, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{hours.day}</p>
                  <p className="text-gray-600 dark:text-gray-300">{hours.time}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">No office hours listed</p>
            )}
          </div>
        </div>

        {/* Connect button at bottom */}
        <div className="flex justify-center mb-8">
          <button className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 