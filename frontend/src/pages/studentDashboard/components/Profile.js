import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ user, isDarkMode }) => {
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);

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
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={`${user?.displayName || 'User'}'s avatar`} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-4xl font-bold text-blue-500">
                  {(user?.displayName?.charAt(0) || 'S').toUpperCase()}
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
              {user?.displayName || 'Student User'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              Student at {user?.institution || 'University'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {user?.email || 'Email not provided'}
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
            <span className="font-medium">Batch:</span> {user?.graduationYear || 'N/A'}
          </div>
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
            <span className="font-medium">Program:</span> {user?.program || 'N/A'}
          </div>
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
            <span className="font-medium">Year:</span> {user?.currentYear || 'N/A'}
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
              {renderBio(user?.bio || '')}
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
                <p className="text-gray-800 dark:text-gray-200 break-all">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-800 dark:text-gray-200">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                <p className="text-gray-800 dark:text-gray-200">{user?.studentId || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Social Media</p>
                {user?.socialMedia ? (
                  <a 
                    href={user.socialMedia.startsWith('http') ? user.socialMedia : `https://${user.socialMedia}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  >
                    {user.socialMedia}
                  </a>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Academic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Academic Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{user?.program || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Year/Semester</p>
                <p className="text-gray-800 dark:text-gray-200">{user?.currentYear || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Institution</p>
                <p className="text-gray-800 dark:text-gray-200">{user?.institution || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">GPA/Academic Standing</p>
                <p className="text-gray-800 dark:text-gray-200">{user?.gpa || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Areas of Interest */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              Areas of Interest
            </h2>
            <div className="flex flex-wrap gap-2">
              {user?.interests && user.interests.length > 0 ? (
                user.interests.map((interest, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No interests listed</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No skills listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Find a Mentor button at bottom */}
        <div className="flex justify-center mb-8">
          <button className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Find a Mentor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 