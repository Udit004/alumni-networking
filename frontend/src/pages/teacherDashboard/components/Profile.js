import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ profileData = {}, currentUser, isDarkMode }) => {
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);

  const handleEditProfile = () => {
    navigate('/profile');
  };

  // Format skills/expertise for display - handling both string and array formats
  const formatSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    // For string format, split by comma and trim each skill
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Profile Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 relative">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
        <button
          onClick={handleEditProfile}
          className="absolute top-4 right-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm transition shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Main profile content */}
      <div className="p-6">
        {/* Profile header with avatar */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-blue-500 -mt-12 border-4 border-white dark:border-gray-800 shadow-lg">
            {profileData?.name ? profileData.name.charAt(0).toUpperCase() : "T"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profileData?.name || 'Faculty Member'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {profileData?.designation || profileData?.jobTitle || 'Professor'} at {profileData?.department || 'Department'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {profileData?.email || 'Email not provided'}
            </p>
          </div>
        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Department</div>
            <div className="text-gray-900 dark:text-white">{profileData?.department || 'Not specified'}</div>
          </div>

          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Office Hours</div>
            <div className="text-gray-900 dark:text-white">
              {profileData?.officeHours ? 
                (Array.isArray(profileData.officeHours) ? 
                  profileData.officeHours.map(oh => `${oh.day}: ${oh.time}`).join(', ') : 
                  profileData.officeHours) : 
                'Not specified'}
            </div>
          </div>

          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Location</div>
            <div className="text-gray-900 dark:text-white">{profileData?.officeLocation || profileData?.location || 'Not specified'}</div>
          </div>
          
          <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">College</div>
            <div className="text-gray-900 dark:text-white">{profileData?.college || 'Not specified'}</div>
          </div>
          
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Phone</div>
            <div className="text-gray-900 dark:text-white">{profileData?.phone || 'Not specified'}</div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          {renderBio(profileData?.bio)}
        </div>

        {/* Expertise/Skills Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {formatSkills(profileData?.skills).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
            {formatSkills(profileData?.skills).length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">No skills or expertise listed</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        {(profileData?.linkedIn || profileData?.github) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Profiles</h2>
            <div className="flex flex-wrap gap-3">
              {profileData?.linkedIn && (
                <a 
                  href={profileData.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {profileData?.github && (
                <a 
                  href={profileData.github}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Courses Teaching</h2>
          <div className="space-y-2">
            {profileData?.coursesTaught ? (
              profileData.coursesTaught.split(',').map((course, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  {course.trim()}
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No courses listed</p>
            )}
          </div>
        </div>

        {/* Research Interests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Research Interests</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {profileData?.researchInterests || 'No research interests specified'}
          </p>
        </div>

        {/* Education Section */}
        {profileData?.education && profileData.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
            <div className="space-y-4">
              {profileData.education.map((edu, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{edu.degree}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">{edu.startYear} - {edu.endYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience Section */}
        {profileData?.workExperience && profileData.workExperience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Work Experience</h2>
            <div className="space-y-4">
              {profileData.workExperience.map((work, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{work.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{work.company}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">{work.startYear} - {work.endYear || 'Present'}</p>
                  {work.description && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{work.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Publications</h2>
          <div className="space-y-4">
            {profileData?.publications && profileData.publications.length > 0 ? (
              profileData.publications.map((pub, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{pub.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{pub.journal}, {pub.year}</p>
                  {pub.link && (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block"
                    >
                      View Publication →
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No publications listed</p>
            )}
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Certifications</h2>
          <div className="space-y-4">
            {profileData?.certifications && profileData.certifications.length > 0 ? (
              profileData.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{cert.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{cert.issuer}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">{cert.year}</p>
                  {cert.description && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{cert.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No certifications listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 