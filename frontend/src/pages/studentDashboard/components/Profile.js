import React from 'react';

const Profile = ({ profileData, currentUser, isDarkMode }) => {
  return (
    <div className="student-profile">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Student Profile</h2>
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="profile-avatar h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl mb-4 md:mb-0 md:mr-6">
              {profileData.name ? profileData.name.charAt(0).toUpperCase() : '👤'}
            </div>
            
            <div className="flex-1 md:flex md:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{profileData.name || "Student Name"}</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{profileData.program || "Program"} | {profileData.currentSemester || "Semester"}</p>
                
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl mb-4">
                  {profileData.bio || "No bio available"}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">No skills listed</span>
                  )}
                </div>
              </div>
              
              <div className="md:self-start mt-4 md:mt-0">
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</h3>
              <p className="text-gray-800 dark:text-white">{profileData.name || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</h3>
              <p className="text-gray-800 dark:text-white">{profileData.email || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</h3>
              <p className="text-gray-800 dark:text-white">{profileData.phone || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Birth</h3>
              <p className="text-gray-800 dark:text-white">{profileData.dateOfBirth || "Not provided"}</p>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</h3>
              <p className="text-gray-800 dark:text-white">{profileData.address || "Not provided"}</p>
            </div>
          </div>
        </div>
        
        {/* Academic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Academic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Enrollment Number</h3>
              <p className="text-gray-800 dark:text-white">{profileData.enrollmentNumber || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Program</h3>
              <p className="text-gray-800 dark:text-white">{profileData.program || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Admission Year</h3>
              <p className="text-gray-800 dark:text-white">{profileData.admissionYear || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Batch</h3>
              <p className="text-gray-800 dark:text-white">{profileData.batch || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Semester</h3>
              <p className="text-gray-800 dark:text-white">{profileData.currentSemester || "Not provided"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CGPA</h3>
              <p className="text-gray-800 dark:text-white">{profileData.cgpa || "Not provided"}</p>
            </div>
          </div>
        </div>
        
        {/* Skills & Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Skills & Achievements</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                profileData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No skills listed</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Achievements</h3>
            {Array.isArray(profileData.achievements) && profileData.achievements.length > 0 ? (
              <div className="space-y-4">
                {profileData.achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="text-2xl text-yellow-500">🏆</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{achievement.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{achievement.date}</p>
                      <p className="text-gray-700 dark:text-gray-300">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No achievements added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 