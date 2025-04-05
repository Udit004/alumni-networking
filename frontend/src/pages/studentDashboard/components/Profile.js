import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ profileData = {}, currentUser, isDarkMode }) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/profile');
  };

  // Generate initial for avatar
  const getInitial = () => {
    return profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'S';
  };

  return (
    <div className="student-profile">
      {/* Profile Header Banner */}
      <div className="bg-blue-600 dark:bg-blue-800 rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
              {getInitial()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profileData?.name || "Student Name"}</h2>
              <p className="text-blue-100">student</p>
              <p className="text-blue-100">{profileData?.email || "student@example.com"}</p>
            </div>
          </div>
          <button
            onClick={handleEditProfile}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.name || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email (cannot be changed)</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.email || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.phone || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.address || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Program</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.program || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">College</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.institution || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Batch</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.batch || "Not provided"}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Graduation Year</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.graduationYear || profileData?.admissionYear || "Not provided"}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {profileData?.bio || "Tell us about yourself..."}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Skills (comma separated)</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              {Array.isArray(profileData?.skills) && profileData.skills.length > 0 
                ? profileData.skills.join(', ') 
                : "JavaScript, C, Python, React"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 