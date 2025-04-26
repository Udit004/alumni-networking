import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './Profile.css';

const StudentEditProfile = () => {
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    // Monitor dark mode changes
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

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("StudentEditProfile: Fetching data for user:", currentUser.uid);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("StudentEditProfile: User data fetched:", data);

          // Format skills data for form display
          const skillsData = Array.isArray(data.skills)
            ? data.skills.join(', ')
            : data.skills || '';

          // Format interests for form display
          const interestsData = Array.isArray(data.interests)
            ? data.interests.join(', ')
            : data.interests || '';

          // Format achievements for form display
          const achievementsData = Array.isArray(data.achievements)
            ? data.achievements.join(', ')
            : data.achievements || '';

          setUserData(prev => ({
            ...prev,
            ...data,
            skills: skillsData,
            interests: interestsData,
            achievements: achievementsData,
            education: data.education || [],
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const addEducation = () => {
    const newEducation = {
      degree: '',
      institution: '',
      startYear: '',
      endYear: ''
    };
    setUserData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (index, field, value) => {
    setUserData(prev => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: updatedEducation
      };
    });
  };

  const removeEducation = (index) => {
    setUserData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addWorkExperience = () => {
    const newWorkExperience = {
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setUserData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newWorkExperience]
    }));
  };

  const updateWorkExperience = (index, field, value) => {
    setUserData(prev => {
      const updatedWorkExperience = [...prev.workExperience];
      updatedWorkExperience[index] = {
        ...updatedWorkExperience[index],
        [field]: value
      };
      return {
        ...prev,
        workExperience: updatedWorkExperience
      };
    });
  };

  const removeWorkExperience = (index) => {
    setUserData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (currentUser) {
      try {
        setSaving(true);
        const userRef = doc(db, "users", currentUser.uid);

        // Prepare skills data for saving (handle both string and array formats)
        const skillsToSave = typeof userData.skills === 'string'
          ? userData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
          : userData.skills;

        // Prepare interests data for saving
        const interestsToSave = typeof userData.interests === 'string'
          ? userData.interests.split(',').map(interest => interest.trim()).filter(Boolean)
          : userData.interests;

        // Prepare achievements data for saving
        const achievementsToSave = typeof userData.achievements === 'string'
          ? userData.achievements.split(',').map(achievement => achievement.trim()).filter(Boolean)
          : userData.achievements;

        // Log the data being saved
        const dataToSave = {
          name: userData.name,
          college: userData.college,
          bio: userData.bio,
          graduationYear: userData.graduationYear,
          skills: skillsToSave,
          linkedIn: userData.linkedIn,
          github: userData.github,
          phone: userData.phone,
          location: userData.location,
          education: userData.education,
          program: userData.program,
          currentYear: userData.currentYear,
          institution: userData.institution,
          enrollmentNumber: userData.enrollmentNumber,
          studentId: userData.studentId,
          currentSemester: userData.currentSemester,
          cgpa: userData.cgpa,
          gpa: userData.gpa,
          interests: interestsToSave,
          achievements: achievementsToSave,
          workExperience: userData.workExperience
        };

        console.log("Saving student data to Firestore:", dataToSave);
        await updateDoc(userRef, dataToSave);

        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        successMessage.textContent = "Profile updated successfully! Redirecting to your profile...";

        // Hide success message after 2 seconds and redirect to student dashboard
        setTimeout(() => {
          successMessage.classList.add('hidden');

          // Navigate to student dashboard profile section with proper state
          // Add refreshProfile flag to force profile data refresh
          navigate('/student-dashboard', {
            state: {
              activeSection: 'profile',
              fromProfileEdit: true,
              refreshProfile: true, // Add this flag to trigger profile refresh
              timestamp: Date.now() // Add timestamp to ensure state change is detected
            },
            replace: true // Use replace to prevent back button from returning to edit page
          });
        }, 2000);
      } catch (error) {
        console.error("Error updating profile:", error);
        // Show error message
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
          errorMessage.classList.add('hidden');
        }, 3000);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div id="successMessage" className="hidden fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Profile updated successfully!
        </div>

        {/* Error Message */}
        <div id="errorMessage" className="hidden fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Failed to update profile. Please try again.
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-blue-500">
                {userData.name ? userData.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">Edit Your Profile</h1>
                <p className="text-blue-100">{userData.email}</p>
                <p className="text-blue-100">Student{userData.currentYear ? ` - ${userData.currentYear} Year` : ''}</p>
              </div>
              <div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email (cannot be changed)
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College/Institution
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={userData.institution || ''}
                    onChange={handleChange}
                    placeholder="Your college or university"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Program/Major
                  </label>
                  <input
                    type="text"
                    name="program"
                    value={userData.program || ''}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Year
                  </label>
                  <input
                    type="text"
                    name="currentYear"
                    value={userData.currentYear || ''}
                    onChange={handleChange}
                    placeholder="e.g., 2nd"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    name="graduationYear"
                    value={userData.graduationYear || ''}
                    onChange={handleChange}
                    placeholder="e.g., 2024"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Contact & Additional Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone || ''}
                    onChange={handleChange}
                    placeholder="e.g., +1 234 567 8900"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={userData.location || ''}
                    onChange={handleChange}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={userData.studentId || ''}
                    onChange={handleChange}
                    placeholder="Your student ID number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    name="enrollmentNumber"
                    value={userData.enrollmentNumber || ''}
                    onChange={handleChange}
                    placeholder="Your enrollment number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Semester
                  </label>
                  <input
                    type="text"
                    name="currentSemester"
                    value={userData.currentSemester || ''}
                    onChange={handleChange}
                    placeholder="e.g., Fall 2023"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CGPA
                  </label>
                  <input
                    type="text"
                    name="cgpa"
                    value={userData.cgpa || ''}
                    onChange={handleChange}
                    placeholder="e.g., 3.8"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GPA
                  </label>
                  <input
                    type="text"
                    name="gpa"
                    value={userData.gpa || ''}
                    onChange={handleChange}
                    placeholder="e.g., 3.9"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedIn"
                  value={userData.linkedIn || ''}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourusername"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  name="github"
                  value={userData.github || ''}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={userData.bio || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={userData.skills || ''}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Python"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Areas of Interest */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Areas of Interest (comma separated)
              </label>
              <input
                type="text"
                name="interests"
                value={userData.interests || ''}
                onChange={handleChange}
                placeholder="e.g., Machine Learning, Web Development, Data Science"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Achievements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Achievements (comma separated)
              </label>
              <input
                type="text"
                name="achievements"
                value={userData.achievements || ''}
                onChange={handleChange}
                placeholder="e.g., Dean's List, Hackathon Winner, Scholarship Recipient"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                  Education
                </label>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  + Add
                </button>
              </div>

              {userData.education.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No education added yet.</p>
              ) : (
                userData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Education {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="e.g., Bachelor of Science"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="e.g., University of California"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Year
                        </label>
                        <input
                          type="text"
                          value={edu.startYear || ''}
                          onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                          placeholder="e.g., 2020"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Year (or "Present")
                        </label>
                        <input
                          type="text"
                          value={edu.endYear || ''}
                          onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                          placeholder="e.g., 2024 or Present"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Work Experience */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                  Work Experience
                </label>
                <button
                  type="button"
                  onClick={addWorkExperience}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  + Add
                </button>
              </div>

              {userData.workExperience.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No work experience added yet.</p>
              ) : (
                userData.workExperience.map((exp, index) => (
                  <div
                    key={index}
                    className="p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Experience {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeWorkExperience(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={exp.position || ''}
                          onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                          placeholder="e.g., Software Engineer Intern"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                          placeholder="e.g., Google"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                          placeholder="e.g., June 2022"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date (or "Present")
                        </label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                          placeholder="e.g., August 2022 or Present"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={exp.description || ''}
                          onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows="3"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEditProfile;