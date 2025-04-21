import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Profile = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showFullBio, setShowFullBio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    college: "",
    role: "",
    bio: "",
    graduationYear: "",
    skills: "",
    linkedIn: "",
    github: "",
    phone: "",
    location: "",
    workExperience: [],
    education: [],
    program: "",
    currentYear: "",
    institution: "",
    enrollmentNumber: "",
    studentId: "",
    currentSemester: "",
    cgpa: "",
    gpa: "",
    interests: [],
    achievements: [],
    photoURL: ""
  });

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError('');

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();

          // Process skills data to handle both string and array formats
          const skillsData = data.skills ?
            (typeof data.skills === 'string' ?
              data.skills.split(',').map(skill => skill.trim()) :
              data.skills) :
            [];

          // Process interests data similarly
          const interestsData = data.interests ?
            (typeof data.interests === 'string' ?
              data.interests.split(',').map(interest => interest.trim()) :
              data.interests) :
            [];

          // Process achievements data similarly
          const achievementsData = data.achievements ?
            (typeof data.achievements === 'string' ?
              data.achievements.split(',').map(achievement => achievement.trim()) :
              data.achievements) :
            [];

          setUserData({
            name: data.name || currentUser.displayName || "",
            email: data.email || currentUser.email || "",
            college: data.college || "",
            role: data.role || "student",
            bio: data.bio || "",
            graduationYear: data.graduationYear || "",
            skills: skillsData,
            linkedIn: data.linkedIn || "",
            github: data.github || "",
            phone: data.phone || "",
            location: data.location || data.address || "",
            workExperience: data.workExperience || [],
            education: data.education || [],
            program: data.program || "",
            currentYear: data.currentYear || "",
            institution: data.institution || data.college || "",
            enrollmentNumber: data.enrollmentNumber || "",
            studentId: data.studentId || data.enrollmentNumber || "",
            currentSemester: data.currentSemester || "",
            cgpa: data.cgpa || "",
            gpa: data.gpa || data.cgpa || "",
            interests: interestsData,
            achievements: achievementsData,
            photoURL: data.photoURL || ""
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Generate initial for avatar
  const getInitial = () => {
    return userData?.name ? userData.name.charAt(0).toUpperCase() : 'S';
  };

  // Format skills for display
  const formatSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return skills.split(',').map(skill => skill.trim());
  };

  // Format interests for display
  const formatInterests = (interests) => {
    if (!interests) return [];
    if (Array.isArray(interests)) return interests;
    return interests.split(',').map(interest => interest.trim());
  };

  // Format achievements for display
  const formatAchievements = (achievements) => {
    if (!achievements) return [];
    if (Array.isArray(achievements)) return achievements;
    return achievements.split(',').map(achievement => achievement.trim());
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

  // Loading state display
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state display
  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold">Error Loading Profile</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Cover image/banner with improved design */}
      <div className="relative rounded-xl overflow-hidden h-56 mb-16">
        {/* Gradient background with pattern overlay */}
        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700 absolute">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoLTR2LTJoNHYtNGgydjRoNHYyaC00djR6Ii8+PHBhdGggZD0iTTAgMGg2MHY2MEgwVjB6TTMwIDYwQzEzLjQzMSA2MCAwIDQ2LjU2OSAwIDMwIDAgMTMuNDMxIDEzLjQzMSAwIDMwIDBjMTYuNTY5IDAgMzAgMTMuNDMxIDMwIDMwIDAgMTYuNTY5LTEzLjQzMSAzMC0zMCAzMHoiIGZpbGwtb3BhY2l0eT0iLjA0Ii8+PHBhdGggZD0iTTUgMzBoMnYySDV6TTMgMzRoMnYySDN6TTUgMzhoMnYySDV6TTEzIDMwaDJ2MmgtMnpNMTcgMzBoMnYyaC0yek0yMSAzMGgydjJoLTJ6TTI5IDMwaDJ2MmgtMnpNMzMgMzBoMnYyaC0yek0zNyAzMGgydjJoLTJ6TTQ1IDMwaDJ2MmgtMnpNNDkgMzBoMnYyaC0yek01MyAzMGgydjJoLTJ6TTU3IDMwaDJ2MmgtMnpNNjAgMzJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2NGgtMnYtMmgtMnYyaC0ydi0yaC0ydjJoLTJ2LTJoLTJ2MmgtMnYtMmgtMnYyaC0ydi0yaC0ydjJoLTJ2LTJoLTJ2MmgtMnYtMmgtMnYyaC0ydi0yaC0ydjJoLTJ2LTJoLTJ2MmgtMnYtMmgtMnYyaC0ydi0yaC0ydjJoLTJ2LTJoLTJ2MmgtMnYtMmgtMnYyaC0ydi0yaC0ydjJIMHYtNGgydi0ySDB2LTJoMnYtMkgwdi0yaDJ2LTJIMHYtMmgydi00aDJ2MmgyVjE4SDR2LTJIMnYtMmgydi0ySDJ2LTJoMlY4SDJWNmgyVjRoMlYyaDJ2MmgyVjJoMnYyaDJWMmgydjJoMlYyaDJ2MmgyVjJoMnYyaDJWMmgydjJoMlYyaDJ2MmgyVjJoMnYyaDJWMmgydjJoMlYyaDJ2MmgyVjJoMnYyaDJWMmgydjJoMlYyaDJ2NGgtMnYyaDJ2MmgtMnYyaDJ2MmgtMnYyaDJ2MmgtMnYyaDJ2MmgtMnYyaDJWMzJ6TTMgMmgydjJIM3pNMyA2aDJ2Mkgzek0zIDEwaDJ2Mkgzek0zIDE0aDJ2Mkgzek0zIDE4aDJ2Mkgzek0zIDIyaDJ2Mkgzek0zIDI2aDJ2Mkgzek01IDI0aDJ2Mkg1ek01IDIwaDJ2Mkg1ek01IDE2aDJ2Mkg1ek01IDEyaDJ2Mkg1ek01IDhoMnYySDV6TTUgNGgydjJINXpNOSAyaDJ2Mkg5ek05IDZoMnYySDl6TTkgMTBoMnYySDl6TTkgMTRoMnYySDl6TTkgMThoMnYySDl6TTkgMjJoMnYySDl6TTkgMjZoMnYySDl6TTkgMzBoMnYySDl6TTkgMzRoMnYySDl6TTkgMzhoMnYySDl6TTEzIDM4aDJ2MmgtMnpNMTMgMzRoMnYyaC0yek0xMyAyNmgydjJoLTJ6TTEzIDIyaDJ2MmgtMnpNMTMgMThoMnYyaC0yek0xMyAxNGgydjJoLTJ6TTEzIDEwaDJ2MmgtMnpNMTMgNmgydjJoLTJ6TTEzIDJoMnYyaC0yek0xNyAzOGgydjJoLTJ6TTE3IDM0aDJ2MmgtMnpNMTcgMzBoMnYyaC0yek0xNyAyNmgydjJoLTJ6TTE3IDIyaDJ2MmgtMnpNMTcgMThoMnYyaC0yek0xNyAxNGgydjJoLTJ6TTE3IDEwaDJ2MmgtMnpNMTcgNmgydjJoLTJ6TTE3IDJoMnYyaC0yek0yMSAzOGgydjJoLTJ6TTIxIDM0aDJ2MmgtMnpNMjEgMjZoMnYyaC0yek0yMSAyMmgydjJoLTJ6TTIxIDE4aDJ2MmgtMnpNMjEgMTRoMnYyaC0yek0yMSAxMGgydjJoLTJ6TTIxIDZoMnYyaC0yek0yMSAyaDJ2MmgtMnpNMjUgMzhoMnYyaC0yek0yNSAzNGgydjJoLTJ6TTI1IDMwaDJ2MmgtMnpNMjUgMjZoMnYyaC0yek0yNSAyMmgydjJoLTJ6TTI1IDE4aDJ2MmgtMnpNMjUgMTRoMnYyaC0yek0yNSAxMGgydjJoLTJ6TTI1IDZoMnYyaC0yek0yNSAyaDJ2MmgtMnpNMjkgMzhoMnYyaC0yek0yOSAzNGgydjJoLTJ6TTI5IDI2aDJ2MmgtMnpNMjkgMjJoMnYyaC0yek0yOSAxOGgydjJoLTJ6TTI5IDE0aDJ2MmgtMnpNMjkgMTBoMnYyaC0yek0yOSA2aDJ2MmgtMnpNMjkgMmgydjJoLTJ6TTMzIDM4aDJ2MmgtMnpNMzMgMzRoMnYyaC0yek0zMyAzMGgydjJoLTJ6TTMzIDI2aDJ2MmgtMnpNMzMgMjJoMnYyaC0yek0zMyAxOGgydjJoLTJ6TTMzIDE0aDJ2MmgtMnpNMzMgMTBoMnYyaC0yek0zMyA2aDJ2MmgtMnpNMzMgMmgydjJoLTJ6TTM3IDM4aDJ2MmgtMnpNMzcgMzRoMnYyaC0yek0zNyAyNmgydjJoLTJ6TTM3IDIyaDJ2MmgtMnpNMzcgMThoMnYyaC0yek0zNyAxNGgydjJoLTJ6TTM3IDEwaDJ2MmgtMnpNMzcgNmgydjJoLTJ6TTM3IDJoMnYyaC0yek00MSAzOGgydjJoLTJ6TTQxIDM0aDJ2MmgtMnpNNDEgMzBoMnYyaC0yek00MSAyNmgydjJoLTJ6TTQxIDIyaDJ2MmgtMnpNNDEgMThoMnYyaC0yek00MSAxNGgydjJoLTJ6TTQxIDEwaDJ2MmgtMnpNNDEgNmgydjJoLTJ6TTQxIDJoMnYyaC0yek00NSAzOGgydjJoLTJ6TTQ1IDM0aDJ2MmgtMnpNNDUgMjZoMnYyaC0yek00NSAyMmgydjJoLTJ6TTQ1IDE4aDJ2MmgtMnpNNDUgMTRoMnYyaC0yek00NSAxMGgydjJoLTJ6TTQ1IDZoMnYyaC0yek00NSAyaDJ2MmgtMnpNNDkgMzhoMnYyaC0yek00OSAzNGgydjJoLTJ6TTQ5IDMwaDJ2MmgtMnpNNDkgMjZoMnYyaC0yek00OSAyMmgydjJoLTJ6TTQ5IDE4aDJ2MmgtMnpNNDkgMTRoMnYyaC0yek00OSAxMGgydjJoLTJ6TTQ5IDZoMnYyaC0yek00OSAyaDJ2MmgtMnpNNTMgMzhoMnYyaC0yek01MyAzNGgydjJoLTJ6TTUzIDMwaDJ2MmgtMnpNNTMgMjZoMnYyaC0yek01MyAyMmgydjJoLTJ6TTUzIDE4aDJ2MmgtMnpNNTMgMTRoMnYyaC0yek01MyAxMGgydjJoLTJ6TTUzIDZoMnYyaC0yek01MyAyaDJ2MmgtMnpNNTcgMzhoMnYyaC0yek01NyAzNGgydjJoLTJ6TTU3IDMwaDJ2MmgtMnpNNTcgMjZoMnYyaC0yek01NyAyMmgydjJoLTJ6TTU3IDE4aDJ2MmgtMnpNNTcgMTRoMnYyaC0yek01NyAxMGgydjJoLTJ6TTU3IDZoMnYyaC0yek01NyAyaDJ2MmgtMnoiLz48L2c+PC9zdmc+')]">
          </div>
        </div>

        {/* Student status badge */}
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-white/30">
          {userData?.currentYear ? `${userData.currentYear} Year Student` : 'Student'}
        </div>

        {/* Profile avatar - positioned to overlap the banner */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg">
              {userData?.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={`${userData?.name || 'User'}'s avatar`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 flex items-center justify-center text-4xl font-bold text-white">
                  {getInitial()}
                </div>
              )}
            </div>

            {/* Edit overlay button for profile picture */}
            <button
              onClick={() => navigate('/profile')}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Edit Cover button */}
        <button
          onClick={() => navigate('/profile')}
          className="absolute top-4 right-4 bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm transition shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Main profile content */}
      <div className="pl-8 pr-8">
        {/* Profile header with improved design */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-6 sm:mt-0 mb-6">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {userData?.name || 'Student User'}
              </h1>
              {userData?.enrollmentNumber && (
                <span className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  ID: {userData.enrollmentNumber}
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Student at {userData?.institution || userData?.college || 'University'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {userData?.email || 'Email not provided'}
            </p>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Quick info pills with improved design */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-200 dark:border-blue-800/30 shadow-sm">
            <div className="font-medium mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Graduation Year
            </div>
            <div className="text-base">{userData?.graduationYear || 'Not specified'}</div>
          </div>

          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm border border-purple-200 dark:border-purple-800/30 shadow-sm">
            <div className="font-medium mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
              Program
            </div>
            <div className="text-base">{userData?.program || 'Not specified'}</div>
          </div>

          <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-700 dark:text-green-300 rounded-lg text-sm border border-green-200 dark:border-green-800/30 shadow-sm">
            <div className="font-medium mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Current Year
            </div>
            <div className="text-base">{userData?.currentYear || 'Not specified'}</div>
          </div>

          {userData?.gpa && (
            <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm border border-amber-200 dark:border-amber-800/30 shadow-sm">
              <div className="font-medium mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                GPA
              </div>
              <div className="text-base">{userData.gpa}</div>
            </div>
          )}
        </div>

        {/* Profile content in sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* About section with improved design */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              About Me
            </h2>
            <div className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              {renderBio(userData?.bio || '')}
              {!userData?.bio && (
                <div className="flex items-start mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-amber-700 dark:text-amber-300">
                    Adding a bio helps others learn more about you. Click the Edit Profile button to add your bio.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information with improved design */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-800 dark:text-gray-200 break-all font-medium">{userData?.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{userData?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student ID</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{userData?.studentId || userData?.enrollmentNumber || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">LinkedIn</p>
                  {userData?.linkedIn ? (
                    <a
                      href={userData.linkedIn.startsWith('http') ? userData.linkedIn : `https://${userData.linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
                    >
                      {userData.linkedIn}
                    </a>
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">Not provided</p>
                  )}
                </div>
              </div>

              {userData?.github && (
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">GitHub</p>
                    <a
                      href={userData.github.startsWith('http') ? userData.github : `https://${userData.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
                    >
                      {userData.github}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Academic Information with improved design */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Academic Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Program</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{userData?.program || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Year/Semester</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{userData?.currentYear || userData?.currentSemester || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Institution</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{userData?.institution || userData?.college || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">GPA/Academic Standing</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{userData?.gpa || userData?.cgpa || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Areas of Interest with improved design */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              Areas of Interest
            </h2>
            <div className="flex flex-wrap gap-2">
              {formatInterests(userData?.interests).length > 0 ? (
                formatInterests(userData.interests).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition-colors"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  No interests listed. Add your interests to help find relevant opportunities.
                </div>
              )}
            </div>
          </div>

          {/* Skills with improved design */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {formatSkills(userData?.skills).length > 0 ? (
                formatSkills(userData.skills).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  No skills listed. Add your skills to showcase your expertise.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Education History Section with improved design */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Education History
          </h2>

          {userData?.education && userData.education.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {userData.education.map((edu, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{edu.degree || 'Degree'}</h3>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800/30">
                        {edu.startYear || 'N/A'} - {edu.endYear || 'N/A'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">{edu.institution || 'Institution'}</p>
                    </div>
                    {edu.description && (
                      <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full inline-block mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Education History</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Add your education history to showcase your academic background. Click the Edit Profile button to add your education details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons at bottom */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center font-medium group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Find a Mentor
          </button>

          <button onClick={() => navigate('/profile')} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center font-medium group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Complete Your Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;