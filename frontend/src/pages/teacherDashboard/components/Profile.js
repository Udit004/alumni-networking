import React from 'react';

const Profile = ({ profileData, isDarkMode, navigate }) => {
  return (
    <div className="profile-section space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="flex flex-col items-center text-center">
              <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl mb-4 overflow-hidden">
                {profileData?.photoURL ? (
                  <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profileData?.name ? profileData.name[0].toUpperCase() : '👤'
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{profileData?.name || 'Teacher Name'}</h2>
              <p className="text-gray-600 dark:text-gray-400">{profileData?.designation || 'Professor'}, {profileData?.department || 'Department'}</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </button>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</h3>
                <p className="text-gray-900 dark:text-white">{profileData?.email || 'teacher@example.com'}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Phone</h3>
                <p className="text-gray-900 dark:text-white">{profileData?.phone || 'Not provided'}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Department</h3>
                <p className="text-gray-900 dark:text-white">{profileData?.department || 'Not provided'}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Institution</h3>
                <p className="text-gray-900 dark:text-white">{profileData?.institution || 'Not provided'}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Address</h3>
                <p className="text-gray-900 dark:text-white">{profileData?.address || 'Not provided'}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-1">
                  {profileData?.expertise && profileData.expertise.length > 0 ? (
                    profileData.expertise.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-900 dark:text-white">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profileData?.bio && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">About Me</h3>
          <p className="text-gray-700 dark:text-gray-300">{profileData.bio}</p>
        </div>
      )}

      {/* Publications Section */}
      {profileData?.publications && profileData.publications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Publications</h3>
          <ul className="space-y-3">
            {profileData.publications.map((publication, index) => (
              <li key={index} className="pl-4 border-l-2 border-blue-500">
                <p className="text-gray-800 dark:text-white font-medium">{publication.title || publication}</p>
                {publication.journal && <p className="text-gray-600 dark:text-gray-400 text-sm">{publication.journal}</p>}
                {publication.year && <p className="text-gray-500 dark:text-gray-500 text-xs">{publication.year}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Achievements Section */}
      {profileData?.achievements && profileData.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Achievements</h3>
          <ul className="space-y-3">
            {profileData.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-yellow-500">🏆</span>
                <p className="text-gray-800 dark:text-white">{achievement.title || achievement}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Profile; 