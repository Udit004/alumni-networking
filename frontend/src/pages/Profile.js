import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './Profile.css';

const Profile = () => {
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
    jobTitle: "",
    company: "",
    phone: "",
    location: "",
    workExperience: [],
    education: [],
    // Teacher-specific fields
    department: "",
    coursesTaught: "",
    officeHours: "",
    officeLocation: "",
    researchInterests: "",
    publications: [],
    certifications: []
  });
  const [editing, setEditing] = useState(true); // Start in edit mode
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
        console.log("Profile: Fetching data for user:", currentUser.uid);
        console.log("Using auth context from:", "../context/AuthContext");
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("Profile: User data fetched:", data);
          setUserData(prev => ({ 
            ...prev, 
            ...data,
            skills: data.skills ? (typeof data.skills === 'string' ? data.skills : data.skills.join(', ')) : '',
            workExperience: data.workExperience || [],
            education: data.education || [],
            department: data.department || "",
            coursesTaught: data.coursesTaught || "",
            officeHours: data.officeHours || "",
            officeLocation: data.officeLocation || "",
            researchInterests: data.researchInterests || "",
            publications: data.publications || [],
            certifications: data.certifications || []
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

  const addWorkExperience = () => {
    const newWorkExperience = {
      title: '',
      company: '',
      startYear: '',
      endYear: '',
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

  const addPublication = () => {
    const newPublication = {
      title: '',
      journal: '',
      year: '',
      link: ''
    };
    setUserData(prev => ({
      ...prev,
      publications: [...prev.publications, newPublication]
    }));
  };

  const updatePublication = (index, field, value) => {
    setUserData(prev => {
      const updatedPublications = [...prev.publications];
      updatedPublications[index] = {
        ...updatedPublications[index],
        [field]: value
      };
      return {
        ...prev,
        publications: updatedPublications
      };
    });
  };

  const removePublication = (index) => {
    setUserData(prev => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    const newCertification = {
      name: '',
      issuer: '',
      year: '',
      description: ''
    };
    setUserData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const updateCertification = (index, field, value) => {
    setUserData(prev => {
      const updatedCertifications = [...prev.certifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        [field]: value
      };
      return {
        ...prev,
        certifications: updatedCertifications
      };
    });
  };

  const removeCertification = (index) => {
    setUserData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (currentUser) {
      try {
        setSaving(true);
        const userRef = doc(db, "users", currentUser.uid);
        
        // Prepare skills data for saving (handle both string and array formats)
        const skillsToSave = typeof userData.skills === 'string' 
          ? userData.skills 
          : userData.skills.join(', ');
        
        // Log the data being saved
        const dataToSave = {
          name: userData.name,
          college: userData.college,
          bio: userData.bio,
          graduationYear: userData.graduationYear,
          skills: skillsToSave,
          linkedIn: userData.linkedIn,
          github: userData.github,
          jobTitle: userData.jobTitle,
          company: userData.company,
          phone: userData.phone,
          location: userData.location,
          workExperience: userData.workExperience,
          education: userData.education,
          department: userData.department,
          coursesTaught: userData.coursesTaught,
          officeHours: userData.officeHours,
          officeLocation: userData.officeLocation,
          researchInterests: userData.researchInterests,
          publications: userData.publications,
          certifications: userData.certifications
        };
        
        console.log("Saving user data to Firestore:", dataToSave);
        await updateDoc(userRef, dataToSave);
        
        setEditing(false);
        
        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        
        // Redirect to appropriate dashboard based on user role
        setTimeout(() => {
          successMessage.classList.add('hidden');
          // Navigate to the appropriate dashboard based on user role
          if (userData.role === 'student') {
            navigate('/student-dashboard');
          } else if (userData.role === 'teacher') {
            navigate('/teacher-dashboard');
          } else if (userData.role === 'alumni') {
            navigate('/alumni-dashboard');
          }
        }, 1500);
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
        <div id="successMessage" className="hidden fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
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
                {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
                <p className="text-blue-100">{userData.jobTitle ? `${userData.jobTitle}${userData.company ? ` at ${userData.company}` : ''}` : userData.role}</p>
                <p className="text-blue-100">{userData.email}</p>
              </div>
              <div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                )}
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
                    disabled={!editing}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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

                {(userData.role === 'alumni' || userData.role === 'teacher') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={userData.jobTitle}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g., Software Engineer"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {userData.role === 'alumni' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={userData.company}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g., Google"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={userData.college}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>

                {(userData.role === 'student' || userData.role === 'alumni') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    name="graduationYear"
                    value={userData.graduationYear}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="e.g., 2024"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
                )}
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
                    disabled={!editing}
                    placeholder="e.g., +1 234 567 8900"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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
                    disabled={!editing}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={userData.linkedIn || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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
                    disabled={!editing}
                    placeholder="https://github.com/yourusername"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
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
                disabled={!editing}
                rows="3"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
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
                disabled={!editing}
                placeholder="e.g., JavaScript, React, Node.js"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Work Experience - Only for Alumni and Teachers */}
            {(userData.role === 'alumni' || userData.role === 'teacher') && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                    Work Experience
                  </label>
                  {editing && (
                    <button
                      type="button"
                      onClick={addWorkExperience}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                    >
                      + Add
                    </button>
                  )}
                </div>
                
                {userData.workExperience.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No work experience added yet.</p>
                ) : (
                  userData.workExperience.map((work, index) => (
                    <div 
                      key={index} 
                      className="p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      {editing ? (
                        <>
                          <div className="flex justify-between mb-2">
                            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Position {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeWorkExperience(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Job Title
                              </label>
                              <input
                                type="text"
                                value={work.title || ''}
                                onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                                placeholder="e.g., Software Engineer"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Company
                              </label>
                              <input
                                type="text"
                                value={work.company || ''}
                                onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                                placeholder="e.g., Google"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Year
                              </label>
                              <input
                                type="text"
                                value={work.startYear || ''}
                                onChange={(e) => updateWorkExperience(index, 'startYear', e.target.value)}
                                placeholder="e.g., 2018"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                End Year (or "Present")
                              </label>
                              <input
                                type="text"
                                value={work.endYear || ''}
                                onChange={(e) => updateWorkExperience(index, 'endYear', e.target.value)}
                                placeholder="e.g., 2022 or Present"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              value={work.description || ''}
                              onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                              rows="2"
                              placeholder="Briefly describe your responsibilities and achievements"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            ></textarea>
                          </div>
                        </>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{work.title}</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{work.startYear} - {work.endYear || 'Present'}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">{work.company}</p>
                          <p className="text-gray-700 dark:text-gray-300">{work.description}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Education */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                  Education
                </label>
                {editing && (
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                  >
                    + Add
                  </button>
                )}
              </div>
              
              {userData.education.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No education added yet.</p>
              ) : (
                userData.education.map((edu, index) => (
                  <div 
                    key={index} 
                    className="p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    {editing ? (
                      <>
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
                              placeholder="e.g., Bachelor of Science in Computer Science"
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
                              placeholder="e.g., Stanford University"
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
                              placeholder="e.g., 2014"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              End Year
                            </label>
                            <input
                              type="text"
                              value={edu.endYear || ''}
                              onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                              placeholder="e.g., 2018"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{edu.degree}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{edu.startYear} - {edu.endYear}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Teacher-specific fields */}
            {userData.role === 'teacher' && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                    Teacher Information
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={userData.department || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g., Computer Science"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Courses Taught
                    </label>
                    <input
                      type="text"
                      name="coursesTaught"
                      value={userData.coursesTaught || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g., Data Structures, Algorithms"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Office Hours
                    </label>
                    <input
                      type="text"
                      name="officeHours"
                      value={userData.officeHours || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g., Mon, Wed: 10AM - 12PM"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Office Location
                    </label>
                    <input
                      type="text"
                      name="officeLocation"
                      value={userData.officeLocation || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g., Room 301, Building B"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Research Interests
                    </label>
                    <input
                      type="text"
                      name="researchInterests"
                      value={userData.researchInterests || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g., Machine Learning, Data Mining"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Publications Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                      Publications
                    </label>
                    {editing && (
                      <button
                        type="button"
                        onClick={addPublication}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  
                  {userData.publications.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No publications added yet.</p>
                  ) : (
                    userData.publications.map((pub, index) => (
                      <div 
                        key={index} 
                        className="p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        {editing ? (
                          <>
                            <div className="flex justify-between mb-2">
                              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Publication {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removePublication(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={pub.title || ''}
                                  onChange={(e) => updatePublication(index, 'title', e.target.value)}
                                  placeholder="e.g., Machine Learning in Education"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Journal/Conference
                                </label>
                                <input
                                  type="text"
                                  value={pub.journal || ''}
                                  onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                                  placeholder="e.g., IEEE Conference on Education"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Year
                                </label>
                                <input
                                  type="text"
                                  value={pub.year || ''}
                                  onChange={(e) => updatePublication(index, 'year', e.target.value)}
                                  placeholder="e.g., 2023"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Link
                                </label>
                                <input
                                  type="url"
                                  value={pub.link || ''}
                                  onChange={(e) => updatePublication(index, 'link', e.target.value)}
                                  placeholder="e.g., https://doi.org/..."
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{pub.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400">{pub.journal}, {pub.year}</p>
                            {pub.link && (
                              <a 
                                href={pub.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:underline"
                              >
                                View Publication
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {/* Certifications Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                      Certifications
                    </label>
                    {editing && (
                      <button
                        type="button"
                        onClick={addCertification}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  
                  {userData.certifications.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No certifications added yet.</p>
                  ) : (
                    userData.certifications.map((cert, index) => (
                      <div 
                        key={index} 
                        className="p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        {editing ? (
                          <>
                            <div className="flex justify-between mb-2">
                              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Certification {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeCertification(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Certificate Name
                                </label>
                                <input
                                  type="text"
                                  value={cert.name || ''}
                                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                  placeholder="e.g., Teaching Certification"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Issuing Organization
                                </label>
                                <input
                                  type="text"
                                  value={cert.issuer || ''}
                                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                  placeholder="e.g., Board of Education"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Year
                                </label>
                                <input
                                  type="text"
                                  value={cert.year || ''}
                                  onChange={(e) => updateCertification(index, 'year', e.target.value)}
                                  placeholder="e.g., 2020"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={cert.description || ''}
                                  onChange={(e) => updateCertification(index, 'description', e.target.value)}
                                  placeholder="e.g., Certified to teach Computer Science"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{cert.name}</h4>
                            <p className="text-gray-600 dark:text-gray-400">{cert.issuer} - {cert.year}</p>
                            {cert.description && (
                              <p className="text-gray-700 dark:text-gray-300 mt-1">{cert.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - Bottom */}
            <div className="flex justify-end">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
