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
    return profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'A';
  };

  // Format skills for display
  const formatSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return skills.split(',').map(skill => skill.trim());
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
      {/* Cover image/banner with adjusted positioning */}
      <div className="relative rounded-xl overflow-hidden h-48 mb-16">
        {/* Gradient banner background */}
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 absolute">
          {/* Name and role overlay on banner */}
          <div className="absolute bottom-4 left-48 text-white">
            <h1 className="text-3xl font-bold">
              {profileData?.name || 'Alumni User'}
            </h1>
            <p className="text-lg opacity-90">
              {profileData?.currentPosition || profileData?.jobTitle || 'Position not specified'}
            </p>
          </div>
        </div>

        {/* Profile avatar - positioned to overlap the banner */}
        <div className="absolute top-1/2 transform -translate-y-1/2 left-8">
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
                  {getInitial()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Cover button */}
        <button className="absolute top-4 right-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm transition shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Banner
        </button>
      </div>

      {/* Main profile content */}
      <div className="pl-8 pr-8">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-6 sm:mt-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profileData?.name || 'Alumni User'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {profileData?.currentPosition || profileData?.jobTitle || 'Position not specified'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {profileData?.email || 'Email not provided'}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 sm:mt-0 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>

        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
            <span className="font-medium">Graduation:</span> {profileData?.graduationYear || 'N/A'}
          </div>
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
            <span className="font-medium">Program:</span> {profileData?.program || 'N/A'}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.location || profileData?.address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                {profileData?.linkedIn ? (
                  <a
                    href={profileData.linkedIn.startsWith('http') ? profileData.linkedIn : `https://${profileData.linkedIn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  >
                    {profileData.linkedIn}
                  </a>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">Not provided</p>
                )}
              </div>
              {profileData?.github && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">GitHub</p>
                  <a
                    href={profileData.github.startsWith('http') ? profileData.github : `https://${profileData.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  >
                    {profileData.github}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Position */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              Current Position
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Job Title</p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{profileData?.currentPosition || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.company || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.industry || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Education
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Degree</p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{profileData?.program || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Institution</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.institution || profileData?.college || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Graduation Year</p>
                <p className="text-gray-800 dark:text-gray-200">{profileData?.graduationYear || 'Not provided'}</p>
              </div>
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
              {formatSkills(profileData?.skills).length > 0 ? (
                formatSkills(profileData.skills).map((skill, index) => (
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

        {/* Work Experience Section */}
        {profileData?.workExperience && profileData.workExperience.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              Work Experience
            </h2>
            <div className="space-y-6">
              {profileData.workExperience.map((work, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{work.title || 'Position'}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {work.startYear || 'N/A'} - {work.endYear || 'Present'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{work.company || 'Company'}</p>
                  {work.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{work.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education History Section */}
        {profileData?.education && profileData.education.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Education History
            </h2>
            <div className="space-y-6">
              {profileData.education.map((edu, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{edu.degree || 'Degree'}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {edu.startYear || 'N/A'} - {edu.endYear || 'N/A'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{edu.institution || 'Institution'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;